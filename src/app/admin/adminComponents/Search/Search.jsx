"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "use-debounce";

const Search = ({ from }) => {
  const router = useRouter();
  const [searchKey, updateSearchKey] = React.useState("");
  const [debouncedVal] = useDebounce(searchKey, 100);
  useEffect(() => {
    if (!searchKey) {
      router.push(`/admin/${from}`);
    } else {
      router.push(`?search=${debouncedVal}`);
    }
  }, [searchKey, debouncedVal]);
  return (
    <div className="my-2 w-[95%] text-[0.66rem] relative mx-auto bg-white rounded-md p-2">
      <input
        type="text"
        value={searchKey}
        onChange={(e) => updateSearchKey(e.target.value)}
        placeholder="Enter referance no."
        className="w-full"
      />
      <FaSearch
        className="absolute top-1/2 text-xl -translate-y-1/2 right-3 "
        color="skyblue"
      />
    </div>
  );
};

export default Search;
