import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function SearchBar({ onSearch, onFetchTrending, isLoading }) {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('0'); // '0'은 '모든 카테고리'를 의미

  const categories = [
    { value: "0", name: "모든 카테고리" },
    { value: "1", name: "영화 및 애니메이션" },
    { value: "2", name: "자동차 및 교통" },
    { value: "10", name: "음악" },
    { value: "15", name: "애완동물 및 동물" },
    { value: "17", "name": "스포츠" },
    { value: "19", "name": "여행 및 이벤트" },
    { value: "20", "name": "게임" },
    { value: "22", "name": "블로그" },
    { value: "23", "name": "코미디" },
    { value: "24", "name": "엔터테인먼트" },
    { value: "25", "name": "뉴스 및 정치" },
    { value: "26", "name": "하우투 및 스타일" },
    { value: "27", "name": "교육" },
    { value: "28", "name": "과학 및 기술" },
    { value: "29", "name": "비영리 및 활동" },
    { value: "30", "name": "영화" },
    { value: "43", "name": "쇼" }
  ];

  // 날짜 프리셋 버튼 클릭 시 실행될 함수
  const setDatePreset = (preset) => {
    const today = new Date();
    let newStartDate;

    switch(preset) {
      case 'today':
        newStartDate = new Date();
        break;
      case 'week':
        newStartDate = new Date(today.setDate(today.getDate() - 6));
        break;
      case 'month':
        newStartDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'year':
        newStartDate = new Date(today.getFullYear(), 0, 1); // 올해 1월 1일
        break;
      default:
        newStartDate = new Date();
    }
    setStartDate(newStartDate);
    setEndDate(new Date()); // 종료일은 항상 오늘로 설정
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ startDate, endDate, keyword, category });
  };

  // onFetchTrending 함수가 실행될 때마다, 즉 인급동 버튼이 눌릴 때마다 실행됨
  useEffect(() => {
    // onFetchTrending이 props로 잘 전달되는지 확인 (선택사항)
    // console.log("SearchBar: onFetchTrending prop is available.");
  }, [onFetchTrending]);


  return (
    <>
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="date-picker-container">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            className="date-input"
            maxDate={new Date()}
          />
          <span>~</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            className="date-input"
            maxDate={new Date()}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="키워드"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button type="submit" disabled={isLoading}>
          기간별 검색
        </button>

        <button type="button" className="trending-button" onClick={onFetchTrending} disabled={isLoading}>
          🔥 실시간 인기
        </button>
      </form>
      {/* 날짜 프리셋 버튼 그룹 추가 */}
      <div className="date-preset-buttons">
        <button type="button" onClick={() => setDatePreset('today')}>오늘</button>
        <button type="button" onClick={() => setDatePreset('week')}>이번 주</button>
        <button type="button" onClick={() => setDatePreset('month')}>최근 1개월</button>
        <button type="button" onClick={() => setDatePreset('year')}>올해</button>
      </div>
    </>
  );
}

export default SearchBar;