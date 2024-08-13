import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { signOutSuccess } from "../redux/user/userSlice";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`/api/v1/auth`);
      if (res.ok) {
        return setAuthenticated(true);
      }
      dispatch(signOutSuccess());

      return setAuthenticated(false);
    };
    checkAuth();
  }, [dispatch]);
  return currentUser && authenticated ? <Outlet /> : <Navigate to="/sign-in" />;
}
