import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function SearchBar({ onSearch, onFetchTrending, isLoading, categories = [] }) {
  const [searchType, setSearchType] = useState('duration');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [duration, setDuration] = useState('short');
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const durationOptions = [
    { value: 'short', label: '4분 이하 (쇼츠)' },
    { value: 'medium', label: '4~20분' },
    { value: 'long', label: '20분 이상' },
  ];

  const setDatePreset = (preset) => {
    const today = new Date();
    let newStartDate;
    switch(preset) {
      case 'today': newStartDate = new Date(); break;
      case 'week': newStartDate = new Date(today.setDate(today.getDate() - 6)); break;
      case 'month': newStartDate = new Date(today.setMonth(today.getMonth() - 1)); break;
      case 'year': newStartDate = new Date(today.getFullYear(), 0, 1); break;
      default: newStartDate = new Date();
    }
    setStartDate(newStartDate);
    setEndDate(new Date());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let filters = { keyword, categoryId: selectedCategory, searchType };
    if (searchType === 'date') {
      filters.from = startDate.toISOString().split('T')[0];
      filters.to = endDate.toISOString().split('T')[0];
    } else {
      filters.duration = duration;
    }
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-type-selector">
        <button type="button" className={searchType === 'duration' ? 'active' : ''} onClick={() => setSearchType('duration')}>길이별 검색</button>
        <button type="button" className={searchType === 'date' ? 'active' : ''} onClick={() => setSearchType('date')}>기간별 검색</button>
      </div>

      {searchType === 'date' ? (
        <div className="form-group">
          <label>기간 설정</label>
          <div className="date-picker-container">
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} dateFormat="yyyy-MM-dd" />
            <span>~</span>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} dateFormat="yyyy-MM-dd" />
          </div>
          <div className="date-preset-buttons">
            <button type="button" onClick={() => setDatePreset('today')}>오늘</button>
            <button type="button" onClick={() => setDatePreset('week')}>이번 주</button>
            <button type="button" onClick={() => setDatePreset('month')}>최근 1개월</button>
            <button type="button" onClick={() => setDatePreset('year')}>올해</button>
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label>영상 길이</label>
          <div className="duration-buttons">
            {durationOptions.map(opt => (
              <button type="button" key={opt.value} className={duration === opt.value ? 'active' : ''} onClick={() => setDuration(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="category-select">카테고리</label>
        <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={isLoading}>
          <option value="">모든 카테고리</option>
          {categories.map(category => (<option key={category.id} value={category.id}>{category.snippet.title}</option>))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="keyword-input">키워드</label>
        <input id="keyword-input" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색할 키워드 입력" />
      </div>
      
      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="search-button">검색 적용</button>
        <button type="button" onClick={onFetchTrending} disabled={isLoading} className="trending-button">🔥 실시간 인기</button>
      </div>
    </form>
  );
}

export default SearchBar;