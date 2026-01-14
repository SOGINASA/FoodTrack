import React, { useState } from 'react';
import ProgressPhotos from '../components/progress/ProgressPhotos';
import PhotoComparison from '../components/progress/PhotoComparison';
import WeightTracker from '../components/progress/WeightTracker';
import MeasurementsTracker from '../components/progress/MeasurementsTracker';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import { Image, Trophy } from 'lucide-react';

const Progress = () => {
  const [showToast, setShowToast] = useState(null);

  const [photos, setPhotos] = useState([
    {
      id: 1,
      date: new Date('2024-01-15'),
      imageUrl: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Start',
    },
    {
      id: 2,
      date: new Date('2024-02-15'),
      imageUrl: 'https://via.placeholder.com/400x400/FFB84D/FFFFFF?text=1+Month',
    },
    {
      id: 3,
      date: new Date('2024-03-15'),
      imageUrl: 'https://via.placeholder.com/400x400/4D9FFF/FFFFFF?text=2+Months',
    },
  ]);

  const [weightData, setWeightData] = useState([
    { id: 1, weight: 85.5, date: new Date('2024-01-15') },
    { id: 2, weight: 84.2, date: new Date('2024-01-22') },
    { id: 3, weight: 83.8, date: new Date('2024-01-29') },
    { id: 4, weight: 82.9, date: new Date('2024-02-05') },
    { id: 5, weight: 82.1, date: new Date('2024-02-12') },
    { id: 6, weight: 81.5, date: new Date('2024-02-19') },
  ]);

  const [measurements, setMeasurements] = useState([
    {
      id: 1,
      date: new Date('2024-01-15'),
      chest: 98,
      waist: 92,
      hips: 102,
      arm: 35,
      thigh: 58,
    },
    {
      id: 2,
      date: new Date('2024-02-15'),
      chest: 96,
      waist: 89,
      hips: 100,
      arm: 34,
      thigh: 56,
    },
  ]);

  const goalWeight = 75;

  const handleAddPhoto = (photo) => {
    setPhotos([...photos, photo]);
    setShowToast({ type: 'success', message: 'Фото добавлено' });
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId));
    setShowToast({ type: 'success', message: 'Фото удалено' });
  };

  const handleAddWeight = (entry) => {
    setWeightData([...weightData, entry]);
    setShowToast({ type: 'success', message: 'Вес добавлен' });
  };

  const handleAddMeasurements = (entry) => {
    setMeasurements([...measurements, entry]);
    setShowToast({ type: 'success', message: 'Замеры добавлены' });
  };

  const daysOnTrack = 45;
  const totalPhotos = photos.length;
  const totalWeightLoss = weightData.length > 0 
    ? (weightData[0].weight - weightData[weightData.length - 1].weight).toFixed(1)
    : 0;

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
                <div className="text-3xl font-bold text-purple-600">{daysOnTrack}</div>
                <div className="text-sm text-secondary">дней в треке</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{totalPhotos}</div>
                <div className="text-sm text-secondary">фото прогресса</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">-{totalWeightLoss}</div>
                <div className="text-sm text-secondary">кг сброшено</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <WeightTracker
        weightData={weightData}
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