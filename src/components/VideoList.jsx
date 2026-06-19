import React from 'react';
import { FiPlayCircle } from 'react-icons/fi';

const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
};

const VideoList = ({ videos, selectedVideoId, isLoading, onPlayVideo }) => {
    if (isLoading) {
        return (
            <div className="video-list" aria-label="Chargement des videos">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div className="video-card skeleton" key={index}>
                        <div className="thumb-placeholder" />
                        <div className="line wide" />
                        <div className="line" />
                    </div>
                ))}
            </div>
        );
    }

    if (!videos.length) {
        return <p className="empty-results">Aucun resultat pour le moment.</p>;
    }

    return (
        <div className="video-list">
            {videos.map((video, index) => {
                const videoId = video.id.videoId;
                const isSelected = videoId === selectedVideoId;

                return (
                    <button
                        type="button"
                        key={videoId}
                        className={isSelected ? 'video-card selected' : 'video-card'}
                        onClick={() => onPlayVideo(videoId, index)}
                    >
                        <span className="thumbnail-wrap">
                            <img
                                src={video.snippet.thumbnails.medium.url}
                                alt=""
                                loading="lazy"
                            />
                            <span className="play-badge">
                                <FiPlayCircle aria-hidden="true" />
                            </span>
                        </span>
                        <span className="video-meta">
                            <strong>{video.snippet.title}</strong>
                            <span>{video.snippet.channelTitle}</span>
                            <small>{formatDate(video.snippet.publishedAt)}</small>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default VideoList;
