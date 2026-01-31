import React from 'react';
import { Package, Check, X, User } from 'lucide-react';
import Button from '../common/Button';

const ShareRequestNotification = ({ request, onAccept, onDecline }) => {
  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-lg animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {request.senderName[0]}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-500" />
            <p className="font-bold text-sm">{request.senderName}</p>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            хочет поделиться продуктами с вами
          </p>

          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Продукты:
            </p>
            <div className="space-y-1">
              {request.products.map((product, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {product.name} ({product.quantity} {product.unit})
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => onAccept(request.id)}
              className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
            >
              <Check className="w-4 h-4" />
              Принять
            </Button>
            <Button
              variant="secondary"
              onClick={() => onDecline(request.id)}
              className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
            >
              <X className="w-4 h-4" />
              Отклонить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения всех активных запросов
export const ShareRequestsList = ({ requests, onAccept, onDecline }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-96 z-40 space-y-3">
      {requests.map((request) => (
        <ShareRequestNotification
          key={request.id}
          request={request}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
};

export default ShareRequestNotification;
