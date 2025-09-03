import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function VideoDetailModal({ modalIsOpen, closeModal, videoData }) {
  if (!videoData) return null;

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Video Details"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>{videoData.title}</h2>
      <p><strong>채널:</strong> {videoData.channelTitle}</p>
      <p><strong>게시일:</strong> {new Date(videoData.publishedAt).toLocaleDateString()}</p>
      <hr />
      {videoData.viewCount && <p><strong>조회수:</strong> {Number(videoData.viewCount).toLocaleString()}회</p>}
      {videoData.likeCount && <p><strong>좋아요 수:</strong> {Number(videoData.likeCount).toLocaleString()}회</p>}
      <button onClick={closeModal} className="close-button">닫기</button>
    </Modal>
  );
}

export default VideoDetailModal;