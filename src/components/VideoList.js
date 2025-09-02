import React from 'react';

function VideoList({ videos, onVideoSelect }) { 
  const handleVideoClick = (videoStat) => {
    onVideoSelect(videoStat); // 부모(App.js)의 openModal 함수를 실행
    // 임시로 alert 창을 띄워 상세 정보를 보여줍니다.
    // (추후 이 부분을 예쁜 Modal 창으로 교체할 예정입니다.)
    const videoInfo = videoStat.videos;
    alert(`
      제목: ${videoInfo.title}
      채널: ${videoInfo.channel_title}
      조회수: ${Number(videoStat.view_count).toLocaleString()}회
    `);
  };

  const handleVideoDoubleClick = (videoStat) => {
    // 새 탭에서 유튜브 영상 페이지를 엽니다.
    window.open(`https://www.youtube.com/watch?v=${videoStat.video_id}`, '_blank');
  };

  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. '검색' 버튼을 눌러 최신 데이터를 확인하세요.</p>;
  }

  return (
    <div className="video-list">
      {videos.map((videoStat) => (
        <div 
          key={videoStat.id} 
          className="video-item"
          // 클릭 및 더블클릭 이벤트 핸들러 추가
          onClick={() => handleVideoClick(videoStat)}
          onDoubleClick={() => handleVideoDoubleClick(videoStat)}
          title="클릭: 상세 정보, 더블클릭: 영상 재생" // 마우스를 올리면 팁이 보임
        >
          <img src={`https://i.ytimg.com/vi/${videoStat.video_id}/mqdefault.jpg`} alt={videoStat.videos.title} />
          <div className="video-info">
            <h4>{videoStat.videos.title}</h4>
            <p>{videoStat.videos.channel_title}</p>
            <p>조회수: {Number(videoStat.view_count).toLocaleString()}회</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoList;