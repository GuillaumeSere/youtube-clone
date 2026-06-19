import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch, isLoading, initialQuery }) => {
    const [query, setQuery] = useState(initialQuery || '');

    useEffect(() => {
        setQuery(initialQuery || '');
    }, [initialQuery]);

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(query);
    };

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <label htmlFor="video-search">Recherche YouTube</label>
            <div className="search-control">
                <FiSearch aria-hidden="true" />
                <input
                    id="video-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Artiste, tuto, recette..."
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Recherche...' : 'Rechercher'}
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
