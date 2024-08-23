import { Spinner, TextInput } from "flowbite-react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AiOutlineSearch } from "react-icons/ai";
import LinkSearchItem from "./LinkSearchItem";
import { useNavigate } from "react-router-dom";

export type ELSHit = {
  highlight: {
    textContent: Array<string>;
    title: Array<string>;
    hashtags: Array<string>;
  };
  _source: { path: string; title: string };
};

const SearchCom = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [hits, setHits] = useState<Array<ELSHit>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [s, setS] = useState<string>();
  const [timeoutId, setTimeoutId] = useState<any>();
  const navigate = useNavigate();

  const searching = useCallback(async (s: string) => {
    try {
      const res = await fetch(`/api/v1/posts/search?s=${s}`);
      if (res.ok) {
        const data = await res.json();
        setHits(data.hits.hits);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);
  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLoading(true);
      const value = e.target.value;

      if (value.length > 0) {
        setShowModal(true);
        setS(value);
        // searching if have new word
        if (value.split(" ").length !== s?.split(" ").length) {
          searching(value);
        } else {
          // debounce
          clearTimeout(timeoutId);
          const newId = setTimeout(() => searching(value), 600);
          setTimeoutId(newId);
          setLoading(false);
        }
      } else {
        setHits([]);
      }
      setLoading(false);
    },
    [s, searching, timeoutId]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!s) {
        return;
      }
      setShowModal(false);
      navigate(`/search?s=${s}`);
    },
    [navigate, s]
  );
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    function handleClickOutside(event: any) {
      const search = (event.target as HTMLElement).closest("#search");
      if (!search) {
        setShowModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <form
      id="search"
      onSubmit={handleSubmit}
      className="flex-1 mx-16 relative break-words"
    >
      <TextInput
        id="searchInput"
        onChange={handleSearch}
        type="text"
        placeholder="Search..."
        rightIcon={AiOutlineSearch}
        className="hidden lg:inline"
      ></TextInput>
      <div
        className={`${
          showModal ? "" : "hidden"
        } overflow-auto shadow-lg  bg-[#ffffffc8] dark:bg-[#23273da2] border border-[#1b1a5d] absolute bottom--1 dark:border-gray-400   mt-1 rounded max-h-96 min-h-96 w-full min-w-96`}
      >
        {loading && (
          <div className="text-center p-2">
            <Spinner />
          </div>
        )}
        {hits && hits?.length > 0 ? (
          <div
            onClick={() => {
              setHits([]);
              setShowModal(false);
            }}
          >
            {hits?.map((hit, index) => {
              return (
                <LinkSearchItem key={hit._source.path + index} hit={hit} />
              );
            })}
          </div>
        ) : (
          ""
        )}
        {hits && hits.length === 0 && (
          <div className="text-center p-4">Not found</div>
        )}
      </div>
    </form>
  );
};

export default SearchCom;
