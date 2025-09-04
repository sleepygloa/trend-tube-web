// src/components/VideoItem.js

import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function VideoItem({ video, onVideoSelect, viewType }) {

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
  
  // --- List 뷰일 때의 렌더링 ---
  if (viewType === 'list') {
    return (
      <div className="video-list-item" onClick={() => onVideoSelect(video)}>
        <div className="list-item-checkbox" onClick={handleSave}>
          <input type="checkbox" readOnly />
        </div>
        <img src={video.thumbnail} alt={video.title} className="list-item-thumbnail" />
        <div className="list-item-info">
          <span className="list-item-title">{video.title}</span>
          <span className="list-item-channel">{video.channelTitle}</span>
        </div>
        <div className="list-item-meta">
          <span className="meta-item">{video.id}</span>
          <span className="meta-item">{video.duration}</span>
          <span className="meta-item">{video.viewCount ? `${Number(video.viewCount).toLocaleString()}회` : ''}</span>
        </div>
      </div>
    );
  }

  // --- Grid 또는 Masonry 뷰일 때의 렌더링 ---
  return (
    <div className="video-item">
      <div className="video-player-wrapper" onClick={() => onVideoSelect(video)}>
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