import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import FilterModal from './components/FilterModal';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // API 응답 데이터를 프론트엔드에서 사용하기 쉬운 형태로 변환하는 함수
  const formatVideoData = (video) => ({
    id: video.id.videoId || video.id,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails.medium.url,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics?.viewCount, // statistics가 없을 수 있으므로 optional chaining 사용
    likeCount: video.statistics?.likeCount,
  });

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      // '/api/search'는 아직 없으므로, 임시로 '/api/trending'을 호출하도록 수정
      // 나중에 '/api/search'를 만들면 이 부분만 교체하면 됩니다.
      const response = await axios.get('/api/trending', { params: filters });
      setVideos((response.data || []).map(formatVideoData));
    } catch (err) {
      setError('검색 데이터를 불러오는 데 실패했습니다.');
      console.error('Search API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTrending = async () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      const response = await axios.get('/api/trending');
      // response.data가 배열인지 확인하고, 아니면 빈 배열로 처리
      setVideos((response.data || []).map(formatVideoData));
    } catch (err) {
      setError('실시간 인기 동영상을 불러오는 데 실패했습니다.');
      console.error('Trending API error:', err);
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
          <button 
            className="filter-button" 
            onClick={() => setFilterModalIsOpen(true)}
            disabled={loading}
          >
            필터
          </button>
        )}
      </header>
      
      {!isSplashVisible && (
        <main>
          {error && <p className="error-message">{error}</p>}
          {loading ? <p>데이터를 불러오는 중입니다...</p> : 
            <VideoList videos={videos} onVideoSelect={openModal} />
          }
        </main>
      )}
      
      <VideoDetailModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        videoData={selectedVideo} // props 이름을 videoStat -> videoData로 변경
      />

      <FilterModal
        modalIsOpen={filterModalIsOpen}
        closeModal={() => setFilterModalIsOpen(false)}
        onSearch={(filters) => {
          handleSearch(filters);
          setFilterModalIsOpen(false);
        }}
        onFetchTrending={() => {
          handleFetchTrending();
          setFilterModalIsOpen(false);
        }}
        isLoading={loading}
      />
    </div>
  );
}

export default App;