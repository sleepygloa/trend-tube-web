import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
// import SearchBar from './components/SearchBar'; // 이제 SearchBar는 FilterModal 내부에서만 사용합니다.
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import SubscriptionForm from './components/SubscriptionForm';
import FilterModal from './components/FilterModal';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // 필터 모달의 열림/닫힘 상태를 관리하는 새로운 state
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);

  useEffect(() => {
    // 3초 후 스플래시 화면 숨김
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async ({ startDate, endDate, keyword, category }) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await axios.get('/api/search', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          keyword,
          category
        }
      });
      setVideos(response.data.items || []);
    } catch (err) {
      setError('검색 데이터를 불러오는 데 실패했습니다.');
      console.error('Search API error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/trending');
      setVideos(response.data.items || []);
    } catch (err) {
      setError('실시간 인기 동영상을 불러오는 데 실패했습니다.');
      console.error('Trending API error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (video) => {
    setSelectedVideo(video);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className={`App ${isSplashVisible ? 'splash-active' : ''}`}>
      <header className={`App-header ${isSplashVisible ? 'splash' : ''}`}>
        <h1>🚀 TrendTube</h1>
        {isSplashVisible && <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>}
        
        {!isSplashVisible && (
          <>
            {/* 웹/모바일 모두 '필터' 버튼만 표시 */}
            <button 
              className="filter-button" 
              onClick={() => setFilterModalIsOpen(true)}
              disabled={loading}
            >
              필터
            </button>
          </>
        )}
      </header>
      
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

      {/* 필터 모달 */}
      <FilterModal
        modalIsOpen={filterModalIsOpen}
        closeModal={() => setFilterModalIsOpen(false)}
        onSearch={(filters) => {
          handleSearch(filters);
          setFilterModalIsOpen(false); // 검색 후 모달 닫기
        }}
        onFetchTrending={() => {
          handleFetchTrending();
          setFilterModalIsOpen(false); // 인급동 조회 후 모달 닫기
        }}
        isLoading={loading}
      />
    </div>
  );
}

export default App;