import React from 'react';

const VideoPlayer = ({ videoId, title }) => {
    return (
        <div className="video-player">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title || 'Lecteur video YouTube'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    );
};

export default VideoPlayer;
