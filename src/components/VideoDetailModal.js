import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ReactPlayer from 'react-player';
import axios from 'axios';

Modal.setAppElement('#root');

function VideoDetailModal({ modalIsOpen, closeModal, videoData, isSaved, onSave }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentNextPageToken, setCommentNextPageToken] = useState(null);

  // 댓글을 불러오는 함수 (이제 '더보기'도 처리)
  const fetchComments = async (token = null) => {
    // '더보기'가 아닐 경우(첫 로딩), 기존 댓글 초기화
    if (!token) {
      setComments([]);
    }
    setLoadingComments(true);
    try {
      const response = await axios.get(`/api/comments`, { 
        params: { 
          videoId: videoData.id, 
          pageToken: token || undefined 
        }
      });
      // '더보기'일 경우 기존 댓글 뒤에 새 댓글을 이어붙임
      const newComments = token ? [...comments, ...response.data.items] : response.data.items;
      setComments(newComments);
      setCommentNextPageToken(response.data.nextPageToken);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // 모달이 열리고 videoData가 바뀔 때마다 첫 댓글 목록을 불러옵니다.
  useEffect(() => {
    if (modalIsOpen && videoData?.id) {
      fetchComments(); // 중복 로직을 제거하고, 통합된 fetchComments 함수를 호출합니다.
    }
  }, [modalIsOpen, videoData]);

  if (!videoData) return null;

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!isSaved) {
      onSave(videoData);
    }
  };

  const formatDescription = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text
      .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
      .replace(/\n/g, '<br />');
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Video Details"
      className="modal video-detail-modal"
      overlayClassName="overlay"
    >
      <button onClick={closeModal} className="close-button-player">X</button>
      
      <div className="modal-content-wrapper">
        <div className="modal-video-content">
          <div className="player-wrapper">
            <ReactPlayer
              className="react-player-main"
              url={`https://www.youtube.com/watch?v=${videoData.id}`}
              width="100%"
              height="100%"
              playing={false}
              controls={true}
            />
          </div>
        </div>

        <div className="modal-details-content">
          <h3>{videoData.title}</h3>
          <div className="detail-meta">
            <span>{videoData.channelTitle}</span>
            <span>조회수 {Number(videoData.viewCount).toLocaleString()}회</span>
          </div>
          <button onClick={handleSaveClick} className="save-button-large" disabled={isSaved}>
            {isSaved ? '저장 완료됨' : '이 영상 저장하기'}
          </button>
          
          <div className="detail-card">
            <h4>영상 정보</h4>
            <ul>
              {/* 좋아요 수가 없거나 NaN일 경우 0으로 표시 */}
              <li><strong>좋아요:</strong> {Number(videoData.likeCount || 0).toLocaleString()}</li>
              <li><strong>영상 길이:</strong> {videoData.duration}</li>
              <li><strong>게시일:</strong> {new Date(videoData.publishedAt).toLocaleDateString()}</li>
            </ul>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <h4>설명</h4>
              <button 
                className="expand-button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? '간략히' : '더보기'}
              </button>
            </div>
            <p 
              className={`video-description ${isDescriptionExpanded ? 'expanded' : ''}`}
              dangerouslySetInnerHTML={{ __html: formatDescription(videoData.description || '설명이 없습니다.') }} 
            />
          </div>

          {/* --- 댓글 UI 중복을 제거하고 하나로 합쳤습니다 --- */}
          <div className="detail-card">
            <h4>댓글 ({Number(videoData.commentCount || 0).toLocaleString()})</h4>
            {loadingComments && comments.length === 0 ? <p>댓글을 불러오는 중...</p> : (
              <ul className="comment-list">
                {comments.length > 0 ? comments.map(comment => (
                  <li key={comment.id} className="comment-item">
                    <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="profile" />
                    <div className="comment-content">
                      <strong>{comment.snippet.topLevelComment.snippet.authorDisplayName}</strong>
                      <p dangerouslySetInnerHTML={{ __html: comment.snippet.topLevelComment.snippet.textDisplay }} />
                    </div>
                  </li>
                )) : <p>댓글이 없습니다.</p>}
              </ul>
            )}
            
            {/* '댓글 더보기' 버튼 */}
            {loadingComments && comments.length > 0 && <p>댓글을 더 불러오는 중...</p>}
            {!loadingComments && commentNextPageToken && (
              <button onClick={() => fetchComments(commentNextPageToken)} className="load-more-comments-button">
                댓글 더보기
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default VideoDetailModal;