import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Scale, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const WeightTracker = ({ weightData, goalWeight, onAddWeight }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0;
  const startWeight = weightData.length > 0 ? weightData[0].weight : 0;
  const weightChange = currentWeight - startWeight;
  const progressPercent = startWeight > 0 
    ? Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100) 
    : 0;

  const handleAddWeight = () => {
    if (newWeight) {
      onAddWeight({
        id: Date.now(),
        weight: parseFloat(newWeight),
        date: new Date(newDate),
      });
      setShowAddModal(false);
      setNewWeight('');
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Вес</h3>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Добавить вес
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondary">Текущий вес</span>
            <Scale className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-4xl font-bold mb-1">{currentWeight}</div>
          <div className="text-sm text-secondary">кг</div>
        </Card>

        <Card padding="lg">
          <div className="text-sm text-secondary mb-2">Цель</div>
          <div className="text-4xl font-bold mb-1">{goalWeight}</div>
          <div className="text-sm text-secondary">кг</div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondary">Изменение</span>
            {weightChange < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className={`text-4xl font-bold mb-1 ${weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
          </div>
          <div className="text-sm text-secondary">кг</div>
        </Card>
      </div>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-secondary mb-1">Прогресс к цели</div>
            <div className="text-3xl font-bold">{Math.max(0, progressPercent)}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary mb-1">Осталось</div>
            <div className="text-2xl font-bold">{Math.max(0, currentWeight - goalWeight).toFixed(1)} кг</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </Card>

      {weightData.length > 0 && (
        <Card padding="lg">
          <h4 className="font-semibold mb-4">История измерений</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...weightData].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-divider last:border-0">
                <div className="text-sm text-secondary">
                  {format(entry.date, 'd MMMM yyyy', { locale: ru })}
                </div>
                <div className="text-lg font-bold">{entry.weight} кг</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewWeight('');
        }}
        title="Добавить вес"
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

          <div>
            <label className="block text-sm font-semibold mb-2">Вес (кг)</label>
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Введите вес"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setNewWeight('');
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="primary" 
              className="flex-1"
              disabled={!newWeight}
              onClick={handleAddWeight}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WeightTracker;