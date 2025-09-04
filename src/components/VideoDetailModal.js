import React from 'react';
import Modal from 'react-modal';
import ReactPlayer from 'react-player';

Modal.setAppElement('#root');

function VideoDetailModal({ modalIsOpen, closeModal, videoData }) {
  // videoData가 없으면 아무것도 렌더링하지 않음
  if (!videoData) {
    return null;
  }
  
  // console.log는 테스트 후 지우는 것이 좋습니다.
  // console.log('모달이 렌더링되었습니다:', videoData);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal} // 이제 닫기 함수를 직접 사용
      contentLabel="Video Player"
      className="modal video-player-modal"
      overlayClassName="overlay"
    >
      <button onClick={closeModal} className="close-button-player">X</button>
      <div className="player-wrapper">
        <ReactPlayer
          className="react-player-main"
          url={`https://www.youtube.com/watch?v=${videoData.id}`}
          width="100%"
          height="100%"
          playing={false} // 자동 재생 비활성화
          controls={true} // 사용자가 직접 재생하도록 컨트롤 바 표시
        />
      </div>
    </Modal>
  );
}

export default VideoDetailModal;