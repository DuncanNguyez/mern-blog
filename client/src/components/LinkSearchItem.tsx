import { memo } from "react";
import { Link } from "react-router-dom";

type Props = {
  innerHTML: string;
  path: string;
};

const LinkSearchItem = memo(({ innerHTML, path }: Props) => {
    return (
      <Link to={path}>
        <div className="h-[1px] bg-gray-800 dark:bg-blue-800 "></div>
        <div
          dangerouslySetInnerHTML={{ __html: innerHTML }}
          className="p-2 bg-[#d8e2fff1] hover:bg-[#4279f1f8] hover:text-white
           dark:bg-[#1d3d5f] dark:hover:bg-blue-300 dark:hover:text-gray-800  
           [&>em]:font-bold [&>em]:text-orange-700 "
        ></div>
      </Link>
    );
  });

export default LinkSearchItem;
