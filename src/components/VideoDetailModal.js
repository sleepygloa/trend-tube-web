import React from 'react';
import Modal from 'react-modal';
import ReactPlayer from 'react-player/youtube';

Modal.setAppElement('#root');

function VideoDetailModal({ modalIsOpen, closeModal, videoData }) {
  if (!videoData) return null;

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Video Player"
      className="modal video-player-modal" // 비디오용 클래스 추가
      overlayClassName="overlay"
    >
      {/* 닫기 버튼을 모달 바깥쪽에 배치 */}
      <button onClick={closeModal} className="close-button-player">X</button>
      <div className="player-wrapper">
        <ReactPlayer
          className="react-player-main"
          url={`https://www.youtube.com/watch?v=${videoData.id}`}
          width="100%"
          height="100%"
          playing={true}   // 모달이 열리면 바로 재생
          controls={true}  // 재생/정지 등 컨트롤 바 표시
        />
      </div>
    </Modal>
  );
}

export default VideoDetailModal;