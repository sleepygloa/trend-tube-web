import React, { useState } from 'react';
import DatePicker from 'react-datepicker'; // DatePicker는 이제 사용하지 않으므로 삭제해도 됩니다.
import "react-datepicker/dist/react-datepicker.css";

function SearchBar({ onSearch, onFetchTrending, isLoading, categories = [] }) {
  const [searchType, setSearchType] = useState('trending'); // 'trending' 또는 'search'
  
  // Trending 상태
  const [regionCode, setRegionCode] = useState('KR');
  const [trendingCategory, setTrendingCategory] = useState('');

  // Search 상태
  const [keyword, setKeyword] = useState('');
  const [order, setOrder] = useState('relevance');
  const [published, setPublished] = useState('all');
  const [duration, setDuration] = useState('any');

  // --- 데이터 목록 ---
  const regionOptions = [
    { value: 'KR', label: '한국 🇰🇷' },
    { value: 'US', label: '미국 🇺🇸' },
    { value: 'JP', label: '일본 🇯🇵' },
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
      onFetchTrending({ regionCode, categoryId: trendingCategory });
    } else {
      onSearch({ keyword, order, published, duration });
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
              {regionOptions.map(opt => <button type="button" key={opt.value} className={regionCode === opt.value ? 'active' : ''} onClick={() => setRegionCode(opt.value)}>{opt.label}</button>)}
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
            <input id="keyword-input" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어 입력" />
          </div>
          <div className="form-group">
            <label>정렬 기준</label>
            <div className="button-group">
              {orderOptions.map(opt => <button type="button" key={opt.value} className={order === opt.value ? 'active' : ''} onClick={() => setOrder(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label>업로드 날짜</label>
            <div className="button-group">
              {publishedOptions.map(opt => <button type="button" key={opt.value} className={published === opt.value ? 'active' : ''} onClick={() => setPublished(opt.value)}>{opt.label}</button>)}
            </div>
          </div>
          <div className="form-group">
            <label>영상 길이</label>
            <div className="button-group">
              {durationOptions.map(opt => <button type="button" key={opt.value} className={duration === opt.value ? 'active' : ''} onClick={() => setDuration(opt.value)}>{opt.label}</button>)}
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