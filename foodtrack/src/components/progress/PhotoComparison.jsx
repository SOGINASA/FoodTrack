import React, { useState } from 'react';
import Card from '../common/Card';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PhotoComparison = ({ photos }) => {
  const [beforePhoto, setBeforePhoto] = useState(photos[0] || null);
  const [afterPhoto, setAfterPhoto] = useState(photos[photos.length - 1] || null);

  if (photos.length < 2) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-secondary">
          Добавьте минимум 2 фото для сравнения
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Сравнение До / После</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">До</label>
          <select
            value={beforePhoto?.id}
            onChange={(e) => setBeforePhoto(photos.find(p => p.id === parseInt(e.target.value)))}
            className="w-full px-4 py-2 mb-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          >
            {photos.map(photo => (
              <option key={photo.id} value={photo.id}>
                {format(photo.date, 'd MMMM yyyy', { locale: ru })}
              </option>
            ))}
          </select>
          <Card padding="none">
            <img 
              src={beforePhoto?.imageUrl} 
              alt="Before" 
              className="w-full aspect-square object-cover rounded-2xl"
            />
          </Card>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">После</label>
          <select
            value={afterPhoto?.id}
            onChange={(e) => setAfterPhoto(photos.find(p => p.id === parseInt(e.target.value)))}
            className="w-full px-4 py-2 mb-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          >
            {photos.map(photo => (
              <option key={photo.id} value={photo.id}>
                {format(photo.date, 'd MMMM yyyy', { locale: ru })}
              </option>
            ))}
          </select>
          <Card padding="none">
            <img 
              src={afterPhoto?.imageUrl} 
              alt="After" 
              className="w-full aspect-square object-cover rounded-2xl"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotoComparison;