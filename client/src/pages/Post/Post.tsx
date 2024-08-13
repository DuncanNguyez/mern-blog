import { createTheme, ThemeProvider } from "@mui/material";
import { RichTextReadOnly } from "mui-tiptap";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { extensions } from "../../tiptap/editorExtension";
import TOC from "./TOC";
import { Post as P } from "../../redux/draft/draftSlice";
import Comments from "./Comments";

export default function Post() {
  const { theme } = useSelector((state: any) => state.theme);
  const [post, setPost] = useState<P>();
  const { path } = useParams();
  const { title, hashtags, doc } = post || {};
  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/v1/posts/${path}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getPost();
  }, [path]);

  const mTheme = createTheme({
    palette: {
      mode: theme,
      secondary: {
        main: "#0bd074",
      },
    },
  });
  return (
    <ThemeProvider theme={mTheme}>
      <div className="mx-auto flex flex-row justify-between  gap-4 relative ">
        {!post ? (
          <h1 className="m-auto">POST NOT FOUND</h1>
        ) : (
          <div className="p-10 flex-1">
            <h1 id="title" className="font-bold  text-4xl m-2">
              {title}
            </h1>
            <div className="text-right mb-10 flex justify-end ">
              <div className="max-w-lg">
                {hashtags?.map((tag) => {
                  return (
                    <span
                      className=" text-sm bg-gray-500 group px-1.5 align-middle inline-block via-emerald-50 m-1 border rounded cursor-pointer relative"
                      key={tag}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
            <RichTextReadOnly content={doc} extensions={extensions} />
            <Comments postId={post._id}/>
          </div>
        )}
        <TOC />
      </div>
    </ThemeProvider>
  );
}
