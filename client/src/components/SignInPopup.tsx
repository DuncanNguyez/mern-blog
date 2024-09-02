import {
  Alert,
  Button,
  Label,
  Modal,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useCallback, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { closeSignin, PopupState } from "../redux/popup/popupSlice";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import { app } from "../firebase";
import OAuth from "./OAuth";

const SignInPopup = () => {
  const { signinIsShow } = useSelector<any, PopupState>((state) => state.popup);
  const dispatch = useDispatch();
  const { theme } = useSelector((state: any) => state.theme);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const { loading, error: errorMessage } = useSelector(
    (state: any) => state.user
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value.trim() }));
  }, []);
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { username, password } = formData;
      if (!username || !password) {
        return dispatch(signInFailure("Please fill out all fields "));
      }
      try {
        dispatch(signInStart());
        const res = await fetch("/api/v1/auth/sign-in", {
          method: "post",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(signInSuccess(data));
          await signInWithEmailAndPassword(getAuth(app), data.email, password);
          return dispatch(closeSignin());
        }
        if (res.headers.get("Content-type")?.includes("application/json")) {
          const data = await res.json();
          return dispatch(signInFailure(data.message));
        }
      } catch (error: any) {
        dispatch(signInFailure(error.message));
      }
    },
    [dispatch, formData]
  );
  return (
    <Modal
      className={theme}
      show={signinIsShow}
      onClose={() => dispatch(closeSignin())}
      size="md"
    >
      <div className="bg-gray-100 rounded text-gray-700 dark:text-gray-200 dark:bg-[rgb(21,34,60)]  ">
        <Modal.Header>
          <Link
            to="/home"
            className="self-center whitespace-nowrap text-4xl font-bold dark:text-white "
          >
            <span className="mx-auto text-white px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg">
              Xanadu
            </span>
            Blog
          </Link>
        </Modal.Header>
        <div className="mt-10">
          <div className=" gap-5 flex flex-col md:flex-row md:items-center p-3 max-w-3xl mx-auto ">
            <div className="flex-1">
              <form
                onSubmit={handleSubmit}
                action=""
                className="flex  flex-col gap-2"
              >
                <div>
                  <Label value="Your username" />
                  <TextInput
                    onChange={handleChange}
                    type="text"
                    placeholder="Username"
                    id="username"
                  />
                </div>
                <div>
                  <Label value="Your password" />
                  <TextInput
                    onChange={handleChange}
                    type="password"
                    placeholder="**********"
                    id="password"
                    autoComplete="true"
                  />
                </div>
                <Button
                  type="submit"
                  gradientDuoTone="purpleToPink"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <OAuth onPopUp={true}></OAuth>
              </form>
              {errorMessage && (
                <Alert className="mt-5" color="failure">
                  {errorMessage}
                </Alert>
              )}
              <div className="flex gap-2 text-sm mt-5">
                <span>Don&apos;t have an account?</span>
                <Link to="/sign-up" className="text-blue-500">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignInPopup;
