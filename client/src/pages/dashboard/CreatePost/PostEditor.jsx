import { RichTextEditor } from "mui-tiptap";
import { useDispatch, useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { extensions } from "./editorExtension";
import EditorMenuControls from "./EditorMenuControls";
import { updateDraftEditor } from "../../../redux/draft/draftSlice";
import { app } from "../../../firebase";

export default function PostEditor() {
  const { editorDoc } = useSelector((state) => state.draft);
  const dispatch = useDispatch();
  const findImageNode = (node, imagesData) => {
    if (!node) {
      return;
    }
    if (node?.type?.name === "image") {
      const { src } = node.attrs;
      imagesData.add(src);
      return;
    }
    const arr = Array.isArray(node.content)
      ? node.content
      : node.content.content;
    arr.map((item) => findImageNode(item, imagesData));
  };
  const deleteImage = async (transaction) => {
    let setSrc = new Set();
    let beforeSetSrc = new Set();
    transaction.doc.forEach((node) => {
      findImageNode(node, setSrc);
    });
    transaction.before.forEach((node) => {
      findImageNode(node, beforeSetSrc);
    });

    beforeSetSrc.forEach((src) => {
      if (!setSrc.has(src)) {
        getAuth(app);
        const storage = getStorage(app);
        try {
          const desertRef = ref(storage, src);
          deleteObject(desertRef);
        } catch (error) {
          console.log(error.message);
        }
      }
    });
  };
  const handleChangeEditor = ({ editor, transaction }) => {
    dispatch(updateDraftEditor(editor.getJSON()));
    deleteImage(transaction);
  };

  const uploadImage = async (files) => {
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
          } catch (error) {
            alert("image has not been uploaded yet (note: image size < 2M)");
            console.log(error.message);
          }
        })
      );
    }
  };
  return (
    <div>
      <RichTextEditor
        content={editorDoc}
        extensions={extensions}
        renderControls={() => <EditorMenuControls uploadImage={uploadImage} />}
        onUpdate={handleChangeEditor}
      />
    </div>
  );
}
