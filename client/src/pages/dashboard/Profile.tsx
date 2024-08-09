import { Alert, Button, Modal, Spinner, TextInput } from "flowbite-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { app } from "../../firebase";
import {
  deleteFailure,
  deleteStart,
  deleteSuccess,
  signOutSuccess,
  updateFailure,
  updateStart,
  updateSuccess,
} from "../../redux/user/userSlice";
import { getAuth, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User } from "./../../redux/user/userSlice";
import { RootState } from "../../redux/store";

export default function Profile() {
  const { currentUser, error, loading } = useSelector(
    (state: RootState) => state.user
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(currentUser.imageUrl);
  const [imageFileUploadProcess, setImageFileUploadProcess] = useState<
    number | null
  >(null);
  const [imageFileUploadError, setImageFileUploadError] = useState<string>("");
  const [formData, setFormData] = useState<User>(currentUser || {});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const filePickerRef = useRef<any>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };
  const handleFormChange = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(updateStart());
    if (imageFileUploadProcess) {
      return dispatch(updateFailure("Please wait for image to upload"));
    }
    try {
      const user = getAuth(app).currentUser;
      if (!formData.password) throw new Error("invalid password");
      if (!user) {
        throw new Error("User not found");
      }
      await updatePassword(user, formData.password);
    } catch (error: any) {
      return dispatch(updateFailure(error.message));
    }
    try {
      const res = await fetch(`/api/v1/user/update/${currentUser._id}`, {
        method: "put",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return dispatch(updateFailure(data.message));
      }
      dispatch(updateSuccess(data));
      setUpdateUserSuccess(true);
    } catch (error: any) {
      dispatch(updateFailure(error.message));
    }
  };
  const handleSignOut = async () => {
    try {
      getAuth(app).signOut();
      await fetch("/api/v1/auth/sign-out", { method: "post" });
      dispatch(signOutSuccess());
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteStart());
      const res = await fetch(`api/v1/user/delete/${currentUser._id}`);
      if (res.ok) {
        dispatch(deleteSuccess());

        getAuth(app).currentUser?.delete();
        return;
      }
      const data = await res.json();
      dispatch(deleteFailure(data.message));
    } catch (error: any) {
      dispatch(deleteFailure(error.message));
    } finally {
      const storage = getStorage(app);
      try {
        const desertRef = ref(storage, currentUser.imageUrl);
        deleteObject(desertRef);
      } catch (error: any) {
        console.log(error.message);
      }
    }
  };
  useEffect(() => {
    if (updateUserSuccess) {
      setTimeout(() => {
        setUpdateUserSuccess(false);
      }, 2000);
    }
  }, [updateUserSuccess]);

  useEffect(() => {
    if (imageFile) {
      getAuth(app);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + imageFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const process =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageFileUploadProcess(Number.parseInt(process.toFixed(0)));
        },
        (error) => {
          console.log(error.message);
          setImageFile(null);
          setImageFileUploadProcess(null);
          setImageUrl(currentUser.imageUrl);
          filePickerRef.current.value = null;
          setImageFileUploadError(
            "Could not upload file (file must be less than 2MB)"
          );
        },
        async () => {
          setImageFileUploadError("");
          setImageFileUploadProcess(null);
          setImageFile(null);
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(url);
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }
      );
    }
  }, [imageFile, currentUser.imageUrl]);

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="font-semibold my-7 text-center">Profile</h1>
      <input
        ref={filePickerRef}
        hidden
        onChange={handleImageChange}
        type="file"
        accept="image/*"
      />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 my-3"
        action=""
      >
        <div
          className=" relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProcess && (
            <CircularProgressbar
              value={imageFileUploadProcess || 0}
              text={imageFileUploadProcess + "%"}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62,152,199 ${imageFileUploadProcess / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageUrl}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] 
              ${
                imageFileUploadProcess &&
                imageFileUploadProcess < 100 &&
                "opacity-60"
              }
            `}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={(e) => handleFormChange({ username: e.target.value })}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={(e) => handleFormChange({ email: e.target.value })}
        />
        <TextInput
          autoComplete="true"
          type="password"
          id="password"
          placeholder="password"
          onChange={(e) => handleFormChange({ password: e.target.value })}
        />
        <Button
          type="submit"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span className="pl-3">Loading...</span>
            </>
          ) : (
            "Update"
          )}
        </Button>
        {error && <Alert color={"failure"}>{error}</Alert>}
        {updateUserSuccess && <Alert color={"success"}>Successful</Alert>}
      </form>
      <div className="text-red-500 flex justify-between">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignOut} className="cursor-pointer">
          Sign Out
        </span>
      </div>
      {
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 text-gray-400 dark:text-gray-200 size-14" />
              <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                Are you sure you want to delete your account ?
              </h3>
              <div className="flex justify-center gap-4">
                <Button onClick={handleDeleteAccount} color={"failure"}>
                  Yes, i&#39;m sure
                </Button>
                <Button onClick={() => setShowModal(false)} color={"gray"}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      }
    </div>
  );
}
