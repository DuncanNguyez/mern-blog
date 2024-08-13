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
import { useDispatch } from "react-redux";
import { app } from "./firebase.js";
import { signOutSuccess } from "./redux/user/userSlice.js";

export default function App() {
  const dispatch = useDispatch();
  getAuth(app).onAuthStateChanged((user) => {
    if (!user) {
      dispatch(signOutSuccess());
    }
  });
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
        <Route path="/projects" element={<Projects />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="*" element={<h1>notfound</h1>}></Route>
      </Routes>
      <ScrollToTop />
      <FooterCom></FooterCom>
    </BrowserRouter>
  );
}
