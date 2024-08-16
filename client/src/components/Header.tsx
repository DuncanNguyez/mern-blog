import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/theme/themSlice.ts";
import { app } from "../firebase.ts";
import { getAuth } from "firebase/auth";
import { signOutSuccess } from "../redux/user/userSlice.ts";
import { useCallback } from "react";

export default function Header() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.user);
  const { theme } = useSelector((state: any) => state.theme);
  const handleSignOut = useCallback(async () => {
    try {
      getAuth(app).signOut();
      await fetch("/api/v1/auth/sign-out", { method: "post" });
      dispatch(signOutSuccess());
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, navigate]);
  return (
    <Navbar id="header" className="border-b-2 sticky top-0 z-50">
      <Link
        to="/home"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="mx-1 text-white px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg">
          Duncan&apos;s
        </span>
        Blog
      </Link>
      <form className="flex-1 mx-16">
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        ></TextInput>
      </form>
      <Button className="w-12 h-10 lg:hidden size-[45px]" color="gray" pill>
        <AiOutlineSearch />
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button
          className="w-12 h-10 hidden size-[45px]  sm:inline"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "dark" ? <FaMoon></FaMoon> : <FaSun></FaSun>}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt="user" img={currentUser.imageUrl} rounded />}
          >
            <Dropdown.Header>
              <span className="font-semibold truncate">
                {currentUser.username}
              </span>
            </Dropdown.Header>
            <Link to="/dashboard/profile">
              <Dropdown.Item>Dashboard</Dropdown.Item>
            </Link>
            <Link to="/dashboard/profile">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>
              <span className="text-red-500">Sign out</span>
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue" outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse className="mx-2">
        <Navbar.Link active={path === "/home"} as="div">
          <Link to="/home">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/projects"} as="div">
          <Link to="/projects">Projects</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as="div">
          <Link to="/about">About</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
