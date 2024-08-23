import { memo } from "react";
import { Link } from "react-router-dom";
import { ELSHit } from "./SearchCom";

type Props = {
  hit: ELSHit;
};

const LinkSearchItem = memo(({ hit }: Props) => {
  const title = hit._source.title;
  const path = `/posts/${hit._source.path}`;
  const textContents = hit.highlight?.textContent?.[0];
  const hightlightTitle = hit.highlight?.title?.[0];
  const hashtags = hit.highlight?.hashtags || [];
  return (
    <Link to={path}>
      <div className="h-[1px] bg-gray-800 dark:bg-blue-800 "></div>
      <div
        className="p-2 bg-[#d8e2fff1] hover:bg-[#4279f1f8] hover:text-white
           dark:bg-[#1d3d5f] dark:hover:bg-blue-300 dark:hover:text-gray-800  
           [&>div>em]:font-bold [&>div>em]:text-orange-700 "
      >
        <div
          className="text-xl font-bold"
          dangerouslySetInnerHTML={{ __html: hightlightTitle || title }}
        ></div>
        <div dangerouslySetInnerHTML={{ __html: textContents || "" }}></div>
        <div className="text-right">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className=" [&>em]:font-bold [&>em]:text-orange-700 border rounded px-2 leading-none border-gray-600"
              dangerouslySetInnerHTML={{ __html: tag }}
            ></span>
          ))}
        </div>
      </div>
    </Link>
  );
});

export default LinkSearchItem;
