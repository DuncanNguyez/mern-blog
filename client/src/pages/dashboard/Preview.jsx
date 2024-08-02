import { useSelector } from "react-redux";

export default function Preview() {
  const data = useSelector((state) => state.draft);
  console.log(data);
  return <div className="grow">Preview</div>;
}
