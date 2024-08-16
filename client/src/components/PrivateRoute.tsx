import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { refreshToken, signOutSuccess, User } from "../redux/user/userSlice";

export default function PrivateRoute() {
  const currentUser: User = useSelector(
    (state: RootState) => state.user
  ).currentUser;

  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`/api/v1/auth`);
      if (res.ok) {
        return setAuthenticated(true);
      }
      const resRefresh = await fetch(`/api/v1/auth/`, {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentUser.refreshToken }),
      });
      if (resRefresh.ok) {
        const data = await resRefresh.json();
        dispatch(refreshToken(data.refreshToken));
        return setAuthenticated(true);
      }
      dispatch(signOutSuccess());

      return setAuthenticated(false);
    };
    checkAuth();
  }, [currentUser.refreshToken, dispatch]);
  return currentUser && authenticated ? <Outlet /> : <Navigate to="/sign-in" />;
}
