import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Check, Crown, X } from 'lucide-react';

const PricingPage = ({ currentPlan = 'free', onSelectPlan = () => {} }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'навсегда',
      description: 'Для начинающих',
      features: [
        'Логирование еды',
        'Ручной ввод БЖУ',
        'AI распознавание (3 раза в день)',
        'Дневник питания',
        'Базовая аналитика',
        'До 10 фото прогресса',
        'Трекинг воды',
      ],
      limitations: [
        'Ограничено AI распознавание',
        'Нет сканера штрих-кодов',
        'Нет групп и челленджей',
        'Нет экспорта данных',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 499,
      period: 'месяц',
      description: 'Для активных пользователей',
      popular: true,
      features: [
        'Безлимитное AI распознавание',
        'Сканер штрих-кодов',
        'Продвинутая аналитика',
        'Безлимит фото прогресса',
        'Персональные советы AI',
        'База из 10000+ рецептов',
        'Группы и челленджи',
        'Трекинг макронутриентов',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      period: 'год',
      description: 'Для профессионалов',
      savings: 'Экономия 4000₸',
      features: [
        'Всё из Premium',
        'Интеграция с Apple Watch & Fitbit',
        'Консультации с диетологом (2 в месяц)',
        'Персональный план питания',
        'Приоритетная поддержка 24/7',
        'Экспорт данных в Excel/PDF',
        'Семейный доступ (до 5 человек)',
        'Расширенные отчёты по здоровью',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Выберите свой план
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-4">
            Получите больше возможностей с Premium и Pro
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-600">Текущий план:</span>
            <span className="text-sm font-bold text-black uppercase">{currentPlan}</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-black shadow-2xl md:scale-105' 
                  : 'border-gray-200 hover:border-gray-400 hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                  <div className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Crown className="w-4 h-4" />
                    <span>Популярный</span>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
                  <div className="flex items-end justify-center gap-1 mb-2">
                    <span className="text-5xl sm:text-6xl font-bold leading-none">
                      {plan.price}
                    </span>
                    <span className="text-2xl font-bold text-gray-600 pb-1">₸</span>
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    {plan.price === 0 ? plan.period : `за ${plan.period}`}
                  </div>
                  {plan.savings && (
                    <div className="mt-3 inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-1.5 rounded-full text-xs font-bold">
                      {plan.savings}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-gray-800 leading-relaxed font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-3 opacity-40">
                      <div className="flex-shrink-0 mt-0.5">
                        <X className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-gray-500 leading-relaxed">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  {currentPlan === plan.id ? (
                    <div className="w-full py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl text-center font-bold text-sm cursor-not-allowed border-2 border-gray-200">
                      Текущий план
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectPlan(plan.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 ${
                        plan.popular
                          ? 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-lg hover:shadow-xl'
                          : 'bg-white border-2 border-gray-300 text-black hover:border-black hover:bg-gray-50 active:scale-95'
                      }`}
                    >
                      {plan.price === 0 ? 'Выбрать Free' : `Выбрать ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MVP Notice */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-3xl p-8 sm:p-10 border-2 border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">Это MVP версия</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Оплата пока не реализована. Все функции доступны для тестирования бесплатно!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;