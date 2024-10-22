import { LinkBubbleMenu, RichTextEditor, TableBubbleMenu } from "mui-tiptap";
import { createTheme, ThemeProvider } from "@mui/material";
import { getAuth } from "firebase/auth";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Content, JSONContent } from "@tiptap/core";
import { extensions } from "../tiptap/editorExtension";
import EditorMenuControls from "./EditorMenuControls";
import { app } from "../firebase";
import { ReactNode, useCallback } from "react";
import { useSelector } from "react-redux";
interface PostEditorProps {
  editorRef: any;
  editorDoc: Content;
  onUpdate: (editor: any) => void;
  dependenciesEnable?: boolean;
  menuButtons?: ReactNode;
  editable?: boolean;
}
const PostEditor: React.FC<PostEditorProps> = ({
  editorRef,
  editorDoc,
  onUpdate,
  dependenciesEnable = false,
  menuButtons,
  editable = true,
}) => {
  const { theme } = useSelector((state: any) => state.theme);

  const findImageNode = useCallback(
    (node: JSONContent, imagesData: Set<string>) => {
      if (!node) {
        return;
      }
      const type = node.type as any;
      if (type.name === "image") {
        const { src } = node.attrs || {};
        imagesData.add(src);
        return;
      }
      const currentContent = node.content as any;
      const arr = Array.isArray(currentContent)
        ? currentContent
        : currentContent.content;
      arr.map((item: JSONContent) => findImageNode(item, imagesData));
    },
    []
  );
  const deleteImage = useCallback(
    async (transaction: any) => {
      const setSrc = new Set<string>();
      const beforeSetSrc = new Set<string>();
      transaction.doc.forEach((node: JSONContent) => {
        findImageNode(node, setSrc);
      });
      transaction.before.forEach((node: JSONContent) => {
        findImageNode(node, beforeSetSrc);
      });

      beforeSetSrc.forEach((src) => {
        if (!setSrc.has(src)) {
          getAuth(app);
          const storage = getStorage(app);
          try {
            const desertRef = ref(storage, src);
            deleteObject(desertRef);
          } catch (error: any) {
            console.log(error.message);
          }
        }
      });
    },
    [findImageNode]
  );
  const handleChangeEditor = useCallback(
    ({ editor, transaction }: any) => {
      onUpdate(editor);
      deleteImage(transaction);
    },
    [deleteImage, onUpdate]
  );

  const uploadImage = async (files: File[]) => {
    getAuth(app);
    const storage = getStorage(app);
    if (files) {
      return await Promise.all(
        files.map(async (file) => {
          const fileName = new Date().getTime() + file.name;
          const storageRef = ref(storage, fileName);
          const uploadTask = uploadBytesResumable(storageRef, file);

          try {
            const url = await new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                null,
                (err) => reject(err),
                async () => {
                  try {
                    resolve(await getDownloadURL(uploadTask.snapshot.ref));
                  } catch (error) {
                    reject(error);
                  }
                }
              );
            });
            return { src: url, alt: "" };
          } catch (error: any) {
            alert("image has not been uploaded yet (note: image size < 2M)");
            console.log(error.message);
          }
        })
      );
    }
  };
  const mTheme = createTheme({
    palette: {
      mode: theme,
      secondary: {
        main: "#0bd074",
      },
    },
  });
  return (
    <>
      <ThemeProvider theme={mTheme}>
        <RichTextEditor
          editable={editable}
          ref={editorRef}
          className="min-h-96"
          content={editorDoc}
          editorDependencies={dependenciesEnable ? [editorDoc] : []}
          extensions={extensions}
          renderControls={() => (
            <EditorMenuControls child={menuButtons} uploadImage={uploadImage} />
          )}
          onUpdate={handleChangeEditor}
        >
          {() => (
            <>
              <LinkBubbleMenu />
              <TableBubbleMenu />
            </>
          )}
        </RichTextEditor>
      </ThemeProvider>
    </>
  );
};

export default PostEditor;
