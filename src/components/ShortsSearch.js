// src/components/ShortsSearch.js
import React, { useState } from 'react';

function ShortsSearch({ onSearch, isLoading }) {
  const [duration, setDuration] = useState('short'); // 기본값 '1분 이하'
  const [keyword, setKeyword] = useState('');

  const durationOptions = [
    { value: 'short', label: '4분 이하' }, // YouTube API는 'short'를 4분 이하로 정의
    { value: 'medium', label: '4~20분' },
    { value: 'long', label: '20분 이상' },
  ];

  const handleSearch = () => {
    // #shorts를 키워드에 추가하여 쇼츠 검색 우선순위를 높임
    const searchQuery = keyword ? `${keyword} #shorts` : '#shorts';
    onSearch({ duration, keyword: searchQuery });
  };

  return (
    <div className="shorts-search-container">
      <h3>🎬 길이별 동영상 검색</h3>
      <div className="shorts-filters">
        <div className="duration-buttons">
          {durationOptions.map(opt => (
            <button
              key={opt.value}
              className={duration === opt.value ? 'active' : ''}
              onClick={() => setDuration(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드를 입력하세요 (선택)"
        />
        <button onClick={handleSearch} disabled={isLoading} className="search-button">
          검색
        </button>
      </div>
    </div>
  );
}

export default ShortsSearch;