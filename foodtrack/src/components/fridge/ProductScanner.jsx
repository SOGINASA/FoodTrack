import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Receipt, Scan, X, Loader } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ProductScanner = ({ isOpen, onClose, onScanComplete }) => {
  const [scanMode, setScanMode] = useState('receipt'); // 'receipt' или 'barcode'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeMode, setActiveMode] = useState('select'); // 'select', 'camera', 'preview'
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Определяем, мобильное ли устройство
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Очистка камеры при размонтировании
  useEffect(() => {
    return () => {
      stopCamera();
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Остановка камеры при закрытии модалки
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setActiveMode('select');
      setCameraReady(false);
      setCameraError(null);
    }
  }, [isOpen]);

  // Retry mechanism for video playback (from AddMeal.jsx)
  useEffect(() => {
    if (activeMode === 'camera' && videoRef.current && !cameraReady) {
      playIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          videoRef.current.play().then(() => {
            setCameraReady(true);
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current);
            }
          }).catch(err => {
            console.log('Video play retry...', err);
          });
        }
      }, 500);

      return () => {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
        }
      };
    }
  }, [activeMode, cameraReady]);

  // Запуск камеры (replicated from AddMeal.jsx)
  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);

    try {
      // Проверяем поддержку getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Ваш браузер не поддерживает доступ к камере';
        setCameraError(errorMsg);
        alert(errorMsg);
        return;
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setActiveMode('camera');

        // Event handlers for video playback
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
        };

        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };

        videoRef.current.onplaying = () => {
          console.log('Video is playing');
          setCameraReady(true);
        };

        // Try to play immediately
        try {
          await videoRef.current.play();
          setCameraReady(true);
        } catch (playError) {
          console.log('Initial play failed, will retry...', playError);
          // Retry interval will handle this
        }
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);

      let errorMessage = 'Не удалось получить доступ к камере. ';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Пожалуйста, разрешите доступ к камере в настройках браузера.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'Камера не найдена на вашем устройстве.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Камера уже используется другим приложением.';
      } else {
        errorMessage += 'Попробуйте загрузить фото из галереи.';
      }

      setCameraError(errorMessage);
      alert(errorMessage);
      setActiveMode('select');
    }
  };

  // Остановка камеры
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setCameraError(null);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
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
        setActiveMode('preview');
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
      setActiveMode('preview');
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
    setActiveMode('select');
    onClose();
  };

  // Переключение режима сканирования
  const toggleScanMode = (mode) => {
    setScanMode(mode);
    setSelectedFile(null);
    setPreview(null);
    stopCamera();
    setActiveMode('select');
  };

  // Full-screen camera mode (like AddMeal.jsx)
  if (activeMode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => {
                stopCamera();
                setActiveMode('select');
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-semibold">
              {scanMode === 'receipt' ? 'Сканировать чек' : 'Сканировать штрихкод'}
            </h2>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Video */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => console.log('Video metadata loaded')}
            onCanPlay={() => console.log('Video can play')}
            onPlaying={() => {
              console.log('Video is playing');
              setCameraReady(true);
            }}
          />

          {/* Рамка для штрихкода */}
          {scanMode === 'barcode' && cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-4 border-white rounded-xl shadow-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Загрузка камеры...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                stopCamera();
                setActiveMode('select');
              }}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Camera className="w-5 h-5 mr-2" />
              Сделать фото
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Preview mode
  if (activeMode === 'preview' && preview) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {scanMode === 'receipt' ? 'Чек' : 'Штрихкод'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Превью фото */}
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
                setActiveMode('select');
              }}
              className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
                setActiveMode('select');
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
        </div>
      </Modal>
    );
  }

  // Selection mode (default)
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

        {/* Область выбора */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
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
        </div>

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
