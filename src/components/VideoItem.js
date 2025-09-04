import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function VideoItem({ video, onVideoSelect }) {

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const videoData = {
        video_id: video.id,
        title: video.title,
        channel_title: video.channelTitle,
        thumbnail_url: video.thumbnail,
      };
      await axios.post('/api/save-video', videoData);
      toast.success('영상이 내 목록에 저장되었습니다!');
    } catch (err) {
      toast.error('영상 저장에 실패했습니다.');
    }
  };
  
  return (
    <div className="video-item" onClick={() => onVideoSelect(video)}>
      <div className="video-player-wrapper">
        <img src={video.thumbnail} alt={video.title} />
        {video.duration && <span className="video-duration">{video.duration}</span>}
      </div>
      <div className="video-info">
        <h4>{video.title}</h4>
        <p>{video.channelTitle}</p>
        <div className="video-meta">
            {video.viewCount && <span className="view-count">조회수: {Number(video.viewCount).toLocaleString()}회</span>}
            <button onClick={handleSave} className="save-button">저장</button>
        </div>
      </div>
    </div>
  );
}

export default VideoItem;