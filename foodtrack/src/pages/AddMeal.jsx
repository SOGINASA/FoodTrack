import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { Camera, Upload, X, Check, Sparkles, TrendingUp, RotateCw, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mealsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 99 * 1024 * 1024; // 99 МБ
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

const AddMeal = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showToast, setShowToast] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [selectedMealType, setSelectedMealType] = useState('snack');
  const [retryMessage, setRetryMessage] = useState(null);
  const lastInputModeRef = useRef(null); // 'camera' | 'file'

  const mealTypes = [
    { value: 'breakfast', label: 'Завтрак' },
    { value: 'lunch', label: 'Обед' },
    { value: 'dinner', label: 'Ужин' },
    { value: 'snack', label: 'Перекус' },
  ];
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Автозапуск видео когда видео элемент появляется
  useEffect(() => {
    if (activeMode === 'camera' && videoRef.current && streamRef.current) {
      console.log('useEffect: trying to start video playback');
      
      const video = videoRef.current;
      
      const tryPlay = async () => {
        try {
          await video.play();
          console.log('Video playing from useEffect');
          setCameraReady(true);
        } catch (err) {
          console.error('Play error in useEffect:', err);
        }
      };

      // Пробуем несколько раз
      const interval = setInterval(() => {
        if (video.readyState >= 2 && video.paused) {
          tryPlay();
        }
        if (!video.paused) {
          clearInterval(interval);
        }
      }, 200);

      // Очистка через 3 секунды
      setTimeout(() => clearInterval(interval), 3000);

      return () => clearInterval(interval);
    }
  }, [activeMode]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);
    setActiveMode('camera'); // Сразу переключаем режим
    
    try {
      // Сначала останавливаем предыдущий стрим если есть
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream.getVideoTracks()[0].getSettings());
      
      streamRef.current = stream;
      
      // Ждём следующий фрейм для рендеринга
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      if (videoRef.current) {
        console.log('Setting srcObject to video element');
        videoRef.current.srcObject = stream;
        
        // Принудительный запуск через небольшую задержку
        setTimeout(async () => {
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log('Video started playing');
              setCameraReady(true);
            } catch (err) {
              console.error('Play error:', err);
            }
          }
        }, 100);
        
        // Дополнительная проверка через 1 секунду
        setTimeout(() => {
          if (videoRef.current) {
            console.log('Video check:', {
              readyState: videoRef.current.readyState,
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight,
              paused: videoRef.current.paused
            });
            
            if (videoRef.current.readyState >= 2) {
              setCameraReady(true);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setActiveMode(null);
      let errorMessage = 'Не удалось получить доступ к камере';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Доступ к камере запрещён. Разрешите доступ в настройках браузера.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Камера не найдена на устройстве';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Камера используется другим приложением';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Камера не поддерживает запрошенные параметры';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Камера недоступна. Используйте HTTPS или localhost.';
      }
      
      setCameraError(errorMessage);
      setShowToast({ type: 'error', message: errorMessage });
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    stopCamera();
    setTimeout(() => startCamera(), 100);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActiveMode(null);
    setCameraError(null);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState !== 4) {
      setShowToast({ type: 'error', message: 'Камера ещё не готова, подождите...' });
      return;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      setShowToast({ type: 'error', message: 'Не удалось захватить изображение' });
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Image captured, data length:', imageData.length);

    lastInputModeRef.current = 'camera';
    setCapturedImage(imageData);
    stopCamera();
    analyzeImage(imageData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка формата файла
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
        setShowToast({
          type: 'error',
          message: `Неподдерживаемый формат файла (${file.type || extension}). Поддерживаются: JPEG, PNG, WebP, HEIC.`,
        });
        e.target.value = '';
        return;
      }

      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setShowToast({
          type: 'error',
          message: `Файл слишком большой (${sizeMB} МБ). Максимальный размер — 99 МБ.`,
        });
        e.target.value = '';
        return;
      }

      // Проверка что файл не пустой
      if (file.size === 0) {
        setShowToast({ type: 'error', message: 'Файл пуст. Выберите другое изображение.' });
        e.target.value = '';
        return;
      }

      lastInputModeRef.current = 'file';
      const reader = new FileReader();
      reader.onerror = () => {
        setShowToast({ type: 'error', message: 'Не удалось прочитать файл. Попробуйте другое изображение.' });
      };
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    // Сброс value чтобы повторный выбор того же файла тоже срабатывал
    e.target.value = '';
  };

  // Сжатие изображения для уменьшения размера файла
  const compressImage = (imageData, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Уменьшаем размер если больше maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = imageData;
    });
  };

  const retryAfterError = (message) => {
    if (lastInputModeRef.current === 'camera' && isMobile) {
      setRetryMessage(message);
      startCamera();
    } else {
      setRetryMessage(message);
      // Для файлового режима — остаёмся на главном экране с баннером
    }
  };

  const dismissRetry = () => {
    setRetryMessage(null);
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    setRetryMessage(null);

    try {
      // Конвертируем base64 в Blob для проверки размера
      const rawByteString = atob(imageData.split(',')[1]);
      const rawSize = rawByteString.length;

      // Сжимаем только если файл >= 99 МБ
      const finalImage = rawSize >= MAX_FILE_SIZE ? await compressImage(imageData) : imageData;

      // Конвертируем base64 в Blob
      const byteString = atob(finalImage.split(',')[1]);
      const mimeString = finalImage.split(',')[0].match(/:(.*?);/)[1];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Создаём File из Blob
      const file = new File([blob], 'photo.jpg', { type: mimeString });

      // Отправляем на API анализа
      const response = await mealsAPI.analyzePhoto(file);

      const result = response.data;

      // Проверяем, что модель что-то нашла
      if (!result.top_prediction || result.confidence === 0) {
        setCapturedImage(null);
        retryAfterError('Не удалось распознать блюдо. Убедитесь, что на фото чётко видна еда, и попробуйте снова.');
        return;
      }

      // Преобразуем результат в нужный формат
      const mockResult = {
        dishName: result.top_prediction_ru || result.top_prediction,
        confidence: Math.round(result.confidence),
        calories: result.nutrition?.calories || 0,
        protein: result.nutrition?.protein || 0,
        carbs: result.nutrition?.carbs || 0,
        fats: result.nutrition?.fat || 0,
        portion: '100г',
        ingredients: [],
        aiAdvice: `Блюдо определено с уверенностью ${Math.round(result.confidence)}%. Нажмите на ингредиенты для редактирования.`,
        healthScore: 75,
        tags: ['Из фото'],
      };

      setAnalysisResult(mockResult);
      setShowResultModal(true);
    } catch (error) {
      console.error('Ошибка анализа:', error);

      let errorMessage = 'Ошибка анализа. Попробуйте ещё раз.';

      if (!navigator.onLine) {
        errorMessage = 'Нет подключения к интернету. Проверьте соединение и попробуйте снова.';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Сервер не ответил вовремя. Проверьте интернет-соединение или попробуйте фото меньшего размера.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету и попробуйте снова.';
      } else if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message;

        switch (status) {
          case 400:
            errorMessage = detail || 'Некорректный запрос. Возможно, файл повреждён или имеет неподдерживаемый формат.';
            break;
          case 413:
            errorMessage = 'Файл слишком большой. Попробуйте фото меньшего размера или снизьте качество камеры.';
            break;
          case 415:
            errorMessage = 'Неподдерживаемый формат изображения. Используйте JPEG, PNG или WebP.';
            break;
          case 422:
            errorMessage = detail || 'Не удалось обработать изображение. Убедитесь, что это фото еды, а не скриншот или документ.';
            break;
          case 429:
            errorMessage = 'Слишком много запросов. Подождите немного и попробуйте снова.';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
            break;
          case 502:
          case 503:
            errorMessage = 'Сервис распознавания временно недоступен. Попробуйте через несколько минут.';
            break;
          case 504:
            errorMessage = 'Сервер распознавания не отвечает. Попробуйте фото меньшего размера или повторите позже.';
            break;
          default:
            errorMessage = detail || `Ошибка сервера (${status}). Попробуйте ещё раз.`;
        }
      }

      setCapturedImage(null);
      retryAfterError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!analysisResult) return;

    try {
      const mealData = {
        name: analysisResult.dishName,
        type: selectedMealType,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fats: analysisResult.fats,
        portions: 1,
        ai_confidence: analysisResult.confidence,
        health_score: analysisResult.healthScore,
        ai_advice: analysisResult.aiAdvice,
        tags: analysisResult.tags,
        ingredients: analysisResult.ingredients || [],
      };

      const response = await mealsAPI.create(mealData);
      setShowToast({ type: 'success', message: 'Приём пищи сохранён!' });
      setTimeout(() => navigate('/diary'), 1000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setShowToast({
        type: 'error',
        message: error.response?.data?.error || 'Ошибка при сохранении'
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowResultModal(false);
    setRetryMessage(null);
  };

  const handleCloseResult = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowResultModal(false);
    setSelectedMealType('snack');
    setRetryMessage(null);
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
        <div className="mt-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Анализируем блюдо...</h3>
          <p className="text-secondary">AI определяет состав и калорийность</p>
        </div>
      </div>
    );
  }

  if (activeMode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {cameraError ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center text-white max-w-md">
              <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-lg mb-4">{cameraError}</p>
              <Button variant="primary" onClick={stopCamera}>
                Закрыть
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ backgroundColor: '#000' }}
              onLoadedMetadata={(e) => {
                console.log('onLoadedMetadata event', {
                  videoWidth: e.target.videoWidth,
                  videoHeight: e.target.videoHeight
                });
                setCameraReady(true);
              }}
              onCanPlay={(e) => {
                console.log('onCanPlay event');
                setCameraReady(true);
              }}
              onPlaying={(e) => {
                console.log('onPlaying event');
                setCameraReady(true);
              }}
            />
            
            <canvas ref={canvasRef} className="hidden" />
            
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Loader size="lg" />
                  <p className="mt-4">Запуск камеры...</p>
                </div>
              </div>
            )}
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <button
                onClick={() => { stopCamera(); setRetryMessage(null); }}
                className="p-3 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm">
                {cameraReady ? 'Наведите на еду' : 'Загрузка...'}
              </div>
              <button
                onClick={switchCamera}
                className="p-3 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {retryMessage && (
              <div className="absolute top-20 left-4 right-4 z-10 animate-slide-up">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-black">Попробуйте ещё раз</p>
                    <p className="text-xs text-gray-600 mt-0.5">{retryMessage}</p>
                  </div>
                  <button
                    onClick={dismissRetry}
                    className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-2xl flex items-center justify-center transition-all ${
                  cameraReady ? 'hover:scale-110 active:scale-95' : 'opacity-50'
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Camera className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Добавить еду</h1>
      </div>

      <Card padding="lg" className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">AI распознавание еды</h3>
            <p className="text-secondary text-sm">
              Сфотографируйте блюдо или загрузите фото, и AI автоматически определит калории, БЖУ и состав
            </p>
          </div>
        </div>
      </Card>

      {retryMessage && (
        <Card padding="lg" className="bg-orange-50 border border-orange-200 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-black">Попробуйте ещё раз</p>
              <p className="text-sm text-gray-700 mt-1">{retryMessage}</p>
            </div>
            <button
              onClick={dismissRetry}
              className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isMobile && (
          <Card 
            hoverable 
            padding="lg" 
            onClick={startCamera}
            className="cursor-pointer text-center"
          >
            <Camera className="w-12 h-12 mx-auto mb-3 text-purple-600" />
            <h3 className="font-bold text-lg mb-2">Сфотографировать</h3>
            <p className="text-secondary text-sm">
              Откройте камеру и сделайте фото еды
            </p>
          </Card>
        )}

        <Card 
          hoverable 
          padding="lg"
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer text-center"
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h3 className="font-bold text-lg mb-2">Загрузить фото</h3>
          <p className="text-secondary text-sm">
            Выберите готовое фото из галереи
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </Card>
      </div>

      <Card padding="lg">
        <h3 className="font-bold text-lg mb-3">Как это работает?</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold">Сделайте фото</div>
              <div className="text-sm text-secondary">Сфотографируйте или загрузите изображение блюда</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold">AI анализ</div>
              <div className="text-sm text-secondary">Нейросеть определит блюдо, калории и БЖУ</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold">Проверьте и сохраните</div>
              <div className="text-sm text-secondary">Отредактируйте при необходимости и добавьте в дневник</div>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showResultModal}
        onClose={handleCloseResult}
        size="lg"
        showCloseButton={true}
      >
        {analysisResult && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Food" 
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                {analysisResult.confidence}% уверенность
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">{analysisResult.dishName}</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="default" className="text-center">
                <div className="text-3xl font-bold text-black">{Number(analysisResult.calories.toFixed(2))}</div>
                <div className="text-sm text-secondary mt-1">Калорий</div>
              </Card>
              <Card padding="default" className="text-center">
                <div className="text-3xl font-bold text-[#FF6B6B]">{Number(analysisResult.protein.toFixed(2))}г</div>
                <div className="text-sm text-secondary mt-1">Белки</div>
              </Card>
              <Card padding="default" className="text-center">
                <div className="text-3xl font-bold text-[#FFB84D]">{Number(analysisResult.carbs.toFixed(2))}г</div>
                <div className="text-sm text-secondary mt-1">Углеводы</div>
              </Card>
              <Card padding="default" className="text-center">
                <div className="text-3xl font-bold text-[#4D9FFF]">{Number(analysisResult.fats.toFixed(2))}г</div>
                <div className="text-sm text-secondary mt-1">Жиры</div>
              </Card>
            </div>

            <Card padding="lg" className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-lg mb-2 flex items-center gap-2 flex-wrap">
                    Оценка здоровья: {analysisResult.healthScore}/100
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden min-w-[120px] max-w-[200px]">
                      <div 
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${analysisResult.healthScore}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{analysisResult.aiAdvice}</p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="font-bold text-lg mb-3">Ингредиенты</h3>
              <div className="space-y-2">
                {analysisResult.ingredients.map((ingredient, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-divider last:border-0"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{ingredient.name}</div>
                      <div className="text-sm text-secondary">{ingredient.amount}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{ingredient.calories}</div>
                      <div className="text-xs text-secondary">ккал</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {isAuthenticated ? (
              <>
                <div>
                  <label className="block font-bold text-lg mb-3">Тип приёма пищи</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {mealTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedMealType(type.value)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                          selectedMealType === type.value
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleRetake}
                  >
                    Переснять
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSaveMeal}
                  >
                    Сохранить в дневник
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Card padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-lg mb-1">Войдите, чтобы сохранить</div>
                      <p className="text-sm text-gray-700">
                        Зарегистрируйтесь или войдите в аккаунт, чтобы сохранять приёмы пищи в дневник и отслеживать прогресс
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleRetake}
                  >
                    Переснять
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => navigate('/auth')}
                  >
                    Войти / Регистрация
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

export default AddMeal;