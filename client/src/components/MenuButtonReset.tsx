import { MenuButton } from "mui-tiptap";
import { BiReset } from "react-icons/bi";
type Props = { handleClick: any };

export default function MenuButtonReset({ handleClick }: Props) {
  return (
    <MenuButton
      tooltipLabel="Reset all"
      IconComponent={BiReset}
      onClick={handleClick}
    />
  );
}
