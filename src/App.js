import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import {
    FiAlertCircle,
    FiBookmark,
    FiChevronLeft,
    FiChevronRight,
    FiHeart,
    FiRefreshCw,
    FiYoutube,
} from 'react-icons/fi';
import './App.css';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const DEFAULT_SEARCH = 'web development';
const QUICK_SEARCHES = ['React', 'Musique live', 'Cuisine facile', 'Voyage', 'Gaming'];
const FAVORITES_STORAGE_KEY = 'youtube-finder-favorites';
const LIKES_STORAGE_KEY = 'youtube-finder-likes';
const DEFAULT_SEARCH_FILTERS = {
    order: 'relevance',
    duration: 'any',
    published: 'any',
};

const getPublishedAfter = (period) => {
    const now = new Date();

    if (period === 'today') {
        now.setDate(now.getDate() - 1);
    }

    if (period === 'week') {
        now.setDate(now.getDate() - 7);
    }

    if (period === 'month') {
        now.setMonth(now.getMonth() - 1);
    }

    if (period === 'year') {
        now.setFullYear(now.getFullYear() - 1);
    }

    return now.toISOString();
};

const loadStoredVideos = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch (storageError) {
        return {};
    }
};

const addVideoStatistics = async (videoResults) => {
    const videoIds = videoResults.map((video) => video.id.videoId).join(',');

    if (!videoIds) {
        return videoResults;
    }

    const response = await axios.get(VIDEO_DETAILS_URL, {
        params: {
            part: 'statistics',
            id: videoIds,
            key: API_KEY,
        },
    });

    const statisticsById = response.data.items.reduce((statistics, item) => {
        statistics[item.id] = item.statistics;
        return statistics;
    }, {});

    return videoResults.map((video) => ({
        ...video,
        statistics: statisticsById[video.id.videoId] || {},
    }));
};

const App = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState('');
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState(DEFAULT_SEARCH);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchFilters, setSearchFilters] = useState(DEFAULT_SEARCH_FILTERS);
    const [favoriteVideos, setFavoriteVideos] = useState(() => loadStoredVideos(FAVORITES_STORAGE_KEY));
    const [likedVideos, setLikedVideos] = useState(() => loadStoredVideos(LIKES_STORAGE_KEY));

    const favoriteIds = useMemo(() => Object.keys(favoriteVideos), [favoriteVideos]);
    const likedIds = useMemo(() => Object.keys(likedVideos), [likedVideos]);

    const visibleVideos = useMemo(() => {
        const validVideos = videos.filter((video) => video?.id?.videoId);

        if (activeFilter === 'favorites') {
            return Object.values(favoriteVideos);
        }

        if (activeFilter === 'liked') {
            return Object.values(likedVideos);
        }

        return validVideos;
    }, [activeFilter, favoriteVideos, likedVideos, videos]);

    const selectedVideo = visibleVideos[currentVideoIndex];

    useEffect(() => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteVideos));
    }, [favoriteVideos]);

    useEffect(() => {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedVideos));
    }, [likedVideos]);

    const fetchVideos = useCallback(async (query, filters) => {
        const cleanQuery = query.trim();

        if (!cleanQuery) {
            setError('Entre un mot-clé pour lancer une recherche.');
            return;
        }

        if (!API_KEY) {
            setError('Ajoute REACT_APP_YOUTUBE_API_KEY dans un fichier .env a la racine du projet.');
            setVideos([]);
            return;
        }

        setLoading(true);
        setError('');
        setSearchTerm(cleanQuery);

        try {
            const params = {
                part: 'snippet',
                maxResults: 24,
                q: cleanQuery,
                type: 'video',
                order: filters.order,
                key: API_KEY,
            };

            if (filters.duration !== 'any') {
                params.videoDuration = filters.duration;
            }

            if (filters.published !== 'any') {
                params.publishedAfter = getPublishedAfter(filters.published);
            }

            const response = await axios.get(API_URL, {
                params,
            });

            const videoResults = response.data.items.filter((item) => item?.id?.videoId);
            const videosWithStatistics = await addVideoStatistics(videoResults);
            setVideos(videosWithStatistics);
            setSelectedVideoId('');
            setCurrentVideoIndex(0);
            setActiveFilter('all');
        } catch (requestError) {
            setError('Impossible de charger les videos. Verifie ta cle API et ta connexion.');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos(DEFAULT_SEARCH, DEFAULT_SEARCH_FILTERS);
    }, [fetchVideos]);

    useEffect(() => {
        if (!visibleVideos.length) {
            setSelectedVideoId('');
            setCurrentVideoIndex(0);
            return;
        }

        if (currentVideoIndex >= visibleVideos.length) {
            setCurrentVideoIndex(0);
        }

        if (selectedVideoId && !visibleVideos.some((video) => video.id.videoId === selectedVideoId)) {
            setSelectedVideoId('');
            setCurrentVideoIndex(0);
        }
    }, [currentVideoIndex, selectedVideoId, visibleVideos]);

    const handleSearch = (query) => {
        fetchVideos(query, searchFilters);
    };

    const handleQuickSearch = (query) => {
        fetchVideos(query, searchFilters);
    };

    const handleSearchFilterChange = (filterName, value) => {
        setSearchFilters((currentFilters) => ({
            ...currentFilters,
            [filterName]: value,
        }));
    };

    const applySearchFilters = () => {
        fetchVideos(searchTerm, searchFilters);
    };

    const resetSearchFilters = () => {
        setSearchFilters(DEFAULT_SEARCH_FILTERS);
        fetchVideos(searchTerm, DEFAULT_SEARCH_FILTERS);
    };

    const handlePlayVideo = (videoId, index) => {
        setSelectedVideoId(videoId);
        setCurrentVideoIndex(index);
    };

    const toggleSavedVideo = (video, type) => {
        const videoId = video?.id?.videoId;

        if (!videoId) {
            return;
        }

        const setter = type === 'favorite' ? setFavoriteVideos : setLikedVideos;

        setter((currentVideos) => {
            const nextVideos = { ...currentVideos };

            if (nextVideos[videoId]) {
                delete nextVideos[videoId];
            } else {
                nextVideos[videoId] = video;
            }

            return nextVideos;
        });
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setSelectedVideoId('');
        setCurrentVideoIndex(0);
    };

    const playVideoAtIndex = (nextIndex) => {
        if (!visibleVideos.length) {
            return;
        }

        const safeIndex = (nextIndex + visibleVideos.length) % visibleVideos.length;
        setCurrentVideoIndex(safeIndex);
        setSelectedVideoId(visibleVideos[safeIndex].id.videoId);
    };

    const playNextVideo = () => {
        playVideoAtIndex(currentVideoIndex + 1);
    };

    const playPreviousVideo = () => {
        playVideoAtIndex(currentVideoIndex - 1);
    };

    return (
        <main className="app-shell">
            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <FiYoutube aria-hidden="true" />
                        YouTube Finder
                    </span>
                    <h1>Explore, lance et enchaine tes videos sans quitter la page.</h1>
                    <p>
                        Recherche des videos YouTube, garde tes coups de coeur en favoris,
                        like les meilleures trouvailles et navigue dans ta selection.
                    </p>
                </div>

                <div className="search-panel">
                    <SearchBar onSearch={handleSearch} isLoading={loading} initialQuery={searchTerm} />
                    <div className="quick-searches" aria-label="Recherches rapides">
                        {QUICK_SEARCHES.map((term) => (
                            <button
                                type="button"
                                key={term}
                                className={term === searchTerm ? 'quick-chip active' : 'quick-chip'}
                                onClick={() => handleQuickSearch(term)}
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                    <div className="search-filters" aria-label="Filtres de recherche">
                        <label>
                            Trier
                            <select
                                value={searchFilters.order}
                                onChange={(event) => handleSearchFilterChange('order', event.target.value)}
                            >
                                <option value="relevance">Pertinence</option>
                                <option value="date">Plus recentes</option>
                                <option value="viewCount">Plus vues</option>
                                <option value="rating">Mieux notees</option>
                            </select>
                        </label>
                        <label>
                            Duree
                            <select
                                value={searchFilters.duration}
                                onChange={(event) => handleSearchFilterChange('duration', event.target.value)}
                            >
                                <option value="any">Toutes</option>
                                <option value="short">Moins de 4 min</option>
                                <option value="medium">4 a 20 min</option>
                                <option value="long">Plus de 20 min</option>
                            </select>
                        </label>
                        <label>
                            Date
                            <select
                                value={searchFilters.published}
                                onChange={(event) => handleSearchFilterChange('published', event.target.value)}
                            >
                                <option value="any">Tout le temps</option>
                                <option value="today">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                                <option value="month">Ce mois-ci</option>
                                <option value="year">Cette annee</option>
                            </select>
                        </label>
                        <div className="filter-actions">
                            <button type="button" onClick={applySearchFilters} disabled={loading}>
                                Appliquer
                            </button>
                            <button type="button" className="ghost" onClick={resetSearchFilters} disabled={loading}>
                                Reinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {error && (
                <div className="notice" role="alert">
                    <FiAlertCircle aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}

            <section className="content-grid">
                <div className="player-column">
                    {selectedVideoId ? (
                        <>
                            <VideoPlayer videoId={selectedVideoId} title={selectedVideo?.snippet?.title} />
                            <div className="player-controls">
                                <button type="button" onClick={playPreviousVideo} disabled={!visibleVideos.length}>
                                    <FiChevronLeft aria-hidden="true" />
                                    Precedente
                                </button>
                                <span>
                                    {currentVideoIndex + 1} / {visibleVideos.length}
                                </span>
                                <button type="button" onClick={playNextVideo} disabled={!visibleVideos.length}>
                                    Suivante
                                    <FiChevronRight aria-hidden="true" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-player">
                            <FiRefreshCw aria-hidden="true" />
                            <h2>{loading ? 'Recherche en cours...' : 'Choisis une video pour demarrer'}</h2>
                            <p>
                                Les resultats restent disponibles a droite pour passer rapidement
                                d'une video a l'autre.
                            </p>
                        </div>
                    )}
                </div>

                <aside className="results-column">
                    <div className="section-heading">
                        <div>
                            <span>
                                {activeFilter === 'favorites'
                                    ? 'Favoris'
                                    : activeFilter === 'liked'
                                      ? 'Videos aimees'
                                      : 'Resultats'}
                            </span>
                            <h2>{activeFilter === 'all' ? searchTerm : 'Ma selection'}</h2>
                        </div>
                        <strong>{visibleVideos.length}</strong>
                    </div>
                    <div className="library-tabs" aria-label="Filtres des videos">
                        <button
                            type="button"
                            className={activeFilter === 'all' ? 'active' : ''}
                            onClick={() => handleFilterChange('all')}
                        >
                            Tous
                        </button>
                        <button
                            type="button"
                            className={activeFilter === 'favorites' ? 'active' : ''}
                            onClick={() => handleFilterChange('favorites')}
                        >
                            <FiBookmark aria-hidden="true" />
                            Favoris
                            <span>{favoriteIds.length}</span>
                        </button>
                        <button
                            type="button"
                            className={activeFilter === 'liked' ? 'active' : ''}
                            onClick={() => handleFilterChange('liked')}
                        >
                            <FiHeart aria-hidden="true" />
                            Aimes
                            <span>{likedIds.length}</span>
                        </button>
                    </div>
                    <VideoList
                        videos={visibleVideos}
                        selectedVideoId={selectedVideoId}
                        favoriteIds={favoriteIds}
                        likedIds={likedIds}
                        isLoading={loading}
                        onPlayVideo={handlePlayVideo}
                        onToggleFavorite={(video) => toggleSavedVideo(video, 'favorite')}
                        onToggleLike={(video) => toggleSavedVideo(video, 'like')}
                    />
                </aside>
            </section>
        </main>
    );
};

export default App;
