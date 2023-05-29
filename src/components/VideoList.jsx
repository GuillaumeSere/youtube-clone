import React from 'react';

const VideoList = ({ videos, onPlayVideo }) => {
  return (
    <div className='video-list'>
      {videos.map((video, id) => (
        <div key={id} className='video-card'>
          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} onClick={() => onPlayVideo(video.id.videoId)} />
          <h2 className='description'>{video.snippet.title}</h2>
        </div>
      ))}
    </div>
  );
};

export default VideoList;