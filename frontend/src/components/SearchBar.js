import React from 'react';

const SearchBar = ({searchValue, setSearchValue}) => {


  const handleSubmit = e => {
    e.preventDefault()
    setSearchValue(searchValue);
  }

  return (
    <form className="searchBar" onSubmit={handleSubmit}>
        <input className="form-control mr-sm-5 searchBarInput"
          type="text"
          placeholder="Поиск"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
    </form>
  );
};
export default SearchBar;