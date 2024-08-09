import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../redux/store";

export default function AuthorRoute() {
  const { currentUser } = useSelector((state: RootState) => state.user) || {};
  return currentUser ? (
    currentUser.isAuthor ? (
      <Outlet />
    ) : (
      <Navigate to="/dashboard" />
    )
  ) : (
    <Navigate to="/sign-in" />
  );
}
