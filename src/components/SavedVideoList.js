import React from 'react';
import VideoList from './VideoList'; // 기존 VideoList를 재사용하여 UI 일관성 유지

function SavedVideoList({ savedVideos, onVideoSelect, viewType, savedVideoIds, onSave, session }) {
  if (!savedVideos || savedVideos.length === 0) {
    return (
      <div className="empty-saved-list">
        <h3>보관함이 비어있습니다.</h3>
        <p>마음에 드는 영상을 저장하고 나만의 트렌드 라이브러리를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <VideoList
      videos={savedVideos}
      onVideoSelect={onVideoSelect}
      viewType={viewType}
      savedVideoIds={savedVideoIds}
      onSave={onSave}
      session={session}
    />
  );
}

export default SavedVideoList;
