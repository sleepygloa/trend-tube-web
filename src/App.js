import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import FilterModal from './components/FilterModal';

function App() {
  const [videos, setVideos] = useState([]); // 동영상 목록 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [modalIsOpen, setModalIsOpen] = useState(false); // 동영상 상세 모달 상태
  const [selectedVideo, setSelectedVideo] = useState(null); // 선택된 동영상 상태
  const [isSplashVisible, setIsSplashVisible] = useState(true); // 스플래시 화면 상태
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false); // 필터 모달 상태

  const [nextPageToken, setNextPageToken] = useState(null); // 다음 페이지 토큰을 저장할 상태
  const [loadingMore, setLoadingMore] = useState(false); // '더 보기' 로딩 상태
  

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
    // '더 보기' 로딩 상태를 true로, 일반 로딩 상태는 token이 없을 때만 true로 설정
    if (token) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]); // 새로 검색할 때는 기존 목록 비우기
    }
    setError(null);

    try {
      // API 요청 시 pageToken을 파라미터로 함께 보냅니다.
      const response = await axios.get('/api/trending', { params: { pageToken: token } });
      
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      
      // 기존 목록 뒤에 새로운 목록을 이어붙입니다.
      const newVideos = token ? [...videos, ...formattedVideos] : formattedVideos;

      newVideos.sort((a, b) => b.viewCount - a.viewCount);
      
      setVideos(newVideos);
      // API로부터 받은 다음 페이지 토큰을 저장합니다.
      setNextPageToken(response.data.nextPageToken);
    } catch (err) {
      setError('실시간 인기 동영상을 불러오는 데 실패했습니다.');
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
          {/* VideoList와 '더 보기' 버튼 렌더링 */}
          {!loading && (
            <>
              <VideoList videos={videos} onVideoSelect={openModal} />
              
              {/* 로딩 중이 아니고, 다음 페이지 토큰이 있을 때만 '더 보기' 버튼을 보여줌 */}
              {!loadingMore && nextPageToken && (
                <button 
                  onClick={() => handleFetchTrending(nextPageToken)} 
                  className="load-more-button"
                >
                  더 보기
                </button>
              )}

              {/* '더 보기'가 로딩 중일 때 표시 */}
              {loadingMore && <p>더 많은 영상을 불러오는 중입니다...</p>}
            </>
          )}
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