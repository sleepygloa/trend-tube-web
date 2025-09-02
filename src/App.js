import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal'; // 모달 컴포넌트 import
import SubscriptionForm from './components/SubscriptionForm'; // 모달 컴포넌트 import

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 상태 관리
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
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
    <div className="App">
      <header className="App-header">
        <h1>🚀 TrendTube</h1>
        <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>
      </header>
      <main>
        <SearchBar 
        onSearch={handleSearch} 
        onFetchTrending={handleFetchTrending} 
        isLoading={loading} />
        <SubscriptionForm /> 
        {error && <p className="error-message">{error}</p>}
        {loading ? <p>데이터를 불러오는 중입니다...</p> : 
          // VideoList에 openModal 함수를 props로 전달
          <VideoList videos={videos} onVideoSelect={openModal} />
        }
      </main>
      
      {/* 모달 컴포넌트 렌더링 */}
      <VideoDetailModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        videoStat={selectedVideo}
      />
    </div>
  );
}

export default App;