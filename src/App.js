import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

const API_KEY = "AIzaSyD7n0lXwUkj_jKH6m3MW-1c0ED5j5MGrEE";

const App = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState('');

    useEffect(() => {
        getDefaultVideos().then((defaultVideos) => {
            setVideos(defaultVideos);
        });
    }, []);

    const handleSearch = async (query) => {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 15,
                    q: query,
                    key: API_KEY,
                },
            });
            setVideos(response.data.items);
            setSelectedVideoId('');
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlayVideo = (videoId) => {
        setSelectedVideoId(videoId);
    };


    const getDefaultVideos = async () => {
        try {
            const randomTerm = getRandomSearchTerm();
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 15,
                    q: randomTerm,
                    key: API_KEY,
                },
            });
            return response.data.items;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const getRandomSearchTerm = () => {
        const terms = ['french', 'dog', 'nature', 'music', 'food']; // Termes de recherche aléatoires
        const randomIndex = Math.floor(Math.random() * terms.length);
        return terms[randomIndex];
    };


    return (
        <div className='container'>
            <h1 className='title'>Recherche de vidéos YouTube</h1>
            <SearchBar onSearch={handleSearch} />
            {selectedVideoId && <VideoPlayer videoId={selectedVideoId} />}
            {Array.isArray(videos) && videos.length > 0 && !selectedVideoId ? (
                <VideoList videos={videos} onPlayVideo={handlePlayVideo} />
            ) : (
                <VideoList videos={videos} onPlayVideo={handlePlayVideo} />
            )}
        </div>
    );
};

export default App;
