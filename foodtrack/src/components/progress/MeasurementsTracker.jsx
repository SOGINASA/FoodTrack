import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Ruler, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MeasurementsTracker = ({ measurements, onAddMeasurements }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeasurements, setNewMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    arm: '',
    thigh: '',
  });
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const handleInputChange = (field, value) => {
    setNewMeasurements({
      ...newMeasurements,
      [field]: value,
    });
  };

  const handleAddMeasurements = () => {
    const hasAnyMeasurement = Object.values(newMeasurements).some(v => v !== '');

    if (hasAnyMeasurement) {
      // Валидация даты
      const selectedDate = new Date(newDate);
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

      onAddMeasurements({
        id: Date.now(),
        date: selectedDate,
        ...Object.fromEntries(
          Object.entries(newMeasurements).map(([key, value]) => [key, value ? parseFloat(value) : null])
        ),
      });
      setShowAddModal(false);
      setNewMeasurements({
        chest: '',
        waist: '',
        hips: '',
        arm: '',
        thigh: '',
      });
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  const measurementLabels = {
    chest: 'Грудь',
    waist: 'Талия',
    hips: 'Бёдра',
    arm: 'Рука',
    thigh: 'Нога',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Замеры тела</h3>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Добавить замеры
        </Button>
      </div>

      {!latestMeasurement ? (
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">📏</div>
          <h4 className="font-bold text-lg mb-2">Нет замеров</h4>
          <p className="text-secondary mb-4">
            Добавьте первые замеры для отслеживания изменений
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Добавить замеры
          </Button>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4 text-sm text-secondary">
            <Ruler className="w-4 h-4" />
            Последние замеры от {format(latestMeasurement.date, 'd MMMM yyyy', { locale: ru })}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(measurementLabels).map(([key, label]) => (
              latestMeasurement[key] && (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-secondary mb-1">{label}</div>
                  <div className="text-2xl font-bold">{latestMeasurement[key]}</div>
                  <div className="text-xs text-secondary">см</div>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {measurements.length > 1 && (
        <Card padding="lg">
          <h4 className="font-semibold mb-4">История замеров</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...measurements].reverse().map((entry) => (
              <div key={entry.id} className="pb-3 border-b border-divider last:border-0">
                <div className="text-sm text-secondary mb-2">
                  {format(entry.date, 'd MMMM yyyy', { locale: ru })}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(measurementLabels).map(([key, label]) => (
                    entry[key] && (
                      <div key={key}>
                        <span className="text-secondary">{label}:</span>{' '}
                        <span className="font-semibold">{entry[key]} см</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewMeasurements({
            chest: '',
            waist: '',
            hips: '',
            arm: '',
            thigh: '',
          });
        }}
        title="Добавить замеры"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Дата</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-secondary">Заполните нужные замеры (в сантиметрах)</p>
            {Object.entries(measurementLabels).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2">{label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurements[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder="см"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setNewMeasurements({
                  chest: '',
                  waist: '',
                  hips: '',
                  arm: '',
                  thigh: '',
                });
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={handleAddMeasurements}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MeasurementsTracker;