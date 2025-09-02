import React, { useState } from 'react';

function SearchBar({ onSearch, isLoading }) {
  const [keyword, setKeyword] = useState('');
  // (추후 날짜, 채널명 등 다른 필터 state도 여기에 추가)

  const handleSubmit = (e) => {
    e.preventDefault(); // form의 기본 새로고침 동작을 막음
    const filters = { keyword };
    onSearch(filters); // 부모 컴포넌트(App.js)의 handleSearch 함수를 실행
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="키워드를 입력하세요 (현재는 기능 구현 전)"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '검색 중...' : '검색'}
      </button>
    </form>
  );
}

export default SearchBar;