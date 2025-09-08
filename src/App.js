import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient'; // 방금 만든 Supabase 클라이언트 import
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
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());
  const [session, setSession] = useState(null); // 로그인 세션 상태
  const [currentView, setCurrentView] = useState('trending');
  const [savedVideos, setSavedVideos] = useState([]);


  // 앱이 시작될 때와 인증 상태가 변할 때 세션을 업데이트합니다.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 컴포넌트가 처음 마운트될 때 카테고리와 저장된 영상 목록을 불러옵니다.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 카테고리 목록 가져오기
        const catResponse = await axios.get('/api/categories');
        setCategories(catResponse.data.filter(cat => cat.snippet.assignable));

        // 저장된 비디오 ID 목록 가져오기
        const savedResponse = await axios.get('/api/get-saved-videos');
        setSavedVideoIds(new Set(savedResponse.data));
      } catch (error) {
        console.error("초기 데이터 로딩 실패:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
//      handleFetchTrending();
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
      description: video.snippet.description, // 영상 설명 추가
      tags: video.snippet.tags,             // 영상 태그 추가
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
      commentCount: video.statistics?.commentCount, // <-- 이 줄을 추가하세요
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


  // '내 보관함' 영상을 불러오는 함수
  const fetchSavedVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/get-my-videos');
      
      // DB 데이터를 프론트엔드 형식에 맞게 변환
      const formattedData = data.map(item => ({
        id: item.video_id,
        title: item.title,
        channelTitle: item.channel_title,
        thumbnail: item.thumbnail_url,
        // DB에 없는 정보는 null 또는 기본값 처리
        publishedAt: item.created_at, 
        viewCount: null,
        likeCount: null,
        duration: null,
      }));
      setSavedVideos(formattedData);

    } catch(error) {
      toast.error("저장된 영상을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

    // --- handleSave 함수를 App.js로 이동 ---
  const handleSave = async (video) => {
    try {
      const videoData = {
        video_id: video.id,
        title: video.title,
        channel_title: video.channelTitle,
        thumbnail_url: video.thumbnail,
      };
      await axios.post('/api/save-video', videoData);
      
      // 저장 성공 시, savedVideoIds 상태를 업데이트하여 UI에 즉시 반영
      setSavedVideoIds(prevIds => new Set(prevIds).add(video.id));
      toast.success('영상이 내 목록에 저장되었습니다!');
    } catch (err) {
      toast.error('영상 저장에 실패했습니다.');
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


  // --- 이 함수들이 추가되었습니다! ---
  // Google 로그인 함수
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) toast.error('로그인 중 오류가 발생했습니다.');
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('로그아웃 중 오류가 발생했습니다.');
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

            {/* --- 이 부분이 수정되었습니다! --- */}
            {/* 로그인 상태에 따라 다른 버튼을 보여줍니다. */}
            {session ? (
              <button onClick={handleLogout} className="auth-button logout">로그아웃</button>
            ) : (
              <button onClick={handleGoogleLogin} className="auth-button login">로그인</button>
            )}

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

          {session && (
            <div className="view-selector">
              <button onClick={() => setCurrentView('trending')} className={currentView === 'trending' ? 'active' : ''}>실시간 인기</button>
              <button onClick={() => { setCurrentView('saved'); fetchSavedVideos(); }} className={currentView === 'saved' ? 'active' : ''}>내 보관함</button>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          {loading ? (
            <p>데이터를 불러오는 중입니다...</p>
          ) : (
            <>
              {currentView === 'trending' ? (
                <>
                  {/* VideoList에 savedVideoIds와 handleSave 함수 전달 */}
                  <VideoList 
                    videos={videos} 
                    onVideoSelect={openModal} 
                    viewType={viewType}
                    savedVideoIds={savedVideoIds}
                    onSave={handleSave}
                  />
                  {!loadingMore && nextPageToken && (
                    <button 
                      onClick={() => handleFetchTrending(nextPageToken)} 
                      className="load-more-button"
                    >
                      더 보기
                    </button>
                  )}
                </>
              ) : (
                  <VideoList 
                    videos={savedVideos} 
                    onVideoSelect={openModal} 
                    viewType={viewType}
                    savedVideoIds={savedVideoIds}
                    onSave={handleSave}
                  />
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
      

      {/* VideoDetailModal에 savedVideoIds와 handleSave 함수 전달 */}
      <VideoDetailModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        videoData={selectedVideo}
        isSaved={selectedVideo ? savedVideoIds.has(selectedVideo.id) : false}
        onSave={handleSave}
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