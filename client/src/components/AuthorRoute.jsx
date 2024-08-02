import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthorRoute() {
  const { currentUser } = useSelector((state) => state.user);
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
