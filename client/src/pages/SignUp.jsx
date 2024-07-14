import { Button, Label, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  return (
    <div className="min-h-screen mt-10">
      <div className=" gap-5 flex flex-col md:flex-row md:items-center p-3 max-w-3xl mx-auto ">
        <div className="flex-1">
          <Link
            to="/home"
            className="self-center whitespace-nowrap text-4xl font-bold dark:text-white "
          >
            <span className=" text-white px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg">
              {" "}
              Sahand&apos;s{" "}
            </span>
            Blog
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign up with your email and password
            of with Google.
          </p>
        </div>
        <div className="flex-1">
          <form action="" className="flex  flex-col gap-2">
            <div>
              <Label value="Your username" />
              <TextInput type="text" placeholder="Username" id="username" />
            </div>
            <div>
              <Label value="Your email" />
              <TextInput type="email" placeholder="Name@company.com" id="email" />
            </div>
            <div>
              <Label value="Your username" />
              <TextInput type="password" placeholder="Password" id="password" />
            </div>
            <Button type="submit" gradientDuoTone="purpleToPink">
              Sign up
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
