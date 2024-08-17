import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CodeBlockLowlightComponent from "./CodeBlockLowlightComponent";
import { createLowlight, common } from "lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";

const lowlight = createLowlight(common);

export const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockLowlightComponent);
  },
}).configure({ lowlight });
