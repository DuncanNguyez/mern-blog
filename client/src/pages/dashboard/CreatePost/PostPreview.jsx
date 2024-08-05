import { useSelector } from "react-redux";

export default function PostPreview() {
  const { title, editorDoc } = useSelector((state) => state.draft);
  console.log(editorDoc);
  return (
    <div className="">
      <h1 className="mx-auto my-7 font-semibold text-4xl">{title}</h1>
      <div className="overflow-auto max-w-">
        
      </div>
    </div>
  );
}
