import React from 'react';

const VideoPlayer = ({ videoId }) => {
    const videoUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className='video'>
            <iframe
                width="1440"
                height="415"
                src={videoUrl}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default VideoPlayer;