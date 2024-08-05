import { RichTextEditor } from "mui-tiptap";
import EditorMenuControls from "./EditorMenuControls";

import { extensions } from "./editorExtension";

import { useDispatch, useSelector } from "react-redux";
import { updateDraftEditor } from "../../../redux/draft/draftSlice";
export default function PostEditor() {
  const { editorDoc } = useSelector((state) => state.draft);
  const dispatch = useDispatch();

  const handleChangeEditor = (editor) => {
    console.log(editor.editor.getJSON());
    dispatch(updateDraftEditor(editor.editor.getJSON()));
  };

  return (
      <RichTextEditor
        content={editorDoc}
        extensions={extensions}
        renderControls={() => <EditorMenuControls />}
        onUpdate={handleChangeEditor}
      />
  );
}
