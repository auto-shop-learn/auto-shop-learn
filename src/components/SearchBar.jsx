import { useState } from "react";
import SearchIcon from "../assets/svg/search.svg";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // You can perform your search logic here and pass the query to the parent component.
    onSearch(query);
  };

  return (
    <div className="search-bar flex">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <SearchIcon className='' onClick={handleSearch}></SearchIcon>
    </div>
  );
};

export default SearchBar;
