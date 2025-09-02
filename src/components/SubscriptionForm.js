import React, { useState } from 'react';
import axios from 'axios';

function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // category_id '10'은 '음악' 카테고리를 의미 (임시)
      await axios.post('/api/subscribe', { email, category_id: '10' });
      alert('구독 신청이 완료되었습니다! 매일 새로운 음악 트렌드를 알려드릴게요.');
      setEmail('');
    } catch (error) {
      alert('구독 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscription-form-container">
      <h3>🎵 음악 카테고리 트렌드 구독하기</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소를 입력하세요"
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '신청 중...' : '구독하기'}
        </button>
      </form>
    </div>
  );
}
export default SubscriptionForm;