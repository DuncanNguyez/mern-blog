import { MenuButton, useRichTextEditorContext } from "mui-tiptap";
import { SiCcleaner } from "react-icons/si";

export default function MenuButtonClear() {
  const editor = useRichTextEditorContext();
  return (
    <MenuButton
      tooltipLabel="Clear"
      IconComponent={SiCcleaner}
      onClick={() => editor?.commands.clearContent()}
    />
  );
}
