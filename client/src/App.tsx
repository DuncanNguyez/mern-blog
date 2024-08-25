import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About.jsx";
import Home from "./pages/Home.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Projects from "./pages/Projects.jsx";
import Header from "./components/Header.jsx";
import FooterCom from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import dashboardRoutes from "./pages/dashboard/dashboardRoutes.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AuthorRoute from "./components/AuthorRoute.jsx";
import Post from "./pages/Post/Post.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { getAuth } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { app } from "./firebase.js";
import {
  refreshToken,
  signOutSuccess,
  User as U,
} from "./redux/user/userSlice.js";
import PostsByTag from "./pages/Posts/PostByTag.js";
import User from "./pages/User/User.js";
import { useEffect } from "react";
import Search from "./pages/Search/Search.js";

export default function App() {
  const dispatch = useDispatch();
  const currentUser: U = useSelector((state: any) => state.user).currentUser;
  useEffect(() => {
    getAuth(app).onIdTokenChanged(async () => {
      if (!currentUser?.refreshToken) {
        return;
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
        return dispatch(refreshToken(data.refreshToken));
      }
    });
  }, [currentUser?.refreshToken, dispatch]);

  useEffect(() => {
    getAuth(app).onAuthStateChanged(
      async (user) => {
        if (!user) {
          await fetch("/api/v1/auth/sign-out", { method: "post" });
          await getAuth(app).signOut();
          dispatch(signOutSuccess());
        }
      },
      async (error) => {
        if (error) {
          await fetch("/api/v1/auth/sign-out", { method: "post" });
          await getAuth(app).signOut();
          dispatch(signOutSuccess());
        }
      }
    );
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/sign-in" element={<SignIn />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {dashboardRoutes.map(({ path, element, onlyAuthor }) =>
              !onlyAuthor ? (
                <Route element={element} path={path} key={path} />
              ) : (
                <Route element={<AuthorRoute />} key={path}>
                  <Route element={element} path={path} />
                </Route>
              )
            )}
          </Route>
        </Route>
        <Route path="/posts/:path" element={<Post />}></Route>
        <Route path="/posts/tags/:hashtag" element={<PostsByTag />}></Route>
        <Route path="/users/:username" element={<User />}></Route>
        <Route path="/projects" element={<Projects />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route
          path="*"
          element={
            <div className="min-h-screen">
              <h1 className="mx-auto text-center mt-20 text-2xl font-bold ">
                Not found
              </h1>
            </div>
          }
        ></Route>
      </Routes>
      <ScrollToTop />
      <FooterCom></FooterCom>
    </BrowserRouter>
  );
}
