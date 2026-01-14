import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Target, Activity, ChevronDown } from 'lucide-react';

const GoalsSettings = ({ goals, onSave }) => {
  const [formData, setFormData] = useState({
    caloriesGoal: goals.caloriesGoal || 2000,
    proteinGoal: goals.proteinGoal || 150,
    carbsGoal: goals.carbsGoal || 200,
    fatsGoal: goals.fatsGoal || 70,
    targetWeight: goals.targetWeight || 75,
    activityLevel: goals.activityLevel || 'moderate',
    dietType: goals.dietType || 'balanced',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showDietDropdown, setShowDietDropdown] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Сидячий образ жизни' },
    { value: 'light', label: 'Лёгкая активность' },
    { value: 'moderate', label: 'Умеренная активность' },
    { value: 'active', label: 'Высокая активность' },
    { value: 'very_active', label: 'Очень высокая' },
  ];

  const dietTypes = [
    { value: 'balanced', label: 'Сбалансированное' },
    { value: 'low_carb', label: 'Низкоуглеводная' },
    { value: 'high_protein', label: 'Высокобелковая' },
    { value: 'keto', label: 'Кето-диета' },
    { value: 'vegetarian', label: 'Вегетарианство' },
  ];

  const CustomSelect = ({ value, options, onChange, placeholder, isOpen, setIsOpen }) => {
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none flex items-center justify-between"
        >
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 bg-white border border-divider rounded-xl shadow-lg overflow-hidden">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                    option.value === value ? 'bg-gray-50 font-semibold' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6" />
        <h3 className="text-xl font-bold">Цели и макросы</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Целевой вес (кг)</label>
          <input
            type="number"
            step="0.1"
            value={formData.targetWeight}
            onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Уровень активности</label>
          <CustomSelect
            value={formData.activityLevel}
            options={activityLevels}
            onChange={(value) => handleChange('activityLevel', value)}
            placeholder="Выберите уровень"
            isOpen={showActivityDropdown}
            setIsOpen={setShowActivityDropdown}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Тип питания</label>
          <CustomSelect
            value={formData.dietType}
            options={dietTypes}
            onChange={(value) => handleChange('dietType', value)}
            placeholder="Выберите тип"
            isOpen={showDietDropdown}
            setIsOpen={setShowDietDropdown}
          />
        </div>

        <div className="pt-6 border-t border-divider">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            <h4 className="font-bold">Дневные нормы</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Калории</label>
              <input
                type="number"
                value={formData.caloriesGoal}
                onChange={(e) => handleChange('caloriesGoal', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Белки (г)</label>
              <input
                type="number"
                value={formData.proteinGoal}
                onChange={(e) => handleChange('proteinGoal', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Углеводы (г)</label>
              <input
                type="number"
                value={formData.carbsGoal}
                onChange={(e) => handleChange('carbsGoal', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Жиры (г)</label>
              <input
                type="number"
                value={formData.fatsGoal}
                onChange={(e) => handleChange('fatsGoal', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>
        </div>

        {hasChanges && (
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Сохранить цели
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GoalsSettings;