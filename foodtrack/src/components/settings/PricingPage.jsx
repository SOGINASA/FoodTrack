import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Check, Crown } from 'lucide-react';

const PricingPage = ({ currentPlan, onSelectPlan }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'навсегда',
      features: [
        'Базовое логирование еды',
        'Ручной ввод БЖУ',
        'Дневник питания',
        'Базовая аналитика',
        '5 фото прогресса',
      ],
      limitations: [
        'Нет AI распознавания',
        'Нет групп',
        'Нет экспорта данных',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 499,
      period: 'в месяц',
      popular: true,
      features: [
        'AI распознавание еды',
        'Сканер штрих-кодов',
        'Продвинутая аналитика',
        'Безлимит фото',
        'Персональные советы',
        'Доступ к рецептам',
        'Группы и челленджи',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      period: 'в год',
      savings: 'Экономия 4000₸',
      features: [
        'Всё из Premium',
        'Интеграция с Apple Watch',
        'Консультации диетолога',
        'План питания',
        'Приоритетная поддержка',
        'Экспорт данных',
        'Семейный доступ (5 чел)',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Выберите свой план</h2>
        <p className="text-secondary text-sm sm:text-base">
          Текущий план: <span className="font-semibold text-black">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            padding="lg"
            className={`relative ${plan.popular ? 'ring-2 ring-black' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                Популярный
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl sm:text-4xl font-bold">{plan.price}₸</span>
                <span className="text-secondary text-sm">/ {plan.period}</span>
              </div>
              {plan.savings && (
                <div className="text-xs sm:text-sm text-green-600 font-semibold">{plan.savings}</div>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
              {plan.limitations && plan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-start gap-2 opacity-50">
                  <span className="text-xs sm:text-sm">✗ {limitation}</span>
                </div>
              ))}
            </div>

            {currentPlan === plan.id ? (
              <Button variant="secondary" className="w-full" disabled>
                Текущий план
              </Button>
            ) : (
              <Button 
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.price === 0 ? 'Остаться на Free' : 'Выбрать план'}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Card padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold mb-2">💎 Это MVP версия</h3>
          <p className="text-secondary text-sm sm:text-base">
            Оплата пока не реализована. Все функции доступны для тестирования бесплатно!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PricingPage;