// Простые, практичные валидации для фронта FoodTrack
// (без бэка, но чтобы UI был стабилен и предсказуем)

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// Никнейм: латиница/цифры/._-, без пробелов
const NICKNAME_REGEX =
  /^[a-zA-Z0-9._-]{3,20}$/;

export function isEmailLike(value = '') {
  const v = String(value).trim();
  if (!v) return false;
  return EMAIL_REGEX.test(v);
}

export function validateNicknameOrEmail(value = '') {
  const v = String(value).trim();

  if (!v) {
    return { ok: false, error: 'Введите ник или почту' };
  }

  // Если похоже на email — валидируем как email
  if (isEmailLike(v) || v.includes('@')) {
    if (!EMAIL_REGEX.test(v)) {
      return { ok: false, error: 'Почта выглядит некорректно' };
    }
    return { ok: true };
  }

  // Иначе — валидируем как ник
  if (!NICKNAME_REGEX.test(v)) {
    return {
      ok: false,
      error: 'Ник: 3–20 символов (латиница/цифры/._-), без пробелов',
    };
  }

  return { ok: true };
}

export function validatePassword(value = '') {
  const v = String(value);

  if (!v) return { ok: false, error: 'Введите пароль' };
  if (v.length < 4) return { ok: false, error: 'Пароль минимум 4 символа' };
  if (v.length > 64) return { ok: false, error: 'Пароль слишком длинный' };

  return { ok: true };
}

// --- Onboarding validations (мы будем использовать в Onboarding.jsx) ---

export function validateBirthYear(year) {
  const n = Number(year);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(n)) return { ok: false, error: 'Введите год рождения' };
  if (n < 1900) return { ok: false, error: 'Слишком маленький год' };
  if (n > currentYear) return { ok: false, error: 'Год не может быть в будущем' };

  // Можно ужесточить (например 10+), но пока мягко:
  if (currentYear - n < 10) return { ok: false, error: 'Слишком маленький возраст' };

  return { ok: true };
}

export function validateHeightCm(height) {
  const n = Number(height);
  if (!Number.isFinite(n)) return { ok: false, error: 'Введите рост' };
  if (n < 100) return { ok: false, error: 'Рост слишком маленький' };
  if (n > 230) return { ok: false, error: 'Рост слишком большой' };
  return { ok: true };
}

export function validateWeightKg(weight) {
  const n = Number(weight);
  if (!Number.isFinite(n)) return { ok: false, error: 'Введите вес' };
  if (n < 30) return { ok: false, error: 'Вес слишком маленький' };
  if (n > 250) return { ok: false, error: 'Вес слишком большой' };
  return { ok: true };
}

export function validateTargetWeightKg(targetWeight) {
  const n = Number(targetWeight);
  if (!Number.isFinite(n)) return { ok: false, error: 'Введите цель по весу' };
  if (n < 30) return { ok: false, error: 'Цель слишком маленькая' };
  if (n > 250) return { ok: false, error: 'Цель слишком большая' };
  return { ok: true };
}

export function validateMealsPerDay(meals) {
  const n = Number(meals);
  if (!Number.isFinite(n)) return { ok: false, error: 'Укажите приёмы пищи в день' };
  if (n < 1) return { ok: false, error: 'Минимум 1 приём пищи' };
  if (n > 6) return { ok: false, error: 'Максимум 6 приёмов пищи' };
  return { ok: true };
}

export function validateWorkoutsPerWeek(workouts) {
  const n = Number(workouts);
  if (!Number.isFinite(n)) return { ok: false, error: 'Укажите тренировки в неделю' };
  if (n < 0) return { ok: false, error: 'Не может быть меньше 0' };
  if (n > 14) return { ok: false, error: 'Слишком много тренировок' };
  return { ok: true };
}

export function validateDisclaimerAccepted(accepted) {
  if (!accepted) return { ok: false, error: 'Нужно принять отказ от претензий' };
  return { ok: true };
}

// --- Date validations ---

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Парсит строку даты в объект Date
 * @param {string} dateStr - Дата в формате YYYY-MM-DD
 * @returns {Date|null} - Date объект или null если невалидно
 */
export function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  if (!DATE_REGEX.test(dateStr)) return null;

  const [year, month, day] = dateStr.split('-').map(Number);

  // Проверяем что числа адекватные
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Создаём дату и проверяем что она валидна
  const date = new Date(year, month - 1, day);

  // Проверяем что дата не "перетекла" (например 31 февраля -> 3 марта)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Валидация даты с опциями
 * @param {string} dateStr - Дата в формате YYYY-MM-DD
 * @param {Object} options - Опции валидации
 * @param {boolean} options.required - Обязательное поле
 * @param {boolean} options.allowFuture - Разрешить будущие даты
 * @param {boolean} options.allowPast - Разрешить прошлые даты
 * @param {Date|string} options.minDate - Минимальная дата
 * @param {Date|string} options.maxDate - Максимальная дата
 * @returns {{ ok: boolean, error?: string, date?: Date }}
 */
export function validateDate(dateStr, options = {}) {
  const {
    required = false,
    allowFuture = true,
    allowPast = true,
    minDate = null,
    maxDate = null,
  } = options;

  // Пустая дата
  if (!dateStr || dateStr.trim() === '') {
    if (required) {
      return { ok: false, error: 'Укажите дату' };
    }
    return { ok: true, date: null };
  }

  // Проверка формата
  if (!DATE_REGEX.test(dateStr)) {
    return { ok: false, error: 'Неверный формат даты (ожидается ГГГГ-ММ-ДД)' };
  }

  // Парсим дату
  const date = parseDate(dateStr);
  if (!date) {
    return { ok: false, error: 'Некорректная дата' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Проверка на будущее
  if (!allowFuture && date > today) {
    return { ok: false, error: 'Дата не может быть в будущем' };
  }

  // Проверка на прошлое
  if (!allowPast && date < today) {
    return { ok: false, error: 'Дата не может быть в прошлом' };
  }

  // Проверка минимальной даты
  if (minDate) {
    const min = typeof minDate === 'string' ? parseDate(minDate) : minDate;
    if (min && date < min) {
      return { ok: false, error: 'Дата слишком ранняя' };
    }
  }

  // Проверка максимальной даты
  if (maxDate) {
    const max = typeof maxDate === 'string' ? parseDate(maxDate) : maxDate;
    if (max && date > max) {
      return { ok: false, error: 'Дата слишком поздняя' };
    }
  }

  return { ok: true, date };
}

/**
 * Форматирует Date в строку YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDateISO(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Получить сегодняшнюю дату в формате YYYY-MM-DD
 * @returns {string}
 */
export function getTodayISO() {
  return formatDateISO(new Date());
}
