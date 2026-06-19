import React from 'react';
import { FiBookmark, FiEye, FiHeart, FiPlayCircle } from 'react-icons/fi';

const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
};

const formatViews = (views) => {
    const viewCount = Number(views);

    if (!Number.isFinite(viewCount)) {
        return 'Vues indisponibles';
    }

    return `${new Intl.NumberFormat('fr-FR', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(viewCount)} vues`;
};

const VideoList = ({
    videos,
    selectedVideoId,
    favoriteIds,
    likedIds,
    isLoading,
    onPlayVideo,
    onToggleFavorite,
    onToggleLike,
}) => {
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
                    <article
                        key={videoId}
                        className={isSelected ? 'video-card selected' : 'video-card'}
                    >
                        <button
                            type="button"
                            className="thumbnail-button"
                            onClick={() => onPlayVideo(videoId, index)}
                            aria-label={`Lire ${video.snippet.title}`}
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
                        </button>
                        <span className="video-meta">
                            <button
                                type="button"
                                className="video-title-button"
                                onClick={() => onPlayVideo(videoId, index)}
                            >
                                {video.snippet.title}
                            </button>
                            <span>{video.snippet.channelTitle}</span>
                            <span className="video-stats">
                                <small>{formatDate(video.snippet.publishedAt)}</small>
                                <small>
                                    <FiEye aria-hidden="true" />
                                    {formatViews(video.statistics?.viewCount)}
                                </small>
                            </span>
                            <span className="video-actions">
                                <button
                                    type="button"
                                    className={favoriteIds.includes(videoId) ? 'active' : ''}
                                    onClick={() => onToggleFavorite(video)}
                                    aria-label={
                                        favoriteIds.includes(videoId)
                                            ? 'Retirer des favoris'
                                            : 'Ajouter aux favoris'
                                    }
                                >
                                    <FiBookmark aria-hidden="true" />
                                    Favori
                                </button>
                                <button
                                    type="button"
                                    className={likedIds.includes(videoId) ? 'active like' : 'like'}
                                    onClick={() => onToggleLike(video)}
                                    aria-label={
                                        likedIds.includes(videoId)
                                            ? 'Retirer le jaime'
                                            : 'Ajouter un jaime'
                                    }
                                >
                                    <FiHeart aria-hidden="true" />
                                    J'aime
                                </button>
                            </span>
                        </span>
                    </article>
                );
            })}
        </div>
    );
};

export default VideoList;
