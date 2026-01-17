import React, { useState, useEffect, useCallback } from 'react';
import ProgressPhotos from '../components/progress/ProgressPhotos';
import PhotoComparison from '../components/progress/PhotoComparison';
import WeightTracker from '../components/progress/WeightTracker';
import MeasurementsTracker from '../components/progress/MeasurementsTracker';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';
import { Image, Trophy } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { progressAPI } from '../services/api';

const Progress = () => {
  const [showToast, setShowToast] = useState(null);

  const {
    weightHistory,
    goals,
    loading,
    error,
    fetchWeightHistory,
    fetchGoals,
    addWeight
  } = useAnalytics();

  const [photos, setPhotos] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  // Загрузка замеров
  const fetchMeasurements = useCallback(async () => {
    try {
      const response = await progressAPI.getMeasurements();
      setMeasurements(response.data.measurements || []);
    } catch (err) {
      console.error('Ошибка загрузки замеров:', err);
    }
  }, []);

  // Загрузка фото
  const fetchPhotos = useCallback(async () => {
    try {
      const response = await progressAPI.getPhotos();
      const transformedPhotos = (response.data.photos || []).map(p => ({
        id: p.id,
        date: new Date(p.date),
        imageUrl: p.image_url,
        category: p.category,
        notes: p.notes
      }));
      setPhotos(transformedPhotos);
    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
    }
  }, []);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setProgressLoading(true);
      await Promise.all([
        fetchWeightHistory(90),
        fetchGoals(),
        fetchMeasurements(),
        fetchPhotos()
      ]);
      setProgressLoading(false);
    };
    loadData();
  }, [fetchWeightHistory, fetchGoals, fetchMeasurements, fetchPhotos]);

  // Преобразуем данные веса
  const getWeightData = () => {
    if (!weightHistory || !Array.isArray(weightHistory)) return [];
    return weightHistory.map((entry, idx) => ({
      id: idx,
      weight: entry.weight,
      date: new Date(entry.date),
      notes: entry.notes
    })).reverse(); // Показываем от старого к новому
  };

  const handleAddPhoto = async (photo) => {
    try {
      const response = await progressAPI.addPhoto({
        image_url: photo.imageUrl || photo.image_url || photo.url,
        date: photo.date instanceof Date ? photo.date.toISOString().split('T')[0] : photo.date,
        category: photo.category || 'front',
        notes: photo.notes
      });
      const photoData = response.data.photo;
      const transformedPhoto = {
        id: photoData.id,
        date: new Date(photoData.date),
        imageUrl: photoData.image_url,
        category: photoData.category,
        notes: photoData.notes
      };
      setPhotos([transformedPhoto, ...photos]);
      setShowToast({ type: 'success', message: 'Фото добавлено' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка при сохранении фото' });
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await progressAPI.deletePhoto(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
      setShowToast({ type: 'success', message: 'Фото удалено' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка при удалении фото' });
    }
  };

  const handleAddWeight = async (entry) => {
    const result = await addWeight({
      weight: entry.weight,
      date: entry.date.toISOString().split('T')[0],
      notes: entry.notes
    });
    if (result.success) {
      setShowToast({ type: 'success', message: 'Вес добавлен' });
      await fetchWeightHistory(90);
    } else {
      setShowToast({ type: 'error', message: result.error || 'Ошибка при сохранении' });
    }
  };

  const handleAddMeasurements = async (entry) => {
    try {
      const response = await progressAPI.addMeasurement({
        date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date,
        chest: entry.chest,
        waist: entry.waist,
        hips: entry.hips,
        biceps: entry.biceps,
        thigh: entry.thigh,
        neck: entry.neck,
        notes: entry.notes
      });
      setMeasurements([response.data.measurement, ...measurements]);
      setShowToast({ type: 'success', message: 'Замеры добавлены' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка при сохранении замеров' });
    }
  };

  // Расчёт статистики
  const weightDataArray = getWeightData();
  const currentWeight = weightDataArray.length > 0 ? weightDataArray[weightDataArray.length - 1].weight : 0;
  const startWeight = weightDataArray.length > 0 ? weightDataArray[0].weight : 0;
  const totalWeightLoss = startWeight > 0 ? (startWeight - currentWeight).toFixed(1) : 0;
  const goalWeight = goals?.target_weight || 75;
  const totalPhotos = photos.length;

  if (loading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-6">
        <div className="flex items-center gap-3">
          <Image className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Прогресс</h1>
        </div>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div className="flex items-center gap-3">
        <Image className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Прогресс</h1>
      </div>

      <Card padding="lg" className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-start gap-4">
          <Trophy className="w-8 h-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-xl mb-2">Отличная работа!</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600">{weightDataArray.length}</div>
                <div className="text-sm text-secondary">записей веса</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{totalPhotos}</div>
                <div className="text-sm text-secondary">фото прогресса</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{totalWeightLoss}</div>
                <div className="text-sm text-secondary">кг сброшено</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <WeightTracker
        weightData={weightDataArray}
        goalWeight={goalWeight}
        onAddWeight={handleAddWeight}
      />

      <MeasurementsTracker
        measurements={measurements}
        onAddMeasurements={handleAddMeasurements}
      />

      <ProgressPhotos
        photos={photos}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      <PhotoComparison photos={photos} />

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

export default Progress;