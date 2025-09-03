import React from 'react';
import Modal from 'react-modal';
import SearchBar from './SearchBar'; // 기존 SearchBar를 재사용합니다.

Modal.setAppElement('#root');

function FilterModal({ modalIsOpen, closeModal, onSearch, onFetchTrending, isLoading }) {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Filter Options"
      className="modal" // 기존 모달 스타일을 재사용합니다.
      overlayClassName="overlay"
    >
      <div className="filter-modal-header">
        <h2>검색 조건 설정</h2>
        <button onClick={closeModal} className="close-button-modal">X</button>
      </div>
      <SearchBar 
        onSearch={onSearch}
        onFetchTrending={onFetchTrending}
        isLoading={isLoading}
      />
    </Modal>
  );
}

export default FilterModal;