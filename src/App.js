import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import SubscriptionForm from './components/SubscriptionForm';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 상태 관리
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 스플래시 효과를 위한 상태 추가
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // 컴포넌트가 처음 렌더링될 때 딱 한 번만 실행되는 로직
  useEffect(() => {
    // 2.5초(2500ms) 후에 스플래시 상태를 false로 변경합니다.
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);

    // 컴포넌트가 사라질 때 타이머를 정리하여 메모리 누수를 방지합니다.
    return () => clearTimeout(timer);
  }, []); // []는 이 useEffect가 단 한 번만 실행되도록 보장합니다.
  
  // '실시간 인기 동영상' 버튼을 눌렀을 때 실행될 함수 (신규 추가)
  const handleFetchTrending = async () => {
    setLoading(true);
    setError('');
    setVideos([]);
    try {
      // YouTube API 직접 호출 결과를 DB 데이터 형식과 맞추기 위해 가공
      const response = await axios.get('/api/trending');
      const formattedVideos = response.data.map(video => ({
        id: video.id, // 임시 ID
        video_id: video.id,
        view_count: video.statistics.viewCount,
        videos: { // 기존 데이터 형식과 맞추기
          title: video.snippet.title,
          channel_title: video.snippet.channelTitle
        }
      }));
      setVideos(formattedVideos);
    } catch (err) {
      setError('실시간 인기 동영상을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
// 기간별 검색 버튼을 눌렀을 때 실행될 함수
  const handleSearch = async (filters) => {
    setLoading(true);
    setError('');
    setVideos([]);
    try {
      // Vercel에 배포된 우리 API(/api/stats)에 GET 요청을 보냅니다.
      // filters 객체가 자동으로 쿼리 파라미터(예: ?from=...&categoryId=...)로 변환됩니다.
      const response = await axios.get('/api/stats', { params: filters });
      setVideos(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  // 모달을 여는 함수
  const openModal = (video) => {
    setSelectedVideo(video);
    setModalIsOpen(true);
  };
  // 모달을 닫는 함수
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedVideo(null);
  };

  return (
    // isSplashVisible 상태에 따라 'splash-active' 클래스를 추가/제거합니다.
    <div className={`App ${isSplashVisible ? 'splash-active' : ''}`}>
      {/* header에도 isSplashVisible 상태에 따라 'splash' 클래스를 추가/제거합니다. */}
      <header className={`App-header ${isSplashVisible ? 'splash' : ''}`}>
        <h1>🚀 TrendTube</h1>
        {/* 스플래시 화면일 때만 부제목을 보여줍니다. */}
        {isSplashVisible && <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>}

        {/* 스플래시가 아닐 때만 헤더 안에 검색 바를 보여줍니다. */}
        {!isSplashVisible && (
          <SearchBar 
            onSearch={handleSearch} 
            onFetchTrending={handleFetchTrending} 
            isLoading={loading} 
          />
        )}
      </header>
      
      {/* 스플래시가 아닐 때만 메인 콘텐츠를 보여줍니다. */}
      {!isSplashVisible && (
        <main>
          <SubscriptionForm /> 
          {error && <p className="error-message">{error}</p>}
          {loading ? <p>데이터를 불러오는 중입니다...</p> : 
            <VideoList videos={videos} onVideoSelect={openModal} />
          }
        </main>
      )}
      
      <VideoDetailModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        videoStat={selectedVideo}
      />
    </div>
  );
}

export default App;