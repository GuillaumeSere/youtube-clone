import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import {
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiYoutube,
} from 'react-icons/fi';
import './App.css';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3/search';
const DEFAULT_SEARCH = 'web development';
const QUICK_SEARCHES = ['React', 'Musique live', 'Cuisine facile', 'Voyage', 'Gaming'];

const App = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState('');
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState(DEFAULT_SEARCH);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedVideo = videos[currentVideoIndex];

    const visibleVideos = useMemo(() => {
        return videos.filter((video) => video?.id?.videoId);
    }, [videos]);

    useEffect(() => {
        fetchVideos(DEFAULT_SEARCH);
    }, []);

    const fetchVideos = async (query) => {
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
            const response = await axios.get(API_URL, {
                params: {
                    part: 'snippet',
                    maxResults: 24,
                    q: cleanQuery,
                    type: 'video',
                    key: API_KEY,
                },
            });

            const videoResults = response.data.items.filter((item) => item?.id?.videoId);
            setVideos(videoResults);
            setSelectedVideoId('');
            setCurrentVideoIndex(0);
        } catch (requestError) {
            setError('Impossible de charger les videos. Verifie ta cle API et ta connexion.');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        fetchVideos(query);
    };

    const handleQuickSearch = (query) => {
        fetchVideos(query);
    };

    const handlePlayVideo = (videoId, index) => {
        setSelectedVideoId(videoId);
        setCurrentVideoIndex(index);
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
                        Recherche des videos YouTube, ouvre un lecteur embarque, puis navigue
                        dans les resultats avec une petite file d'attente.
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
                            <span>Resultats</span>
                            <h2>{searchTerm}</h2>
                        </div>
                        <strong>{visibleVideos.length}</strong>
                    </div>
                    <VideoList
                        videos={visibleVideos}
                        selectedVideoId={selectedVideoId}
                        isLoading={loading}
                        onPlayVideo={handlePlayVideo}
                    />
                </aside>
            </section>
        </main>
    );
};

export default App;
