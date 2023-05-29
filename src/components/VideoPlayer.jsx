import React from 'react';

const VideoPlayer = ({ videoId, onNextVideo, isLastVideo }) => {
    const handleVideoEnd = () => {
      if (isLastVideo) {
        onNextVideo(); // Appeler onNextVideo pour passer à la première vidéo
      }
    };

    return (
        <div className='video'>
            <iframe
                width="1440"
                height="415"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube Video Player"
                allowFullScreen
                onEnded={handleVideoEnd} // Ajouter l'événement onEnded
            />
        </div>
    );
};

export default VideoPlayer;