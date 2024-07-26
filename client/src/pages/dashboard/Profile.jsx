import { Alert, Button, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { app } from "../../firebase";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(currentUser.imageUrl);
  const [imageFileUploadProcess, setImageFileUploadProcess] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const filePickerRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + imageFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const process =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageFileUploadProcess(process.toFixed(0));
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
          setImageFileUploadError(null);
          setImageFileUploadProcess(null);
          setImageUrl(await getDownloadURL(uploadTask.snapshot.ref));
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
      <form className="flex flex-col gap-3 my-3" action="">
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
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
        />
        <TextInput
          autoComplete="true"
          type="password"
          id="password"
          placeholder="password"
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}
