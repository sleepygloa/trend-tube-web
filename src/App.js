import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SearchBar 컴포넌트에서 검색을 실행하면 호출될 함수
  const handleSearch = async (filters) => {
    setLoading(true);
    setError('');
    setVideos([]);

    try {
      // Vercel에 배포된 우리 API(/api/stats)에 GET 요청을 보냅니다.
      // filters 객체가 자동으로 쿼리 파라미터(예: ?from=...&to=...)로 변환됩니다.
      const response = await axios.get('/api/stats', { params: filters });
      setVideos(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 TrendTube</h1>
        <p>기간별 유튜브 트렌드를 분석하고 구독하세요.</p>
      </header>
      <main>
        <SearchBar onSearch={handleSearch} isLoading={loading} />
        {error && <p className="error-message">{error}</p>}
        {loading ? <p>데이터를 불러오는 중입니다...</p> : <VideoList videos={videos} />}
      </main>
    </div>
  );
}

export default App;