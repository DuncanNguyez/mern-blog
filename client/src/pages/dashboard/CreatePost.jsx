import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useDispatch, useSelector } from "react-redux";
import {
  updateDraftEditor,
  updateDraftTitle,
} from "../../redux/draft/draftSlice";
import Preview from "./Preview";
import { TextInput } from "flowbite-react";

export default function CreatePost() {
  const { theme } = useSelector((state) => state.theme);
  const { title, editorDoc } = useSelector((state) => state.draft);
  const editor = useCreateBlockNote({ initialContent: editorDoc });
  const dispatch = useDispatch();
  const handleChangEditor = () => {
    dispatch(updateDraftEditor(editor.document));
  };
  const handleChangeTitle = (e) => {
    dispatch(updateDraftTitle(e.target.value));
  };

  return (
    <div className="w-full mx-auto p-3 min-h-screen flex flex-col md:flex-row gap-2 ">
      <div className="flex-1">
        <h1 className="text-center text-3xl font-semibold my-7">Create post</h1>
        <TextInput
          className="my-2"
          placeholder="Title"
          onChange={handleChangeTitle}
          value={title}
        />
        <BlockNoteView
          id="full-blocks"
          onChange={handleChangEditor}
          theme={theme}
          editor={editor}
        ></BlockNoteView>
      </div>
      <Preview />
    </div>
  );
}
