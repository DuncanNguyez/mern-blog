import { RichTextEditor } from "mui-tiptap";
import { useDispatch, useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import {
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
  const handleChangeEditor = ({ editor }) => {
    dispatch(updateDraftEditor(editor.getJSON()));
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
            console.log(url);
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
