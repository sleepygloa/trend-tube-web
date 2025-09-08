import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ReactPlayer from 'react-player';
import axios from 'axios';

Modal.setAppElement('#root');

// --- 이 함수가 추가되었습니다! ---
// ISO 날짜 문자열을 "5분 전", "3일 전" 등으로 변환하는 함수
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) return ` 방금 전`;
  if (minutes < 60) return ` ${minutes}분 전`;
  if (hours < 24) return ` ${hours}시간 전`;
  if (days < 7) return ` ${days}일 전`;
  if (weeks < 5) return ` ${weeks}주 전`;
  if (months < 12) return ` ${months}개월 전`;
  return ` ${years}년 전`;
}

function VideoDetailModal({ modalIsOpen, closeModal, videoData, isSaved, onSave, session }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentNextPageToken, setCommentNextPageToken] = useState(null);
  const [memo, setMemo] = useState('');

  const fetchComments = async (token = null) => {
    if (!token) setComments([]);
    setLoadingComments(true);
    try {
      const response = await axios.get(`/api/comments`, { 
        params: { videoId: videoData.id, pageToken: token || undefined }
      });
      const newComments = token ? [...comments, ...response.data.items] : response.data.items;
      setComments(newComments);
      setCommentNextPageToken(response.data.nextPageToken);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (modalIsOpen && videoData?.id) {
      fetchComments();
      setMemo('');
      setIsDescriptionExpanded(false);
    }
  }, [modalIsOpen, videoData]);

  if (!videoData) return null;

  const handleSaveClick = () => {
    if (!isSaved) {
      onSave(videoData, memo);
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
            <span>조회수 {Number(videoData.viewCount || 0).toLocaleString()}회</span>
          </div>
          
          {session && (
            <div className="save-section">
              <textarea 
                className="memo-input"
                placeholder="이 영상에 대한 아이디어나 메모를 남겨보세요..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={isSaved}
              />
              <button onClick={handleSaveClick} className="save-button-large" disabled={isSaved}>
                {isSaved ? '저장 완료됨' : '내 보관함에 저장'}
              </button>
            </div>
          )}
          
          <div className="detail-card">
            <h4>영상 정보</h4>
            <ul>
              <li><strong>좋아요:</strong> {Number(videoData.likeCount || 0).toLocaleString()}</li>
              <li><strong>영상 길이:</strong> {videoData.duration || '정보 없음'}</li>
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

          <div className="detail-card">
            <h4>댓글 ({Number(videoData.commentCount || 0).toLocaleString()})</h4>
            {loadingComments && comments.length === 0 ? <p>댓글을 불러오는 중...</p> : (
              <ul className="comment-list">
                {comments.length > 0 ? comments.map(comment => {
                  const commentSnippet = comment.snippet.topLevelComment.snippet;
                  return (
                    <li key={comment.id} className="comment-item">
                      <img src={commentSnippet.authorProfileImageUrl} alt="profile" />
                      <div className="comment-content">
                        <div className="comment-author">
                          <strong>{commentSnippet.authorDisplayName}</strong>
                          {/* --- 이 부분이 추가되었습니다! --- */}
                          <span className="comment-timestamp">
                            {formatRelativeTime(commentSnippet.publishedAt)}
                          </span>
                        </div>
                        <p dangerouslySetInnerHTML={{ __html: commentSnippet.textDisplay }} />
                      </div>
                    </li>
                  )
                }) : <p>댓글이 없습니다.</p>}
              </ul>
            )}
            
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

