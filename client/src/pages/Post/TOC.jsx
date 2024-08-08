import { Sidebar } from "flowbite-react";
import { useState } from "react";

export default function TOC() {
  const [toc, setToc] = useState([]);

  const [hashPath, setHashPath] = useState(location.hash.replace("#", ""));
  setTimeout(() => {
    let toc = [];
    document
      .querySelectorAll(".tiptap .MuiTiptap-HeadingWithAnchorComponent-root")
      .forEach((item) => {
        const id = item.id;
        const title = item.textContent;
        const level = item.getAttribute("as");
        toc = [...toc, { id, title, level }];
      });
    setToc(toc);
  }, 500);
  const handleChangeHash = () => {
    setTimeout(() => {
      setHashPath(location.hash.replace("#", ""));
    }, 200);
  };
  return (
    <Sidebar className="h-screen top-0 sticky sidebar" id="">
      <Sidebar.ItemGroup id="nav-post">
        {toc.map(({ id, title, level }, index) => {
          return (
            <a onClick={handleChangeHash} key={index} href={`#${id}`}>
              <Sidebar.Item
                className="block overflow-hidden p-1.5 rounded-none"
                active={hashPath === id}
                as="div"
              >
                <span
                  className={`pl-${level.replace("h", "") * 1} ${
                    level === "h1" && "font-bold"
                  }`}
                >
                  {title}
                </span>
              </Sidebar.Item>
            </a>
          );
        })}
      </Sidebar.ItemGroup>
    </Sidebar>
  );
}
