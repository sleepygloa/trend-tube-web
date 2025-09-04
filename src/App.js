import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import FilterModal from './components/FilterModal';
import { toast } from 'react-hot-toast';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.filter(cat => cat.snippet.assignable));
      } catch (error) {
        console.error("카테고리 목록을 불러오는 데 실패했습니다.", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
      handleFetchTrending();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const formatVideoData = (video) => {
    const formatDuration = (isoDuration) => {
      const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return "0:00";
      const hours = (parseInt(match[1], 10) || 0);
      const minutes = (parseInt(match[2], 10) || 0);
      const seconds = (parseInt(match[3], 10) || 0);
      
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    return {
      id: video.id.videoId || video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails.medium.url,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
      duration: video.contentDetails ? formatDuration(video.contentDetails.duration) : null,
    }
  };

  const handleSplashClick = () => {
    setIsSplashVisible(false);
  };
  
  const handleSearch = async (filters, token = null) => {
    if (token) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]);
      setNextPageToken(null);
    }
    setError(null);

    try {
      let params = { 
        keyword: filters.keyword,
        categoryId: filters.categoryId,
        pageToken: token,
      };

      if (filters.searchType === 'date') {
        alert('기간별 검색은 현재 지원되지 않습니다. 대신 길이별 검색을 이용해주세요.');
        setLoading(false);
        setLoadingMore(false);
        return;
      } else {
        params.duration = filters.duration;
        params.keyword = filters.keyword || '';
      }

      const response = await axios.get('/api/search', { params });
      
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      const existingVideoIds = new Set(videos.map(v => v.id));
      const uniqueNewVideos = formattedVideos.filter(v => !existingVideoIds.has(v.id));
      const newVideos = token ? [...videos, ...uniqueNewVideos] : uniqueNewVideos;
      
      setVideos(newVideos);
      setNextPageToken(response.data.nextPageToken);

      setActiveFilters({
        type: 'search',
        categoryName: categories.find(c => c.id === filters.categoryId)?.snippet.title || '모든 카테고리',
        keyword: filters.keyword,
      });

    } catch (err) {
      setError('검색 데이터를 불러오는 데 실패했습니다.');
      toast.error('검색 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFetchTrending = async (token = null) => {
    if (token) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]);
      setNextPageToken(null);
    }
    setError(null);
    try {
      const response = await axios.get('/api/trending', { params: { pageToken: token } });
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      const existingVideoIds = new Set(videos.map(v => v.id));
      const uniqueNewVideos = formattedVideos.filter(v => !existingVideoIds.has(v.id));
      const newVideos = token ? [...videos, ...uniqueNewVideos] : uniqueNewVideos;
      newVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      setVideos(newVideos);
      setNextPageToken(response.data.nextPageToken);
      if (!token) {
        setActiveFilters({ type: 'trending' });
      }
    } catch (err) {
      setError('실시간 인기 동영상을 불러오는 데 실패했습니다.');
      toast.error('실시간 인기 동영상을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      <header 
        className={`App-header ${isSplashVisible ? 'splash' : ''}`}
        onClick={isSplashVisible ? handleSplashClick : undefined}
      >
        <h1>🚀 TrendTube</h1>
        {isSplashVisible && <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>}
        {!isSplashVisible && (
          <div className="header-controls">
            <div className="header-info">
              {activeFilters?.type === 'trending' && (
                <span className="filter-tag trending">🔥 실시간 인기</span>
              )}
              {activeFilters?.type === 'search' && (
                <>
                  <span className="filter-tag">{activeFilters.categoryName}</span>
                  {activeFilters.keyword && <span className="filter-tag">{`'${activeFilters.keyword}'`}</span>}
                </>
              )}
            </div>
            <button 
              className="filter-button" 
              onClick={() => setFilterModalIsOpen(true)}
              disabled={loading}
            >
              필터
            </button>
          </div>
        )}
      </header>
      
      {!isSplashVisible && (
        <main>
          {error && <p className="error-message">{error}</p>}
          {loading ? (
            <p>데이터를 불러오는 중입니다...</p>
          ) : (
            <>
              <VideoList videos={videos} onVideoSelect={openModal} viewType={viewType} />
              {!loadingMore && nextPageToken && (
                <button 
                  onClick={() => handleFetchTrending(nextPageToken)} 
                  className="load-more-button"
                >
                  더 보기
                </button>
              )}
              {loadingMore && <p>더 많은 영상을 불러오는 중입니다...</p>}
            </>
          )}
        </main>
      )}

      {!isSplashVisible && (
        <div className="fab-container">
          <div className={`fab-actions ${fabOpen ? 'open' : ''}`}>
            <button onClick={() => { setViewType('grid'); setFabOpen(false); }} className="fab-action">
              Grid
            </button>
            <button onClick={() => { setViewType('list'); setFabOpen(false); }} className="fab-action">
              List
            </button>
          </div>
          
          <button 
            onClick={() => setFabOpen(!fabOpen)} 
            className={`fab ${fabOpen ? 'rotate' : ''}`}
            title="뷰 전환"
          >
            +
          </button>
        </div>
      )}
      
      <VideoDetailModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        videoData={selectedVideo}
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
        categories={categories}
      />
    </div>
  );
}

export default App;