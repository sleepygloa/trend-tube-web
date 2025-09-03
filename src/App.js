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
    setNextPageToken(null); // 새로운 검색이므로 토큰 초기화
    try {
      // 현재는 trending API를 사용하지만, search API도 동일한 구조로 응답하도록 만들어야 합니다.
      const response = await axios.get('/api/trending', { params: filters });
      
      // 'items'를 추출하고, 없으면 빈 배열로 설정하는 로직 추가
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      
      // 검색 결과도 조회수 순으로 정렬 (선택사항)
      formattedVideos.sort((a, b) => b.viewCount - a.viewCount);

      setVideos(formattedVideos);
      // 검색 결과에 대한 다음 페이지 토큰도 저장
      setNextPageToken(response.data.nextPageToken);
    } catch (err) {
      setError('검색 데이터를 불러오는 데 실패했습니다.');
      console.error('Search API error:', err);
    } finally {
      setLoading(false);
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

      let newVideos;
      if (token) {
        // --- 이 부분이 수정/추가되었습니다! ---
        // 기존 비디오 ID 목록을 Set으로 만들어 빠른 조회를 가능하게 합니다.
        const existingVideoIds = new Set(videos.map(v => v.id));
        // 새로운 비디오 목록에서 이미 존재하는 ID는 필터링하여 제외합니다.
        const uniqueNewVideos = formattedVideos.filter(v => !existingVideoIds.has(v.id));
        newVideos = [...videos, ...uniqueNewVideos];
      } else {
        newVideos = formattedVideos;
      }

      newVideos.sort((a, b) => b.viewCount - a.viewCount);

      setVideos(newVideos);
      setNextPageToken(response.data.nextPageToken);

      // 만약 더 이상 불러올 페이지가 없다면 '더 보기' 버튼이 사라집니다.
      if (!response.data.nextPageToken && token) {
        alert("마지막 페이지입니다.");
      }

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
          {loading ? (
            <p>데이터를 불러오는 중입니다...</p>
          ) : (
            <>
              <VideoList videos={videos} onVideoSelect={openModal} />
              
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