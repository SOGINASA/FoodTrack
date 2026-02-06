import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены?',
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  variant = 'danger', // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Иконка */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-red-100' : 'bg-orange-100'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            variant === 'danger' ? 'text-red-600' : 'text-orange-600'
          }`} />
        </div>

        {/* Заголовок */}
        <h3 className="text-xl font-bold mb-2">{title}</h3>

        {/* Сообщение */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Кнопки */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
