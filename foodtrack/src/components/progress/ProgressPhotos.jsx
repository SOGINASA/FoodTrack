import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Calendar, Upload, Trash2, ZoomIn } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ProgressPhotos = ({ photos, onAddPhoto, onDeletePhoto }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDate, setUploadDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      // Валидация даты
      const selectedDate = new Date(uploadDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        alert('Некорректная дата');
        return;
      }

      if (selectedDate > today) {
        alert('Дата не может быть в будущем');
        return;
      }

      onAddPhoto({
        id: Date.now(),
        date: selectedDate,
        imageUrl: previewUrl,
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Фото прогресса</h3>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="w-4 h-4" />
          Добавить фото
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <h4 className="font-bold text-lg mb-2">Нет фото прогресса</h4>
          <p className="text-secondary mb-4">
            Добавьте первое фото, чтобы отслеживать изменения
          </p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            Добавить первое фото
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card 
              key={photo.id} 
              padding="none" 
              hoverable
              className="relative group overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img 
                  src={photo.imageUrl} 
                  alt="Progress" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>

              <div className="p-2 bg-white">
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <Calendar className="w-3 h-3" />
                  {format(photo.date, 'd MMM yyyy', { locale: ru })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }}
        title="Добавить фото прогресса"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Дата</label>
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Фото</label>
            {!previewUrl ? (
              <label className="block w-full aspect-square border-2 border-dashed border-gray-300 rounded-2xl hover:border-black transition-colors cursor-pointer">
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-black transition-colors">
                  <Upload className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Выберите фото</span>
                  <span className="text-sm">или перетащите сюда</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full aspect-square object-cover rounded-2xl"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="primary" 
              className="flex-1"
              disabled={!previewUrl}
              onClick={handleUpload}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="text-center text-lg font-semibold">
              {format(selectedPhoto.date, 'd MMMM yyyy', { locale: ru })}
            </div>
            <img 
              src={selectedPhoto.imageUrl} 
              alt="Progress" 
              className="w-full rounded-2xl"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProgressPhotos;