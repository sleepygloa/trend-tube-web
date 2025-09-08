import React, { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";

function SearchBar({ onSearch, onFetchTrending, isLoading, categories = [] }) {
  const [searchType, setSearchType] = useState('trending'); // 'trending' 또는 'search'
  
  // Trending 상태
  const [trendingRegion, setTrendingRegion] = useState('KR');
  const [trendingCategory, setTrendingCategory] = useState('');

  // Search 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchOrder, setSearchOrder] = useState('relevance');
  const [searchPublished, setSearchPublished] = useState('all');
  const [searchDuration, setSearchDuration] = useState('any');
  const [searchRegion, setSearchRegion] = useState('KR'); // 상세 검색용 국가 상태 추가

  // --- 데이터 목록 ---
  const regionOptions = [
    { value: 'KR', label: '한국 🇰🇷' },
    { value: 'US', label: '미국 🇺🇸' },
    { value: 'JP', label: '일본 🇯🇵' },
    { value: 'VN', label: '베트남 🇻🇳' },
    { value: 'IN', label: '인도 🇮🇳' },
  ];
  const orderOptions = [
    { value: 'relevance', label: '관련성' },
    { value: 'viewCount', label: '조회수' },
    { value: 'date', label: '최신순' },
    { value: 'rating', label: '평점순' },
  ];
  const publishedOptions = [
    { value: 'all', label: '전체 기간' },
    { value: 'hour', label: '1시간 이내' },
    { value: 'today', label: '오늘' },
    { value: 'week', label: '이번 주' },
    { value: 'month', label: '이번 달' },
    { value: 'year', label: '올해' },
  ];
  const durationOptions = [
    { value: 'any', label: '모든 길이' },
    { value: 'short', label: '4분 이하 (쇼츠)' },
    { value: 'medium', label: '4~20분' },
    { value: 'long', label: '20분 이상' },
  ];

  const handleApply = () => {
    if (searchType === 'trending') {
      onFetchTrending({ regionCode: trendingRegion, categoryId: trendingCategory });
    } else {
      onSearch({ 
        keyword: searchKeyword, 
        order: searchOrder, 
        published: searchPublished, 
        duration: searchDuration,
        regionCode: searchRegion, // 국가 코드 전달
      });
    }
  };
  
  // #shorts 태그를 키워드에 추가하는 함수
  const addShortsTag = () => {
    if (!searchKeyword.includes('#shorts')) {
      setSearchKeyword(prev => (prev ? `${prev} #shorts` : '#shorts').trim());
    }
  };

  return (
    <div className="search-bar">
      <div className="search-type-selector">
        <button type="button" className={searchType === 'trending' ? 'active' : ''} onClick={() => setSearchType('trending')}>🔥 실시간 인기</button>
        <button type="button" className={searchType === 'search' ? 'active' : ''} onClick={() => setSearchType('search')}>🔍 상세 검색</button>
      </div>

      {searchType === 'trending' ? (
        <>
          <div className="form-group">
            <label>국가 선택</label>
            <div className="button-group">
              {regionOptions.map(opt => <button type="button" key={opt.value} className={trendingRegion === opt.value ? 'active' : ''} onClick={() => setTrendingRegion(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="trending-category-select">카테고리</label>
            <select id="trending-category-select" value={trendingCategory} onChange={(e) => setTrendingCategory(e.target.value)}>
              <option value="">모든 카테고리</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.snippet.title}</option>))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="keyword-input">키워드</label>
            <div className="keyword-input-group">
              <input id="keyword-input" type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="검색어 입력" />
              <button type="button" onClick={addShortsTag} className="shorts-tag-button">#shorts</button>
            </div>
          </div>
          {/* 상세 검색에도 국가 선택 기능 추가 */}
          <div className="form-group">
            <label>국가 선택</label>
            <div className="button-group">
              {regionOptions.map(opt => <button type="button" key={opt.value} className={searchRegion === opt.value ? 'active' : ''} onClick={() => setSearchRegion(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label>정렬 기준</label>
            <div className="button-group">
              {orderOptions.map(opt => <button type="button" key={opt.value} className={searchOrder === opt.value ? 'active' : ''} onClick={() => setSearchOrder(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label>업로드 날짜</label>
            <div className="button-group">
              {publishedOptions.map(opt => <button type="button" key={opt.value} className={searchPublished === opt.value ? 'active' : ''} onClick={() => setSearchPublished(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label>영상 길이</label>
            <div className="button-group">
              {durationOptions.map(opt => <button type="button" key={opt.value} className={searchDuration === opt.value ? 'active' : ''} onClick={() => setSearchDuration(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
        </>
      )}
      
      <div className="form-actions">
        <button onClick={handleApply} disabled={isLoading} className="search-button">
          검색 적용
        </button>
      </div>
    </div>
  );
}

export default SearchBar;