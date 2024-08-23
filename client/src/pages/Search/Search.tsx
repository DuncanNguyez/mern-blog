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

  const search = useCallback(
    async (prevData: Array<ELSHit>, s: string) => {
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
          setSkip(skip + data.hits.hits.length);
          setHits([...prevData, ...data.hits.hits]);
        }
      } catch (error: any) {
        console.log(error.message);
      }
      setLoading(false);
    },
    [skip]
  );

  useEffect(() => {
    const searchEle = document.getElementById("searchInput");
    if (searchEle) {
      const research = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          search([], (e.target as HTMLInputElement).value);
        }
      };
      searchEle.onkeydown = research;
      // searchEle.addEventListener("keydown", research);
      // return searchEle.removeEventListener("keydown", research);
    }
  }, [search]);

  useEffect(() => {
    if (hits.length === 0 && isMore) search([], s);
  }, [hits.length, isMore, s, search]);
  return (
    <div className="container m-auto min-h-screen w-full">
      <div className="text-center text-2xl font-bold mt-10">Search Result</div>
      {hits && (
        <div className="px-20 mt-10  ">
          {hits?.map((hit, index) => {
            return <LinkSearchItem key={hit._source.path + index} hit={hit} />;
          })}
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
          <Button onClick={() => search(hits,s)} color={"gray"}>
            Show more
          </Button>
        </div>
      )}
    </div>
  );
};
export default Search;
