import React from 'react';
import Modal from 'react-modal';

// 모달이 앱의 다른 요소 위에 나타나도록 설정 (웹 접근성)
Modal.setAppElement('#root');

function VideoDetailModal({ modalIsOpen, closeModal, videoStat }) {
  if (!videoStat) return null; // 비디오 정보가 없으면 아무것도 렌더링하지 않음

  const videoInfo = videoStat.videos;

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Video Details"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>{videoInfo.title}</h2>
      <p><strong>채널:</strong> {videoInfo.channel_title}</p>
      <p><strong>게시일:</strong> {new Date(videoInfo.published_at).toLocaleDateString()}</p>
      <hr />
      <p><strong>수집된 조회수:</strong> {Number(videoStat.view_count).toLocaleString()}회</p>
      <p><strong>수집된 좋아요 수:</strong> {Number(videoStat.like_count).toLocaleString()}회</p>
      <p><strong>데이터 수집일:</strong> {new Date(videoStat.collected_at).toLocaleString()}</p>
      <button onClick={closeModal} className="close-button">닫기</button>
    </Modal>
  );
}

export default VideoDetailModal;