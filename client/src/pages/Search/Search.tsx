import { useCallback, useEffect, useState } from "react";
import { ELSHit } from "../../components/SearchCom";
import LinkSearchItem from "../../components/LinkSearchItem";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Spinner } from "flowbite-react";

const Search = () => {
  const [hits, setHits] = useState<Array<ELSHit>>([]);
  const [skip, setSkip] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(true);
  const limit = 10;
  const [loading, setLoading] = useState<boolean>(true);
  const s = useSearchParams()[0].get("s") as string;
  const search = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        s,
        limit: limit + "",
        skip: skip + "",
      }).toString();
      const res = await fetch(`/api/v1/posts/search?${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hits.hits.length < limit) setIsMore(false);
        setSkip(skip + data.length);
        setHits(data.hits.hits);
      }
    } catch (error: any) {
      console.log(error.message);
    }
    setLoading(false);
  }, [s, skip]);
  useEffect(() => {
    search();
  }, [search]);
  return (
    <div className="container m-auto min-h-screen w-full">
      {hits && (
        <div className="p-20  ">
          {hits
            ?.map((hit) => {
              const path = `/posts/${hit._source.path}`;
              const textContents =
                hit.highlight?.textContent?.map((item) => {
                  return (
                    <LinkSearchItem key={item} path={path} innerHTML={item} />
                  );
                }) || [];
              const titles =
                hit.highlight?.title?.map((item) => {
                  return (
                    <LinkSearchItem key={item} path={path} innerHTML={item} />
                  );
                }) || [];
              return [...titles, ...textContents];
            })
            .flat()}
        </div>
      )}
      {loading && (
        <div className="text-center">
          <Spinner className="mx-auto my-4"></Spinner>
        </div>
      )}
      {hits && hits.length === 0 && (
        <div className="p-20 text-center">
          <Alert color={"warning"}>NotFound</Alert>
        </div>
      )}
      {isMore && (
        <div className="flex justify-center m-5">
          <Button onClick={() => search()} color={"gray"}>
            Show more
          </Button>
        </div>
      )}
    </div>
  );
};
export default Search;
