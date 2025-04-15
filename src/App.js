import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import { TiSocialYoutube } from "react-icons/ti";
import './App.css';

const API_KEY = "AIzaSyCYC8-sKprgUBCynXvWRz7383ItBj4TbbI";

const App = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState('');
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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
                    maxResults: 32,
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
                    maxResults: 32,
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

    const playNextVideo = () => {
        const nextIndex = (currentVideoIndex + 1) % videos.length;
        const nextVideoId = videos[nextIndex].id;
        setSelectedVideoId(nextVideoId);
        setCurrentVideoIndex(nextIndex);
      };

    return (
        <div className='container'>
            <h1 className='title'>Recherche de vidéos YouTube<TiSocialYoutube className='icon' /></h1>
            <SearchBar onSearch={handleSearch} />
            {selectedVideoId && <VideoPlayer videoId={selectedVideoId} onNextVideo={playNextVideo} isLastVideo={currentVideoIndex === videos.length - 1} />}
            {Array.isArray(videos) && videos.length > 0 && !selectedVideoId ? (
                <VideoList videos={videos} onPlayVideo={handlePlayVideo} />
            ) : (
                <VideoList videos={videos} onPlayVideo={handlePlayVideo} />
            )}
        </div>
    );
};

export default App;
