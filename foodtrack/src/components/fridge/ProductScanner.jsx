import React, { useState, useRef } from 'react';
import { Camera, Upload, Receipt, Scan, X, Loader } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ProductScanner = ({ isOpen, onClose, onScanComplete }) => {
  const [scanMode, setScanMode] = useState('receipt'); // 'receipt' или 'barcode'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Определяем, мобильное ли устройство
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Запуск камеры
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      alert('Не удалось получить доступ к камере');
    }
  };

  // Остановка камеры
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  // Сделать фото с камеры
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `${scanMode}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  // Обработка выбора файла
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Отправка на сканирование
  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    try {
      // Здесь будет вызов API для сканирования
      // Пока имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Временные данные для теста
      const mockData = scanMode === 'receipt'
        ? [
            { name: 'Молоко 3.2%', quantity: 1, price: 89 },
            { name: 'Хлеб белый', quantity: 1, price: 45 },
            { name: 'Яйца С1', quantity: 10, price: 120 }
          ]
        : {
            name: 'Молоко 3.2%',
            barcode: '4607012345678',
            brand: 'Простоквашино'
          };

      onScanComplete(mockData, scanMode);
      handleClose();
    } catch (error) {
      console.error('Ошибка сканирования:', error);
      alert('Не удалось отсканировать. Попробуйте ещё раз.');
    } finally {
      setIsScanning(false);
    }
  };

  // Закрытие модалки
  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreview(null);
    setIsCameraActive(false);
    onClose();
  };

  // Переключение режима сканирования
  const toggleScanMode = (mode) => {
    setScanMode(mode);
    setSelectedFile(null);
    setPreview(null);
    stopCamera();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {scanMode === 'receipt' ? 'Сканировать чек' : 'Сканировать штрихкод'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Переключатель режима */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => toggleScanMode('receipt')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              scanMode === 'receipt'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>Чек</span>
          </button>
          <button
            onClick={() => toggleScanMode('barcode')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              scanMode === 'barcode'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Scan className="w-5 h-5" />
            <span>Штрихкод</span>
          </button>
        </div>

        {/* Область сканирования */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
          {!isCameraActive && !preview ? (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">
                {scanMode === 'receipt' ? '🧾' : '📊'}
              </div>
              <p className="text-gray-600 mb-6">
                {scanMode === 'receipt'
                  ? 'Сфотографируйте или загрузите фото чека'
                  : 'Сфотографируйте или загрузите фото штрихкода'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isMobile && (
                  <Button variant="primary" onClick={startCamera}>
                    <Camera className="w-5 h-5 mr-2" />
                    Открыть камеру
                  </Button>
                )}
                <Button
                  variant={isMobile ? "secondary" : "primary"}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Загрузить фото
                </Button>
              </div>
            </div>
          ) : null}

          {/* Видео с камеры */}
          {isCameraActive && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Рамка для штрихкода */}
              {scanMode === 'barcode' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-4 border-white rounded-xl shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <Button variant="secondary" onClick={stopCamera}>
                  Отмена
                </Button>
                <Button variant="primary" onClick={capturePhoto}>
                  <Camera className="w-5 h-5 mr-2" />
                  Сделать фото
                </Button>
              </div>
            </div>
          )}

          {/* Превью выбранного фото */}
          {preview && (
            <div className="relative w-full h-full">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Кнопки действий */}
        {preview && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
            >
              Выбрать другое фото
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Сканирование...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 mr-2" />
                  Отсканировать
                </>
              )}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Modal>
  );
};

export default ProductScanner;
