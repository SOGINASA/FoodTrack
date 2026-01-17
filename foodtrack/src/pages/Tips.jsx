import React, { useState, useEffect, useMemo } from 'react';
import TipCard from '../components/tips/TipCard';
import Loader from '../components/common/Loader';
import { Lightbulb, Filter, Search } from 'lucide-react';
import { useMeals } from '../hooks/useMeals';
import { useAnalytics } from '../hooks/useAnalytics';

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Получаем реальные данные пользователя
  const { meals, loading: mealsLoading, fetchToday } = useMeals();
  const {
    goals,
    streak,
    weeklyStats,
    weightHistory,
    loading: analyticsLoading,
    fetchGoals,
    fetchStreak,
    fetchWeeklyStats,
    fetchWeightHistory
  } = useAnalytics();

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchToday();
    fetchGoals();
    fetchStreak();
    fetchWeeklyStats();
    fetchWeightHistory(30);
  }, [fetchToday, fetchGoals, fetchStreak, fetchWeeklyStats, fetchWeightHistory]);

  // Вычисляем текущие показатели из приёмов пищи
  const currentTotals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  // Формируем userStats из реальных данных
  const userStats = useMemo(() => {
    const currentWeight = weightHistory?.[0]?.weight || goals?.current_weight || 0;
    const targetWeight = goals?.target_weight || currentWeight;
    const avgCalories = weeklyStats?.summary?.avg_calories || 0;

    // Используем средние за неделю если есть, иначе сегодняшние
    const hasWeeklyData = avgCalories > 0;
    const effectiveCalories = hasWeeklyData ? avgCalories : currentTotals.calories;

    // Процент выполнения целей (для более умной фильтрации)
    const targetCals = goals?.daily_calories || 2000;
    const targetProt = goals?.daily_protein || 150;
    const targetCarb = goals?.daily_carbs || 200;
    const targetFat = goals?.daily_fats || 70;

    return {
      // Текущие значения (сегодня)
      currentCalories: currentTotals.calories,
      currentProtein: currentTotals.protein,
      currentCarbs: currentTotals.carbs,
      currentFats: currentTotals.fats,
      // Цели
      targetCalories: targetCals,
      targetProtein: targetProt,
      targetCarbs: targetCarb,
      targetFats: targetFat,
      // Средние за неделю (для анализа паттернов)
      avgCalories: effectiveCalories,
      avgProtein: weeklyStats?.summary?.avg_protein || currentTotals.protein,
      avgCarbs: weeklyStats?.summary?.avg_carbs || currentTotals.carbs,
      avgFats: weeklyStats?.summary?.avg_fats || currentTotals.fats,
      // Флаг наличия данных
      hasData: hasWeeklyData || currentTotals.calories > 0,
      hasTodayData: currentTotals.calories > 0,
      // Остальное
      weight: currentWeight,
      targetWeight: targetWeight,
      activityLevel: goals?.activity_level || 'moderate',
      streak: streak?.current_streak || 0,
      avgCaloriesWeek: avgCalories,
      waterIntake: goals?.water_goal || 2,
      mealsPerDay: meals.length,
      sleepHours: 7,
    };
  }, [currentTotals, goals, streak, weeklyStats, weightHistory, meals.length]);

  const isLoading = mealsLoading || analyticsLoading;

  // Функция для проверки превышения (учитывает средние данные)
  const exceedsTarget = (current, avg, target, threshold = 0) => {
    if (!userStats.hasData) return false;
    // Приоритет средним за неделю, но учитываем и сегодня
    const value = userStats.hasData ? avg : current;
    return value > target + threshold;
  };

  // Функция для проверки недобора
  const belowTarget = (current, avg, target, ratio = 1) => {
    if (!userStats.hasData) return false;
    const value = userStats.hasData ? avg : current;
    return value < target * ratio;
  };

  // База всех советов (100+)
  const allTips = [
    // КАЛОРИИ - Превышение (20 советов)
    {
      id: 1,
      title: 'Контролируйте размер порций',
      description: 'Вы превышаете дневную норму калорий. Попробуйте использовать меньшие тарелки - исследования показывают, что это помогает съедать на 20% меньше.',
      icon: '🍽️',
      category: 'calories',
      priority: exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 100) ? 'high' : 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 2,
      title: 'Замените калорийные напитки',
      description: 'Сладкие напитки незаметно добавляют до 500 ккал в день. Замените их на воду с лимоном, зелёный чай или несладкий кофе.',
      icon: '🥤',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 200)
    },
    {
      id: 3,
      title: 'Откажитесь от поздних перекусов',
      description: 'Приёмы пищи после 20:00 часто приводят к перееданию. Установите правило "кухня закрыта после ужина".',
      icon: '🌙',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 4,
      title: 'Жуйте медленнее',
      description: 'Мозгу нужно 20 минут чтобы получить сигнал о насыщении. Медленное пережёвывание помогает съесть меньше.',
      icon: '⏱️',
      category: 'calories',
      priority: 'low',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 5,
      title: 'Планируйте приёмы пищи заранее',
      description: 'Спонтанные решения о еде часто приводят к перееданию. Планируйте меню на неделю вперёд.',
      icon: '📋',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 150)
    },
    {
      id: 6,
      title: 'Убирайте искушения из дома',
      description: 'Наличие высококалорийных продуктов дома увеличивает вероятность их употребления на 70%. Не держите вредные снеки в зоне доступа.',
      icon: '🚫',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 300)
    },
    {
      id: 7,
      title: 'Пейте воду перед едой',
      description: 'Стакан воды за 15 минут до еды снижает потребление калорий на 13%. Часто жажду путают с голодом.',
      icon: '💧',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 8,
      title: 'Избегайте "пустых калорий"',
      description: 'Фастфуд, выпечка и сладости дают много калорий, но мало питательных веществ. Выбирайте цельные продукты.',
      icon: '🍰',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 250)
    },
    {
      id: 9,
      title: 'Читайте этикетки продуктов',
      description: 'Многие "здоровые" продукты содержат скрытые калории. Обращайте внимание на размер порции и калорийность.',
      icon: '🏷️',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 10,
      title: 'Ешьте из меньших тарелок',
      description: 'Оптическая иллюзия работает: та же порция на маленькой тарелке кажется больше, что приводит к насыщению меньшим количеством еды.',
      icon: '🍽️',
      category: 'calories',
      priority: 'low',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 11,
      title: 'Готовьте дома чаще',
      description: 'Ресторанные блюда содержат на 60% больше калорий чем домашние. Контролируйте ингредиенты и способ приготовления.',
      icon: '👨‍🍳',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 200)
    },
    {
      id: 12,
      title: 'Избегайте еды "за компанию"',
      description: 'Социальные приёмы пищи часто ведут к перееданию. Ешьте осознанно, даже в компании.',
      icon: '👥',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 13,
      title: 'Не ешьте перед телевизором',
      description: 'Отвлечённый приём пищи увеличивает потребление на 25%. Концентрируйтесь на еде.',
      icon: '📺',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 100)
    },
    {
      id: 14,
      title: 'Используйте спреи вместо масла',
      description: 'Столовая ложка масла = 120 ккал. Спрей для готовки сократит калории на 80-90%.',
      icon: '🧴',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 15,
      title: 'Откажитесь от соусов',
      description: 'Майонез, кетчуп и другие соусы добавляют 100-200 скрытых калорий. Используйте специи и травы.',
      icon: '🥫',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 150)
    },
    {
      id: 16,
      title: 'Ведите дневник питания',
      description: 'Люди, которые записывают всё съеденное, теряют в 2 раза больше веса. Осознанность = контроль.',
      icon: '📝',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 200)
    },
    {
      id: 17,
      title: 'Заменяйте жарку на запекание',
      description: 'Жареная еда впитывает масло и удваивает калории. Запекание сохраняет вкус без лишних калорий.',
      icon: '🔥',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 18,
      title: 'Не пропускайте завтрак',
      description: 'Пропуск завтрака ведёт к перееданию вечером. Съедайте 25-30% калорий утром.',
      icon: '🌅',
      category: 'calories',
      priority: 'high',
      condition: () => userStats.hasData && userStats.mealsPerDay < 3 && exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 19,
      title: 'Выбирайте цельнозерновые продукты',
      description: 'Они дольше перевариваются и дают чувство сытости при меньшей калорийности.',
      icon: '🌾',
      category: 'calories',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories)
    },
    {
      id: 20,
      title: 'Ограничьте алкоголь',
      description: 'Алкоголь содержит 7 ккал на грамм (почти как жир) и стимулирует аппетит. Один коктейль = 300-500 ккал.',
      icon: '🍷',
      category: 'calories',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCalories, userStats.avgCalories, userStats.targetCalories, 300)
    },

    // БЕЛКИ - Недостаток (20 советов)
    {
      id: 21,
      title: 'Увеличьте потребление белка',
      description: `Вы потребляете меньше белка чем нужно. Белок важен для сохранения мышечной массы при похудении.`,
      icon: '🥩',
      category: 'protein',
      priority: belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.7) ? 'high' : 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 22,
      title: 'Добавьте яйца в рацион',
      description: 'Одно яйцо содержит 6г качественного белка и все незаменимые аминокислоты. Идеально для завтрака.',
      icon: '🥚',
      category: 'protein',
      priority: 'high',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.8)
    },
    {
      id: 23,
      title: 'Ешьте греческий йогурт',
      description: 'В нём в 2 раза больше белка чем в обычном йогурте (17г на 170г). Отличный перекус или основа для смузи.',
      icon: '🥛',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 24,
      title: 'Включите рыбу 3 раза в неделю',
      description: 'Лосось, тунец, треска - отличные источники белка (20-25г на 100г) плюс омега-3 жирные кислоты.',
      icon: '🐟',
      category: 'protein',
      priority: 'high',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.75)
    },
    {
      id: 25,
      title: 'Попробуйте творог',
      description: 'Казеиновый белок из творога усваивается медленно, обеспечивая мышцы аминокислотами на протяжении 6-8 часов.',
      icon: '🧀',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 26,
      title: 'Добавьте протеиновый порошок',
      description: 'Если не получается набрать белок из еды, сывороточный протеин - быстрое и удобное решение (20-30г за порцию).',
      icon: '🥤',
      category: 'protein',
      priority: 'high',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.6)
    },
    {
      id: 27,
      title: 'Перекусывайте орехами',
      description: 'Миндаль, грецкие орехи, кешью содержат 6-7г белка на 30г. Плюс полезные жиры.',
      icon: '🥜',
      category: 'protein',
      priority: 'low',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 28,
      title: 'Ешьте куриную грудку',
      description: 'Самый популярный источник белка: 31г белка на 100г при минимуме жира. Универсальна в приготовлении.',
      icon: '🍗',
      category: 'protein',
      priority: 'high',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.8)
    },
    {
      id: 29,
      title: 'Добавьте бобовые',
      description: 'Чечевица, нут, фасоль - растительный белок (15-20г на порцию) плюс клетчатка.',
      icon: '🫘',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 30,
      title: 'Попробуйте тофу',
      description: 'Растительный белок для вегетарианцев: 8г на 100г плюс кальций. Впитывает любые вкусы.',
      icon: '🥡',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.85)
    },
    {
      id: 31,
      title: 'Ешьте протеин в каждый приём',
      description: 'Распределяйте белок равномерно: по 25-35г на завтрак, обед и ужин для оптимального усвоения.',
      icon: '⏰',
      category: 'protein',
      priority: 'high',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.7)
    },
    {
      id: 32,
      title: 'Протеин сразу после тренировки',
      description: 'Анаболическое окно: 30г белка в течение 2 часов после тренировки максимизируют рост мышц.',
      icon: '💪',
      category: 'protein',
      priority: 'high',
      condition: () => userStats.activityLevel !== 'sedentary' && belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 33,
      title: 'Добавьте семена чиа',
      description: '4г белка на 2 столовые ложки плюс омега-3. Добавляйте в йогурт или смузи.',
      icon: '🌱',
      category: 'protein',
      priority: 'low',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 34,
      title: 'Ешьте эдамаме',
      description: 'Молодые соевые бобы: 11г белка на 100г. Отличная закуска с низким содержанием калорий.',
      icon: '🫛',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein, 0.8)
    },
    {
      id: 35,
      title: 'Используйте протеиновые батончики',
      description: 'Удобный перекус в дороге: 15-20г белка. Выбирайте с минимумом сахара (до 10г).',
      icon: '🍫',
      category: 'protein',
      priority: 'low',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 36,
      title: 'Добавьте индейку в рацион',
      description: 'Грудка индейки: 29г белка на 100г. Менее жирная альтернатива курице.',
      icon: '🦃',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 37,
      title: 'Попробуйте протеиновые панкейки',
      description: 'Замените обычную муку на протеиновый порошок: вкусный завтрак с 30г+ белка.',
      icon: '🥞',
      category: 'protein',
      priority: 'low',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 38,
      title: 'Ешьте говядину (нежирную)',
      description: 'Говядина 95% постная: 26г белка на 100г плюс железо и витамин B12.',
      icon: '🥩',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein) * 0.75
    },
    {
      id: 39,
      title: 'Добавьте киноа',
      description: 'Редкий растительный продукт с полным набором аминокислот: 8г белка на чашку.',
      icon: '🌾',
      category: 'protein',
      priority: 'low',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein)
    },
    {
      id: 40,
      title: 'Протеиновый коктейль на ночь',
      description: 'Казеиновый протеин перед сном поддерживает мышцы ночью и улучшает восстановление.',
      icon: '🌙',
      category: 'protein',
      priority: 'medium',
      condition: () => belowTarget(userStats.currentProtein, userStats.avgProtein, userStats.targetProtein) * 0.8
    },

    // УГЛЕВОДЫ - Избыток (20 советов)
    {
      id: 41,
      title: 'Сократите потребление углеводов',
      description: `Вы потребляете ${userStats.currentCarbs}г углеводов при норме ${userStats.targetCarbs}г. Избыток углеводов замедляет жиросжигание.`,
      icon: '🍞',
      category: 'carbs',
      priority: userStats.currentCarbs > userStats.targetCarbs * 1.3 ? 'high' : 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs)
    },
    {
      id: 42,
      title: 'Замените белый хлеб на цельнозерновой',
      description: 'Цельнозерновой хлеб имеет низкий гликемический индекс и больше клетчатки, что улучшает контроль сахара.',
      icon: '🥖',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 43,
      title: 'Откажитесь от сладких хлопьев',
      description: 'Большинство хлопьев - это сахар с минимумом пользы. Замените на овсянку или гранолу без сахара.',
      icon: '🥣',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.4)
    },
    {
      id: 44,
      title: 'Уменьшите порции риса и пасты',
      description: 'Вместо полной тарелки делайте половину овощей, четверть белка, четверть углеводов.',
      icon: '🍚',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 45,
      title: 'Избегайте скрытых сахаров',
      description: 'Соусы, йогурты, готовые завтраки часто содержат 20-30г сахара на порцию. Читайте состав.',
      icon: '🍯',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.5)
    },
    {
      id: 46,
      title: 'Замените картофель на батат',
      description: 'Сладкий картофель имеет более низкий ГИ и больше витамина А. Меньше скачков сахара в крови.',
      icon: '🍠',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 47,
      title: 'Откажитесь от фруктовых соков',
      description: 'Стакан апельсинового сока = 25г сахара без клетчатки. Ешьте целые фрукты.',
      icon: '🧃',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.4)
    },
    {
      id: 48,
      title: 'Используйте овощи вместо гарнира',
      description: 'Цветная капуста вместо риса, кабачковая лапша вместо пасты - минус 150г углеводов за приём.',
      icon: '🥦',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 49,
      title: 'Ограничьте фрукты 2-3 порциями',
      description: 'Фрукты полезны, но содержат фруктозу. Ешьте ягоды (меньше сахара) вместо бананов и винограда.',
      icon: '🍎',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 50,
      title: 'Откажитесь от выпечки и кондитерских изделий',
      description: 'Печенье, торты, пирожные - быстрые углеводы + трансжиры. Никакой пищевой ценности.',
      icon: '🧁',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.5)
    },
    {
      id: 51,
      title: 'Замените макароны на бобовые варианты',
      description: 'Паста из нута или чечевицы: больше белка, меньше углеводов, больше клетчатки.',
      icon: '🍝',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 52,
      title: 'Ешьте углеводы утром и после тренировки',
      description: 'Время важно: утром и после нагрузки углеводы идут в мышцы, а не в жир.',
      icon: '⏰',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 53,
      title: 'Избегайте "низкожировых" продуктов',
      description: 'Производители компенсируют вкус сахаром. Обезжиренный йогурт может содержать 20г+ углеводов.',
      icon: '🥛',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 54,
      title: 'Откажитесь от энергетических батончиков',
      description: 'Большинство - это сахарные бомбы (30-40г углеводов). Ешьте орехи с сухофруктами.',
      icon: '🍫',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 55,
      title: 'Замените крахмалистые овощи',
      description: 'Картофель, кукуруза, горох - высокоуглеводные. Больше листовых овощей и крестоцветных.',
      icon: '🌽',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 56,
      title: 'Читайте состав готовых продуктов',
      description: 'Сахар скрывается под 50+ названиями: декстроза, мальтоза, сироп... Выбирайте продукты с < 5г сахара.',
      icon: '🔍',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.4)
    },
    {
      id: 57,
      title: 'Откажитесь от сухих завтраков',
      description: 'Даже "здоровые" мюсли содержат 30-40г сахара на порцию. Готовьте овсянку сами.',
      icon: '🥣',
      category: 'carbs',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 58,
      title: 'Замените пиццу на открытую версию',
      description: 'Используйте только одну лепёшку как основу или замените на цветную капусту - минус 50г углеводов.',
      icon: '🍕',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },
    {
      id: 59,
      title: 'Контролируйте порции фруктовых смузи',
      description: 'Один смузи может содержать 60-80г сахара. Добавляйте больше овощей, меньше фруктов.',
      icon: '🥤',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.3)
    },
    {
      id: 60,
      title: 'Откажитесь от готовых соусов',
      description: 'Кетчуп, BBQ соус, терияки - это сахар: 4-8г на столовую ложку. Используйте специи.',
      icon: '🥫',
      category: 'carbs',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentCarbs, userStats.avgCarbs, userStats.targetCarbs, userStats.targetCarbs * 0.2)
    },

    // ЖИРЫ - Избыток (20 советов)
    {
      id: 61,
      title: 'Сократите потребление жиров',
      description: `Вы потребляете ${userStats.currentFats}г жиров при норме ${userStats.targetFats}г. Избыток жиров = избыток калорий (9 ккал на грамм).`,
      icon: '🧈',
      category: 'fats',
      priority: userStats.currentFats > userStats.targetFats * 1.3 ? 'high' : 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats)
    },
    {
      id: 62,
      title: 'Выбирайте постное мясо',
      description: 'Замените свинину и баранину на куриную грудку, индейку, нежирную говядину (95% постная).',
      icon: '🍗',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },
    {
      id: 63,
      title: 'Снимайте кожу с курицы',
      description: 'Кожа содержит почти весь жир курицы. Снятие кожи убирает 80% жира.',
      icon: '🐔',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 64,
      title: 'Готовьте без масла',
      description: 'Используйте антипригарные сковороды, запекание, варку, гриль. Одна ложка масла = 14г жира.',
      icon: '🍳',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.4)
    },
    {
      id: 65,
      title: 'Откажитесь от жирных молочных продуктов',
      description: 'Замените цельное молоко на 1%, сливочное масло на спред, сыр на обезжиренные варианты.',
      icon: '🥛',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },
    {
      id: 66,
      title: 'Ограничьте орехи и семена',
      description: 'Хотя полезны, но очень калорийны: 30г орехов = 15-20г жира. Не более 30г в день.',
      icon: '🥜',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 67,
      title: 'Избегайте жареной пищи',
      description: 'Жарка во фритюре увеличивает жир на 200-300%. Запекайте в духовке для хрустящей корочки.',
      icon: '🍟',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.5)
    },
    {
      id: 68,
      title: 'Сократите авокадо',
      description: 'Авокадо полезно, но один плод = 30г жира. Ограничьтесь половиной в день.',
      icon: '🥑',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 69,
      title: 'Откажитесь от майонеза',
      description: 'Столовая ложка = 11г жира. Используйте греческий йогурт или горчицу.',
      icon: '🥪',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },
    {
      id: 70,
      title: 'Выбирайте рыбу вместо мяса',
      description: 'Белая рыба (треска, тилапия) содержит минимум жира при высоком белке.',
      icon: '🐟',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 71,
      title: 'Читайте этикетки на "диетических" продуктах',
      description: 'Многие продукты с пометкой "фитнес" содержат 10-15г жира на порцию.',
      icon: '🏷️',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 72,
      title: 'Срезайте видимый жир с мяса',
      description: 'Жировая прослойка на стейке или отбивной - это чистый жир. Срезайте перед приготовлением.',
      icon: '🔪',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },
    {
      id: 73,
      title: 'Откажитесь от сливочных соусов',
      description: 'Альфредо, карбонара, сливочные супы - 20-30г жира на порцию. Выбирайте томатные соусы.',
      icon: '🍝',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.4)
    },
    {
      id: 74,
      title: 'Ограничьте кокосовое масло',
      description: 'Хотя модно, но на 90% состоит из насыщенных жиров. Используйте умеренно.',
      icon: '🥥',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 75,
      title: 'Откажитесь от фастфуда',
      description: 'Бургеры, картофель фри, наггетсы содержат трансжиры и 30-50г жира на порцию.',
      icon: '🍔',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.5)
    },
    {
      id: 76,
      title: 'Используйте спрей вместо масла',
      description: 'Кулинарный спрей содержит 1г жира vs 14г в ложке масла. Экономия 13г жира.',
      icon: '🧴',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },
    {
      id: 77,
      title: 'Выбирайте обезжиренные заправки',
      description: 'Салатные заправки - скрытый источник: 10-15г жира на 2 ложки. Используйте бальзамический уксус.',
      icon: '🥗',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 78,
      title: 'Откажитесь от жирных десертов',
      description: 'Мороженое, чизкейк, тирамису - 20-40г жира на порцию. Выбирайте фруктовые десерты.',
      icon: '🍰',
      category: 'fats',
      priority: 'high',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.4)
    },
    {
      id: 79,
      title: 'Ограничьте арахисовое масло',
      description: 'Столовая ложка = 8г жира. Отмеряйте порции, не ешьте из банки.',
      icon: '🥜',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.2)
    },
    {
      id: 80,
      title: 'Готовьте на пару или в мультиварке',
      description: 'Эти методы не требуют добавления жира, сохраняя натуральный вкус продуктов.',
      icon: '🍲',
      category: 'fats',
      priority: 'medium',
      condition: () => exceedsTarget(userStats.currentFats, userStats.avgFats, userStats.targetFats, userStats.targetFats * 0.3)
    },

    // ОБРАЗ ЖИЗНИ (20 советов)
    {
      id: 81,
      title: 'Увеличьте водопотребление',
      description: `Вы пьёте ${userStats.waterIntake}л при рекомендации 2-3л. Вода ускоряет метаболизм на 30% в течение часа.`,
      icon: '💧',
      category: 'lifestyle',
      priority: userStats.waterIntake < 1.5 ? 'high' : 'medium',
      condition: () => userStats.hasData && userStats.waterIntake < 2
    },
    {
      id: 82,
      title: 'Спите не менее 7-8 часов',
      description: `Вы спите ${userStats.sleepHours} часов. Недосып увеличивает гормон голода грелин на 15% и снижает лептин (сытость).`,
      icon: '😴',
      category: 'lifestyle',
      priority: userStats.sleepHours < 6 ? 'high' : 'medium',
      condition: () => userStats.hasData && userStats.sleepHours < 7
    },
    {
      id: 83,
      title: 'Больше двигайтесь в течение дня',
      description: 'Добавьте 10,000 шагов в день. Это сжигает дополнительно 300-400 ккал без специальных тренировок.',
      icon: '🚶',
      category: 'lifestyle',
      priority: userStats.activityLevel === 'sedentary' ? 'high' : 'medium',
      condition: () => userStats.hasData && (userStats.activityLevel === 'sedentary' || userStats.activityLevel === 'light')
    },
    {
      id: 84,
      title: 'Добавьте силовые тренировки',
      description: 'Мышцы сжигают калории даже в покое. 3 тренировки в неделю увеличивают базовый метаболизм на 7%.',
      icon: '🏋️',
      category: 'lifestyle',
      priority: 'high',
      condition: () => userStats.hasData && userStats.activityLevel !== 'very_active'
    },
    {
      id: 85,
      title: 'Управляйте стрессом',
      description: 'Стресс повышает кортизол, который провоцирует накопление жира в области живота. Практикуйте медитацию.',
      icon: '🧘',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 86,
      title: 'Принимайте витамин D',
      description: 'Дефицит витамина D связан с набором веса. 2000 МЕ в день, особенно зимой.',
      icon: '☀️',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 87,
      title: 'Гуляйте после еды',
      description: '15-минутная прогулка после еды снижает сахар в крови на 20% и улучшает пищеварение.',
      icon: '🚶‍♂️',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 88,
      title: 'Храните здоровые снеки под рукой',
      description: 'Морковь, огурцы, яблоки, орехи - когда голодны, вы съедите то, что доступно.',
      icon: '🥕',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 89,
      title: 'Не делайте покупки голодным',
      description: 'Голод увеличивает покупку высококалорийных продуктов на 64%. Составьте список и следуйте ему.',
      icon: '🛒',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 90,
      title: 'Взвешивайтесь регулярно',
      description: 'Ежедневное взвешивание (утром, натощак) повышает осознанность и улучшает результаты на 50%.',
      icon: '⚖️',
      category: 'lifestyle',
      priority: 'high',
      condition: () => userStats.hasData
    },
    {
      id: 91,
      title: 'Найдите партнёра по похудению',
      description: 'Социальная поддержка увеличивает шансы на успех на 95%. Присоединитесь к группе или найдите друга.',
      icon: '👥',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 92,
      title: 'Отслеживайте прогресс фотографиями',
      description: 'Делайте фото каждые 2 недели. Визуальные изменения мотивируют лучше, чем цифры на весах.',
      icon: '📸',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 93,
      title: 'Празднуйте небольшие победы',
      description: 'Каждый сброшенный килограмм, каждая неделя соблюдения плана - повод для гордости, не еды.',
      icon: '🎉',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData && userStats.streak >= 7
    },
    {
      id: 94,
      title: 'Планируйте читмилы',
      description: 'Один контролируемый приём "вредной" еды в неделю снижает тягу к срывам на 80%.',
      icon: '🍕',
      category: 'lifestyle',
      priority: 'medium',
      condition: () => userStats.hasData
    },
    {
      id: 95,
      title: 'Пейте зелёный чай',
      description: 'EGCG в зелёном чае ускоряет жиросжигание на 17%. 3-4 чашки в день.',
      icon: '🍵',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 96,
      title: 'Выходите на солнце',
      description: '20 минут утреннего солнца регулируют циркадные ритмы и улучшают сон, что способствует похудению.',
      icon: '🌞',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData && userStats.sleepHours < 7
    },
    {
      id: 97,
      title: 'Не сравнивайте себя с другими',
      description: 'Каждый организм уникален. Фокусируйтесь на своём прогрессе, не на чужих результатах.',
      icon: '🎯',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 98,
      title: 'Готовьте порции на несколько дней',
      description: 'Meal prep в воскресенье на всю неделю экономит время и предотвращает "голодные" решения.',
      icon: '📦',
      category: 'lifestyle',
      priority: 'high',
      condition: () => userStats.hasData
    },
    {
      id: 99,
      title: 'Используйте меньшие столовые приборы',
      description: 'Маленькая ложка и вилка замедляют еду и снижают порции на 10% незаметно для вас.',
      icon: '🍴',
      category: 'lifestyle',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 100,
      title: 'Не пропускайте приёмы пищи',
      description: 'Регулярное питание (3-5 раз в день) поддерживает метаболизм и предотвращает переедание.',
      icon: '⏰',
      category: 'lifestyle',
      priority: 'high',
      condition: () => userStats.hasData && userStats.mealsPerDay < 3
    },

    // МОТИВАЦИЯ (10 советов)
    {
      id: 101,
      title: 'Отличная работа! Продолжайте в том же духе',
      description: `Стрик ${userStats.streak} дней! Вы на правильном пути. Каждый день приближает вас к цели.`,
      icon: '🔥',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData && userStats.streak >= 7
    },
    {
      id: 102,
      title: 'Вы близки к своей цели!',
      description: `Осталось сбросить ${userStats.weight - userStats.targetWeight}кг. Это всего ${Math.round(((userStats.weight - userStats.targetWeight) / (userStats.weight)) * 100)}% от текущего веса!`,
      icon: '🎯',
      category: 'motivation',
      priority: 'medium',
      condition: () => userStats.hasData && userStats.weight > 0 && userStats.weight - userStats.targetWeight <= 5 && userStats.weight > userStats.targetWeight
    },
    {
      id: 103,
      title: 'Помните свою цель',
      description: 'Каждое решение о еде - это шаг к цели или от неё. Что вы выбираете сегодня?',
      icon: '💭',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 104,
      title: 'Вы сильнее своих желаний',
      description: 'Тяга к еде длится 15-20 минут. Подождите, попейте воды - и она пройдёт.',
      icon: '💪',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 105,
      title: 'Прогресс важнее совершенства',
      description: 'Один "плохой" день не испортит результаты. Просто вернитесь к плану завтра.',
      icon: '📈',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 106,
      title: 'Здоровье - это марафон',
      description: 'Быстрая потеря веса = быстрый возврат. Медленно и стабильно = навсегда.',
      icon: '🏃‍♂️',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 107,
      title: 'Вы уже начали',
      description: 'Самый сложный шаг - первый. Вы его сделали. Продолжайте двигаться вперёд!',
      icon: '🚀',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData && userStats.streak >= 1
    },
    {
      id: 108,
      title: 'Ваше будущее "я" скажет спасибо',
      description: 'Каждое правильное решение сегодня - это инвестиция в здоровье на годы вперёд.',
      icon: '🙏',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 109,
      title: 'Вы контролируете свой выбор',
      description: 'Еда не контролирует вас. Вы решаете что, когда и сколько есть. Вы - хозяин своего тела.',
      icon: '👑',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
    {
      id: 110,
      title: 'Каждый день - новая возможность',
      description: 'Вчера неважно. Сегодня вы можете сделать всё правильно. Начните прямо сейчас!',
      icon: '🌅',
      category: 'motivation',
      priority: 'low',
      condition: () => userStats.hasData
    },
  ];

  // Фильтрация советов по условиям
  const relevantTips = allTips.filter(tip => tip.condition());

  // Сортировка по приоритету
  const sortedTips = relevantTips.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Фильтрация по поиску и категории
  const filteredTips = sortedTips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || tip.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = [
    { value: 'all', label: 'Все советы' },
    { value: 'calories', label: 'Калории' },
    { value: 'protein', label: 'Белки' },
    { value: 'carbs', label: 'Углеводы' },
    { value: 'fats', label: 'Жиры' },
    { value: 'lifestyle', label: 'Образ жизни' },
    { value: 'motivation', label: 'Мотивация' },
  ];

  const priorities = [
    { value: 'all', label: 'Все приоритеты' },
    { value: 'high', label: 'Высокий' },
    { value: 'medium', label: 'Средний' },
    { value: 'low', label: 'Низкий' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Советы</h1>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск советов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-2">
          Найдено {filteredTips.length} персонализированных советов
        </h3>
        <p className="text-secondary text-sm">
          Советы основаны на ваших текущих показателях и целях
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTips.map(tip => (
          <TipCard
            key={tip.id}
            title={tip.title}
            description={tip.description}
            icon={tip.icon}
            priority={tip.priority}
            category={tip.category}
          />
        ))}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-bold text-xl mb-2">Советы не найдены</h3>
          <p className="text-secondary">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      )}
    </div>
  );
};

export default Tips;