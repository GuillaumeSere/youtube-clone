import React, { useState, useRef } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(query);
    };

    const handleBlur = () => {
        inputRef.current.focus();
    };

    return (
        <form className='formulaire' onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Rechercher des vidéos YouTube"
                ref={inputRef}
                onBlur={handleBlur}
            />
            <button type="submit">Rechercher</button>
        </form>
    );
};

export default SearchBar;