import React, { useState, useEffect } from 'react';
import TipCard from '../components/tips/TipCard';
import Card from '../components/common/Card';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

const Tips = () => {
  const [userStats] = useState({
    avgCalories: 2100,
    avgProtein: 85,
    avgCarbs: 250,
    avgFats: 80,
    caloriesGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatsGoal: 70,
  });

  const generatePersonalizedTips = () => {
    const tips = [];

    if (userStats.avgFats > userStats.fatsGoal * 1.2) {
      tips.push({
        id: 1,
        icon: '🥗',
        title: 'Много жиров в рационе',
        description: 'Вы потребляете слишком много жиров. Попробуйте добавить больше овощей и зелени. Замените жареное на запечённое или отварное.',
        category: 'Питание',
        priority: 'high',
      });
    }

    if (userStats.avgProtein < userStats.proteinGoal * 0.8) {
      tips.push({
        id: 2,
        icon: '🍗',
        title: 'Недостаточно белка',
        description: 'Увеличьте потребление белка: добавьте курицу, рыбу, яйца, творог или бобовые. Белок важен для мышц и насыщения.',
        category: 'Макронутриенты',
        priority: 'high',
      });
    }

    if (userStats.avgCarbs > userStats.carbsGoal * 1.3) {
      tips.push({
        id: 3,
        icon: '🌾',
        title: 'Много углеводов',
        description: 'Попробуйте заменить часть простых углеводов (сладкое, белый хлеб) на сложные: цельнозерновые, овощи, бобовые.',
        category: 'Питание',
        priority: 'medium',
      });
    }

    if (userStats.avgCalories > userStats.caloriesGoal * 1.1) {
      tips.push({
        id: 4,
        icon: '⚖️',
        title: 'Превышение калорий',
        description: 'Вы превышаете дневную норму калорий. Попробуйте контролировать размеры порций и избегать перекусов поздно вечером.',
        category: 'Калории',
        priority: 'medium',
      });
    }

    tips.push({
      id: 5,
      icon: '💧',
      title: 'Пейте больше воды',
      description: 'Старайтесь выпивать минимум 1.5-2 литра воды в день. Вода помогает контролировать аппетит и улучшает обмен веществ.',
      category: 'Здоровье',
      priority: 'low',
    });

    tips.push({
      id: 6,
      icon: '🥦',
      title: 'Добавьте овощей',
      description: 'Овощи низкокалорийны и богаты клетчаткой. Старайтесь, чтобы половина тарелки была заполнена овощами.',
      category: 'Питание',
      priority: 'low',
    });

    tips.push({
      id: 7,
      icon: '🍽️',
      title: 'Контроль порций',
      description: 'Используйте меньшие тарелки, ешьте медленно и останавливайтесь, когда чувствуете насыщение на 80%.',
      category: 'Привычки',
      priority: 'medium',
    });

    return tips;
  };

  const [tips] = useState(generatePersonalizedTips());

  const highPriorityTips = tips.filter(t => t.priority === 'high');
  const otherTips = tips.filter(t => t.priority !== 'high');

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Советы по питанию</h1>
      </div>

      <Card padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Персонализированные рекомендации</h3>
            <p className="text-secondary">
              Мы анализируем ваш рацион и даём советы на основе ваших данных за последнюю неделю.
            </p>
          </div>
        </div>
      </Card>

      {highPriorityTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold">Важные рекомендации</h2>
          </div>
          <div className="space-y-4">
            {highPriorityTips.map(tip => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Общие советы</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {otherTips.map(tip => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tips;