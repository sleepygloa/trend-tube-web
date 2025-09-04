import React from 'react';
import Modal from 'react-modal';
import SearchBar from './SearchBar';

Modal.setAppElement('#root');

function FilterModal({ modalIsOpen, closeModal, onSearch, onFetchTrending, isLoading, categories }) {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Filter Options"
      className="modal"
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
        categories={categories}
      />
    </Modal>
  );
}

export default FilterModal;