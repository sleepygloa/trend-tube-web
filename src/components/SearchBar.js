import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// V-- App.js로부터 onFetchTrending를 받아오도록 여기에 추가! --V
function SearchBar({ onSearch, onFetchTrending, isLoading }) {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.filter(cat => cat.snippet.assignable));
      } catch (error) {
        console.error("카테고리 목록을 불러오는 데 실패했습니다.", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
      keyword,
      categoryId: selectedCategory,
    };
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="date-picker-container">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
        />
        <span>~</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)}
        disabled={isLoading}
      >
        <option value="">모든 카테고리</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.snippet.title}
          </option>
        ))}
      </select>
      <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="키워드" />
      <button type="submit" disabled={isLoading}>기간별 검색</button>
      <button type="button" onClick={onFetchTrending} disabled={isLoading} className="trending-button">🔥 실시간 인기</button>
    </form>
  );
}

export default SearchBar;