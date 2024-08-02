import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({});
  const {
    currentUser,
    loading,
    error: errorMessage,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value.trim() }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    if ((!username, !password)) {
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
      const data = await res.json();
      if (data.success === false) {
        return dispatch(signInFailure(data.message));
      }
      dispatch(signInSuccess(data));
      await signInWithEmailAndPassword(getAuth(app), data.email, password);
      navigate("/home");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };
  return (
    <div className="min-h-screen mt-10">
      <div className=" gap-5 flex flex-col md:flex-row md:items-center p-3 max-w-3xl mx-auto ">
        <div className="flex-1">
          <Link
            to="/home"
            className="self-center whitespace-nowrap text-4xl font-bold dark:text-white "
          >
            <span className="mx-1 text-white px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg">
              Duncan&apos;s
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign in with your email and password
            of with Google.
          </p>
        </div>
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
            <OAuth></OAuth>
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
  );
}
