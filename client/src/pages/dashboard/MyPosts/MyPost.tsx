import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { Alert, Button, Modal, Table } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MyPosts() {
  const limit = 20;
  const [posts, setPosts] = useState<Array<any>>();
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState<string>();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [isMore, setIsMore] = useState(true);
  const { currentUser } = useSelector((state: any) => state.user);
  const getPosts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/users/${currentUser._id}/posts/?fields=title,path,createdAt&limit=${limit}&skip=${skip}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length < limit) {
          setIsMore(false);
        }
        setPosts((prevPosts) => [...(prevPosts || []), ...data]);
        setSkip((prevSkip) => prevSkip + limit);
        return;
      }
      if (res.headers.get("Content-type")?.includes("application/json")) {
        const data = await res.json();
        return setError(data.message);
      }
      setError(res.statusText);
    } catch (error: any) {
      setError(error.message);
    }
  }, [currentUser._id, skip]);

  useEffect(() => {
    if (!posts && !error) {
      getPosts();
    }
  }, [posts, getPosts, error]);
  const showMore = () => {
    if (isMore) {
      getPosts();
    }
  };
  const handleDeletePost = useCallback(async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/v1/users/${currentUser._id}/posts/${deleteId}`,
        {
          method: "delete",
        }
      );
      if (res.ok) {
        const newPosts = posts?.filter((post: any) => {
          return post._id !== deleteId;
        });
        setPosts(newPosts);
        return;
      }
      if (res.headers.get("Content-type")?.includes("application/json")) {
        const data = await res.json();
        console.log(data.message);
      }
      console.log(res.statusText);
    } catch (error: any) {
      console.log(error.message);
    }
  }, [currentUser._id, deleteId, posts]);
  return (
    <div className="table-auto overflow-auto md:mx-auto p-3 ">
      {posts?.length ? (
        <>
          <Table hoverable={true} className="shadow-md w-full">
            <Table.Head className="text-center">
              <Table.HeadCell>Time</Table.HeadCell>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y ">
              {posts.map(({ title, createdAt, path, _id }) => {
                return (
                  <Table.Row
                    key={path}
                    className="dark:border-gray-700 dark:bg-gray-800 items-center"
                  >
                    <Table.Cell>{createdAt}</Table.Cell>
                    <Table.Cell>
                      <Link
                        className="font-medium text-gray-900 dark:text-white"
                        to={`/posts/${path}`}
                      >
                        {title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={`/dashboard/posts/edit/${path}`}>
                        <CiEdit />
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="">
                      <MdDelete
                        onClick={() => {
                          setDeleteId(_id);
                          setShowModal(true);
                        }}
                        className="cursor-pointer text-red-500 size-6 "
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          {isMore && (
            <Button onClick={showMore} className="m-auto mt-3">
              show more
            </Button>
          )}
        </>
      ) : (
        <p>You have no posts yet!</p>
      )}
      {error && <Alert color="failure">{error}</Alert>}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
        className="dark:bg-gray-500"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePost}>
                Yes, I&#39;m sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
