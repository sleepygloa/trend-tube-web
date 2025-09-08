import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';
import './App.css';
import VideoList from './components/VideoList';
import VideoDetailModal from './components/VideoDetailModal';
import FilterModal from './components/FilterModal';
import { Toaster, toast } from 'react-hot-toast';
import { FiLogOut, FiFilter } from 'react-icons/fi';

function App() {
  // --- 상태 관리 (State Management) ---
  const [videos, setVideos] = useState([]); // '실시간 인기' 또는 '검색' 결과 비디오 목록
  const [savedVideos, setSavedVideos] = useState([]); // '내 보관함' 비디오 목록
  const [loading, setLoading] = useState(false); // 메인 로딩 상태
  const [loadingMore, setLoadingMore] = useState(false); // '더 보기' 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지 상태

  const [modalIsOpen, setModalIsOpen] = useState(false); // 상세 정보 모달 상태
  const [selectedVideo, setSelectedVideo] = useState(null); // 선택된 비디오 정보
  
  const [isSplashVisible, setIsSplashVisible] = useState(true); // 스플래시 화면 표시 상태
  const [filterModalIsOpen, setFilterModalIsOpen] = useState(false); // 필터 모달 상태

  const [nextPageToken, setNextPageToken] = useState(null); // 다음 페이지 토큰 (페이징용)
  const [categories, setCategories] = useState([]); // 유튜브 카테고리 목록
  const [activeFilters, setActiveFilters] = useState(null); // 헤더에 표시될 현재 필터 정보

  const [viewType, setViewType] = useState('grid'); // 현재 뷰 타입 ('grid', 'list', 'masonry')
  const [fabOpen, setFabOpen] = useState(false); // 플로팅 버튼 확장 상태

  const [session, setSession] = useState(null); // 로그인 세션 상태
  const [savedVideoIds, setSavedVideoIds] = useState(new Set()); // 저장된 비디오 ID 목록 (빠른 확인용)
  const [currentView, setCurrentView] = useState('trending'); // 현재 화면 ('trending' 또는 'saved')

  // --- 효과 (Effects) ---

  // 1. 앱 시작 시 사용자 세션 확인 및 인증 상태 변경 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. 초기 데이터 로딩 (카테고리, 저장된 비디오 목록)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catResponse = await axios.get('/api/categories');
        setCategories(catResponse.data.filter(cat => cat.snippet.assignable));

        if (session) {
          const savedResponse = await axios.get('/api/get-my-videos', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          setSavedVideoIds(new Set(savedResponse.data.map(v => v.video_id)));
        }
      } catch (error) {
        console.error("초기 데이터 로딩 실패:", error);
      }
    };
    fetchInitialData();
  }, [session]); // 로그인/로그아웃 시 저장된 비디오 목록을 다시 불러옴

  // 3. 스플래시 화면 처리 및 초기 '인급동' 데이터 로딩
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
      // handleFetchTrending({ regionCode: 'KR' }); // 기본값으로 한국 인기 동영상 로드
    }, 2500);
    return () => clearTimeout(timer);
  }, []); // 이 useEffect는 앱이 처음 실행될 때 단 한 번만 실행됨

  // --- 데이터 처리 함수 ---

  // 유튜브 API 응답을 프론트엔드에서 사용하기 쉬운 형태로 변환
  const formatVideoData = (video) => {
    const formatDuration = (isoDuration) => {
      if (!isoDuration) return null;
      const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return "0:00";
      const hours = parseInt(match[1], 10) || 0;
      const minutes = parseInt(match[2], 10) || 0;
      const seconds = parseInt(match[3], 10) || 0;
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
      description: video.snippet.description,
      tags: video.snippet.tags,
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
      commentCount: video.statistics?.commentCount,
      duration: video.contentDetails ? formatDuration(video.contentDetails.duration) : null,
    };
  };

  // --- 이벤트 핸들러 ---

  // 스플래시 화면 클릭
  const handleSplashClick = () => setIsSplashVisible(false);

  // '상세 검색' 실행
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
      let publishedAfter = null;
      if (filters.published && filters.published !== 'all') {
        const now = new Date();
        if (filters.published === 'hour') publishedAfter = new Date(now.setHours(now.getHours() - 1)).toISOString();
        if (filters.published === 'today') publishedAfter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        if (filters.published === 'week') publishedAfter = new Date(now.setDate(now.getDate() - 7)).toISOString();
        if (filters.published === 'month') publishedAfter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        if (filters.published === 'year') publishedAfter = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      }
      
      const params = { 
        keyword: filters.keyword || '',
        order: filters.order,
        duration: filters.duration,
        publishedAfter,
        regionCode: filters.regionCode,
        pageToken: token, // pageToken을 filters에서가 아닌, 함수의 두 번째 인자(token)에서 받음
      };
      
      const response = await axios.get('/api/search', { params });
      
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      const newVideos = token ? [...videos, ...formattedVideos] : formattedVideos;
      
      setVideos(newVideos);
      setNextPageToken(response.data.nextPageToken);

      if (!token) {
        setActiveFilters({ type: 'search', ...filters });
      }
    } catch (err) {
      toast.error('검색 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // '실시간 인기' 실행
  const handleFetchTrending = async (filters, token = null) => {
    if (token) setLoadingMore(true);
    else { setLoading(true); setVideos([]); setNextPageToken(null); }
    setError(null);

    try {
      const params = { 
        regionCode: filters?.regionCode, 
        videoCategoryId: filters?.categoryId,
        pageToken: token 
      };
      const response = await axios.get('/api/trending', { params });
      
      const formattedVideos = (response.data.items || []).map(formatVideoData);
      const existingVideoIds = new Set(videos.map(v => v.id));
      const uniqueNewVideos = formattedVideos.filter(v => !existingVideoIds.has(v.id));
      
      const newVideos = token ? [...videos, ...uniqueNewVideos] : uniqueNewVideos;
      newVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      
      setVideos(newVideos);
      setNextPageToken(response.data.nextPageToken);

      if (!token) {
        setActiveFilters({ type: 'trending', ...filters });
      }
    } catch (err) {
      toast.error('실시간 인기 동영상을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  };

  // '내 보관함' 목록 불러오기
  const fetchSavedVideos = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/get-my-videos', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const formattedData = data.map(item => ({
        id: item.video_id,
        title: item.title,
        channelTitle: item.channel_title,
        thumbnail: item.thumbnail_url,
        publishedAt: item.created_at,
        // DB 데이터에는 없는 정보는 null로 처리
        viewCount: null, likeCount: null, duration: null,
      }));
      setSavedVideos(formattedData);
    } catch(error) {
      toast.error("저장된 영상을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // '저장' 버튼 클릭
  const handleSave = async (video) => {
    if (!session) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    try {
      const videoData = {
        video_id: video.id,
        title: video.title,
        channel_title: video.channelTitle,
        thumbnail_url: video.thumbnail,
      };
      await axios.post('/api/save-video', { videoData, accessToken: session.access_token });
      setSavedVideoIds(prevIds => new Set(prevIds).add(video.id));
      toast.success('영상이 내 보관함에 저장되었습니다!');
    } catch (err) {
      toast.error('영상 저장에 실패했습니다.');
    }
  };

  // 상세 모달 열기/닫기
  const openModal = (video) => { setSelectedVideo(video); setModalIsOpen(true); };
  const closeModal = () => { setModalIsOpen(false); setSelectedVideo(null); };

  // 로그인/로그아웃
  const handleGoogleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }); };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  // --- 렌더링 (JSX) ---
  return (
    <div className={`App ${isSplashVisible ? 'splash-active' : ''}`}>
      <Toaster position="bottom-center" />
      <header 
        className={`App-header ${isSplashVisible ? 'splash' : ''}`}
        onClick={isSplashVisible ? handleSplashClick : undefined}
      >
        <h1>🚀 TrendTube</h1>
        {isSplashVisible && <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>}
        {!isSplashVisible && (
          <div className="header-controls">
            <div className="header-info">
              {activeFilters?.type === 'trending' && <span className="filter-tag trending">🔥 실시간 인기</span>}
              {activeFilters?.type === 'search' && (
                <>
                  <span className="filter-tag">{activeFilters.categoryName}</span>
                  {activeFilters.keyword && <span className="filter-tag">{`'${activeFilters.keyword}'`}</span>}
                </>
              )}
            </div>
            {session ? (
              <button onClick={handleLogout} className="auth-button logout" title="로그아웃">
                <FiLogOut size={20} />
                <span className="button-text">로그아웃</span>
              </button>
            ) : (
              <button onClick={handleGoogleLogin} className="auth-button login">로그인</button>
            )}
            <button 
              className="filter-button" 
              onClick={() => setFilterModalIsOpen(true)}
              disabled={loading}
              title="필터"
            >
              <FiFilter size={20} />
              <span className="button-text">필터</span>
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
          {loading && <p>데이터를 불러오는 중입니다...</p>}
          
          {!loading && (
            <>
              {currentView === 'trending' ? (
                <VideoList 
                  videos={videos} 
                  onVideoSelect={openModal} 
                  viewType={viewType}
                  savedVideoIds={savedVideoIds}
                  onSave={handleSave}
                  session={session}
                />
              ) : (
                <VideoList 
                  videos={savedVideos} 
                  onVideoSelect={openModal} 
                  viewType={viewType}
                  savedVideoIds={savedVideoIds}
                  onSave={handleSave}
                  session={session}
                />
              )}
              {/* '더 보기' 버튼이 handleSearch를 호출하도록 수정 */}
              {!loadingMore && nextPageToken && (
                <button 
                  onClick={() => {
                    if (activeFilters.type === 'trending') {
                      handleFetchTrending(activeFilters, nextPageToken);
                    } else {
                      handleSearch(activeFilters, nextPageToken);
                    }
                  }} 
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
            <button onClick={() => { setViewType('grid'); setFabOpen(false); }} className="fab-action">Grid</button>
            <button onClick={() => { setViewType('list'); setFabOpen(false); }} className="fab-action">List</button>
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
        isSaved={selectedVideo ? savedVideoIds.has(selectedVideo.id) : false}
        onSave={handleSave}
        session={session}
      />

      <FilterModal
        modalIsOpen={filterModalIsOpen}
        closeModal={() => setFilterModalIsOpen(false)}
        onSearch={(filters) => {
          handleSearch(filters);
          setFilterModalIsOpen(false);
        }}
        onFetchTrending={(filters) => {
          handleFetchTrending(filters);
          setFilterModalIsOpen(false);
        }}
        isLoading={loading}
        categories={categories}
      />
    </div>
  );
}

export default App;
