import React from 'react';

function VideoList({ videos = [], onVideoSelect }) { 
  if (videos.length === 0) {
    return <p>검색 결과가 없습니다. '검색' 버튼을 눌러 최신 데이터를 확인하세요.</p>;
  }

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


  return (
    <div className="video-list">
      {videos.map((video) => ( // videoStat -> video로 변경
        <div 
          key={video.id.videoId || video.id} // trending API와 search API의 id 구조가 다르므로 둘 다 처리
          className="video-item"
          onClick={() => onVideoSelect(video)}
          title="클릭: 상세 정보"
        >
          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
          <div className="video-info">
            <h4>{video.snippet.title}</h4>
            <p>{video.snippet.channelTitle}</p>
            {/* search API는 statistics가 없으므로 조건부 렌더링 */}
            {video.statistics && <p>조회수: {Number(video.statistics.viewCount).toLocaleString()}회</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoList;