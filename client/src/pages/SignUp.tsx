import {
  Alert,
  Button,
  Checkbox,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice.ts";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../firebase.ts";
import { RootState } from "../redux/store.ts";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { currentUser, error, loading } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value.trim(),
    }));
  }, []);
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(signInStart());
      const { username, email, password } = formData;
      if (!username || !email || !password) {
        return dispatch(signInFailure("Please fill out all fields "));
      }
      const auth = getAuth(app);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        return dispatch(signInFailure(error.message));
      }

      try {
        const res = await fetch("/api/v1/auth/sign-up", {
          method: "post",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
          dispatch(signInSuccess(data));
          return navigate("/home");
        }
        return dispatch(signInFailure(data.message));
      } catch (error: any) {
        auth.currentUser?.delete();
        return dispatch(signInFailure(error.message));
      }
    },
    [dispatch, formData, navigate]
  );
  return (
    <div className="min-h-screen mt-10">
      <div className=" gap-5 flex flex-col md:flex-row md:items-center p-3 max-w-3xl mx-auto ">
        <div className="flex-1">
          <Link
            to="/home"
            className="self-center whitespace-nowrap text-4xl font-bold dark:text-white "
          >
            <span className="mx-1 text-white px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg">
              xanadu
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign up with your email and password
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
              <Label value="Your email" />
              <TextInput
                onChange={handleChange}
                type="email"
                placeholder="Name@company.com"
                id="email"
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                onChange={handleChange}
                type="password"
                placeholder="Password"
                id="password"
                autoComplete="true"
              />
            </div>
            <div>
              <Checkbox
                className="mr-3"
                onChange={handleChange}
                id="isAuthor"
              />
              <Label value="Is Author" />
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
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign in
            </Link>
          </div>
          {error && (
            <Alert className="mt-5" color="failure">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
