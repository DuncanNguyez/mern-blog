import { io } from "socket.io-client";
import { Dropdown } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { app } from "../../firebase.ts";
import { signOutSuccess, User } from "../../redux/user/userSlice.ts";
import { ICommentContent } from "../../pages/Post/Comments.tsx";

type Props = {
  user: User;
};
type RelatedTo = {
  comment?: {
    _id: string;
    content: ICommentContent;
  };
  user?: { username: string; _id: string };
  post?: { _id: string; path: string };
};
export interface INotification {
  _id?: string;
  link: string;
  userId: string;
  relatedTo: RelatedTo;
  message: string;
  read: boolean;
}

const UserNav = ({ user }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser: User = useSelector((state: any) => state.user).currentUser;

  const [notifications, setNotifications] = useState<Array<INotification>>([]);
  const [needRead, setNeedRead] = useState<number>(0);
  const { pathname } = useLocation();
  const handleSignOut = useCallback(async () => {
    try {
      getAuth(app).signOut();
      await fetch("/api/v1/auth/sign-out", { method: "post" });
      dispatch(signOutSuccess());
      await getAuth(app).signOut();
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, navigate]);
  useEffect(() => {
    const getNotifications = async () => {
      const today = new Date();
      const fiveDaysAgo = new Date(today.setDate(today.getDate() - 5));
      const fromCreatedAt = fiveDaysAgo.toISOString();

      try {
        const res = await fetch(
          `/api/v1/users/${user._id}/notifications?fromCreatedAt=${fromCreatedAt}`
        );
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setNeedRead(data.filter((n: INotification) => !n.read).length);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getNotifications();
  }, [user._id]);
  const handleToNotification = useCallback(
    async (
      e: React.MouseEvent<any>,
      link: string,
      id: string,
      read: boolean
    ) => {
      e.preventDefault();
      if (!read) {
        const res = await fetch(
          `/api/v1/users/${user.username}/notifications`,
          {
            method: "post",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ ids: [id] }),
          }
        );
        if (res.ok) {
          setNotifications((notifications) => {
            const newN = notifications.map((notification) => {
              return notification._id == id
                ? { ...notification, read: true }
                : notification;
            });
            return newN;
          });
          setNeedRead((prev) => (prev !== 0 ? --prev : prev));
        }
      }
      navigate(link);
      if (pathname === link.replace(/#.*/, "")) {
        window.location.reload();
      }
    },
    [navigate, pathname, user.username]
  );

  useEffect(() => {
    const socket = io({
      auth: { refreshToken: currentUser?.refreshToken },
      retries: 5,
      ackTimeout: 10000,
    });
    socket.on("connect", () => {
      console.log(socket.id);
    });
    socket.on("connected", (payload) => {
      const object = JSON.parse(payload);
      socket.auth = { access_token: object.token };
    });
    socket.on("notification", (payload) => {
      setNotifications((prev) => [payload, ...prev]);
      setNeedRead((prev) => ++prev);
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  return (
    <div className="break-words">
      <Dropdown
        arrowIcon={false}
        inline
        label={
          <div className="items-center text-center bg-red relative">
            {needRead > 0 && (
              <span className="absolute text-white pl-[7.3px] bg-[#c93a3a] top-[-10px] right-[-10px] size-6 flex items-center text-center rounded-full">
                {needRead}
              </span>
            )}
            <img
              src={user.imageUrl}
              className="size-[45px] rounded-full object-cover"
              alt=""
            />
          </div>
        }
      >
        <Dropdown.Header className="w-52">
          <span className="font-semibold truncate">@{user.username}</span>
        </Dropdown.Header>
        <Link to="/dashboard">
          <Dropdown.Item>Dashboard</Dropdown.Item>
        </Link>
        <Link to="/dashboard/profile">
          <Dropdown.Item>Profile</Dropdown.Item>
        </Link>
        <Dropdown.Divider />
        <div className="max-h-60 overflow-auto">
          {notifications.length > 0 &&
            notifications.map((notification: INotification) => {
              const { link, _id, message, read } = notification;
              return (
                <Link
                  to={link}
                  key={_id}
                  onClick={(e) =>
                    handleToNotification(e, link, _id || "", read)
                  }
                >
                  <div className={read ? "" : "bg-[#3e3e40]"}>
                    <Dropdown.Item>
                      <span
                        className={`text-[10px] ${read ? "" : "text-gray-400"}`}
                      >
                        {message}
                      </span>
                    </Dropdown.Item>
                  </div>
                </Link>
              );
            })}
        </div>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleSignOut}>
          <span className="text-red-500">Sign out</span>
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};
export default UserNav;
