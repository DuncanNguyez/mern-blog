import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import FooterCom from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import dashboardRoutes from "./pages/dashboard/dashboardRoutes.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AuthorRoute from "./components/AuthorRoute.jsx";
import Post from "./pages/Post/Post.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
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
                  <Route element={element}  path={path} />
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
      <ScrollToTop/>
      <FooterCom></FooterCom>
    </BrowserRouter>
  );
}
