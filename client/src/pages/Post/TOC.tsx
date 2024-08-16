import { Sidebar } from "flowbite-react";
import { useCallback, useState } from "react";

type Toc = Array<Record<string, any>>;
export default function TOC() {
  const [toc, setToc] = useState<Toc>([]);

  const [hashPath, setHashPath] = useState(location.hash.replace("#", ""));
  setTimeout(() => {
    let toc: Toc = [];
    const titleEle = document.querySelector("#title");
    toc.push({ id: "title", title: titleEle?.textContent, level: "h1" });
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
  const handleChangeHash = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const ele = e.target as HTMLElement;
    const hash = ele.closest("a")?.href.replace(/.*#/, "") || "";
    setHashPath(hash);
    location.hash = hash;
    const title = document.getElementById(hash);
    if (title) {
      window.scrollTo({
        top: hash == "title" ? 0 : title?.offsetTop + 210,
        behavior: "smooth",
      });
    }
    e.preventDefault();
  }, []);
  return (
    <Sidebar className="h-screen top-[66px] sticky sidebar" id="">
      <Sidebar.ItemGroup id="nav-post">
        {toc.map(({ id, title, level }, index) => {
          return (
            <a onClick={handleChangeHash} key={index} href={`#${id}`}>
              <Sidebar.Item
                className="block truncate overflow-hidden p-1.5 rounded-none"
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
