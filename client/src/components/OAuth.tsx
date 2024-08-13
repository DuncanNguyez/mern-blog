import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase.ts";
import { signInFailure, signInSuccess } from "../redux/user/userSlice.ts";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleGoogleClick = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const resultFromGoogle = await signInWithPopup(auth, provider);
      const res = await fetch("/api/v1/auth/google", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: resultFromGoogle.user.displayName,
          email: resultFromGoogle.user.email,
          imageUrl: resultFromGoogle.user.photoURL,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        return dispatch(signInFailure(data.message));
      }
      dispatch(signInSuccess(data));
      return navigate("/home");
    } catch (error: any) {
      dispatch(signInFailure(error.message));
    }
  }, [auth, dispatch, navigate]);

  return (
    <Button
      type="button"
      gradientDuoTone="pinkToOrange"
      outline
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2"></AiFillGoogleCircle>
      Continue with Google
    </Button>
  );
}
