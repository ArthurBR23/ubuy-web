import ReactDOM from 'react-dom';

export const DeleteMessageModal = ({ onClose, onConfirm }) => {
  return ReactDOM.createPortal(
    <div className="modal-container" onClick={onClose}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <h2>Deletar mensagem</h2>
        <p>Você tem certeza que deseja deletar esta mensagem?</p>
        <div className="footer">
          <button onClick={onClose} className="btn cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn confirm">
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

