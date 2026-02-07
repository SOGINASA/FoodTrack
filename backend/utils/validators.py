"""Валидаторы для данных API"""

from datetime import datetime, date, timedelta
from typing import Optional, Tuple, Union
import re

# Регулярное выражение для формата YYYY-MM-DD
DATE_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')


def parse_date(
    date_str: Optional[str],
    required: bool = False,
    allow_future: bool = True,
    allow_past: bool = True,
    max_days_future: Optional[int] = None,
    max_days_past: Optional[int] = None,
) -> Tuple[Optional[date], Optional[str]]:
    """
    Безопасно парсит строку даты в объект date.

    Args:
        date_str: Строка даты в формате YYYY-MM-DD
        required: Если True, пустая строка вернёт ошибку
        allow_future: Разрешить даты в будущем
        allow_past: Разрешить даты в прошлом
        max_days_future: Максимальное количество дней в будущее (None = без ограничений)
        max_days_past: Максимальное количество дней в прошлое (None = без ограничений)

    Returns:
        Tuple[Optional[date], Optional[str]]: (parsed_date, error_message)
        Если error_message не None, парсинг неуспешен
    """
    # Пустое значение
    if not date_str or (isinstance(date_str, str) and date_str.strip() == ''):
        if required:
            return None, 'Дата обязательна'
        return None, None

    # Проверка типа
    if not isinstance(date_str, str):
        return None, 'Дата должна быть строкой'

    date_str = date_str.strip()

    # Проверка формата
    if not DATE_REGEX.match(date_str):
        return None, 'Неверный формат даты (ожидается ГГГГ-ММ-ДД)'

    # Парсим компоненты
    try:
        year, month, day = map(int, date_str.split('-'))
    except ValueError:
        return None, 'Некорректная дата'

    # Проверка диапазонов
    if year < 1900 or year > 2100:
        return None, 'Год должен быть между 1900 и 2100'

    if month < 1 or month > 12:
        return None, 'Месяц должен быть от 1 до 12'

    if day < 1 or day > 31:
        return None, 'День должен быть от 1 до 31'

    # Пытаемся создать дату
    try:
        parsed = date(year, month, day)
    except ValueError as e:
        return None, f'Некорректная дата: {str(e)}'

    today = date.today()

    # Проверка на будущее
    if not allow_future and parsed > today:
        return None, 'Дата не может быть в будущем'

    # Проверка на прошлое
    if not allow_past and parsed < today:
        return None, 'Дата не может быть в прошлом'

    # Проверка максимума дней в будущее
    if max_days_future is not None and parsed > today:
        max_future = today + timedelta(days=max_days_future)
        if parsed > max_future:
            return None, f'Дата не может быть более чем на {max_days_future} дней в будущем'

    # Проверка максимума дней в прошлое
    if max_days_past is not None and parsed < today:
        max_past = today - timedelta(days=max_days_past)
        if parsed < max_past:
            return None, f'Дата не может быть более чем на {max_days_past} дней в прошлом'

    return parsed, None


def parse_date_range(
    start_date_str: Optional[str],
    end_date_str: Optional[str],
    required: bool = False,
    max_range_days: Optional[int] = 365,
) -> Tuple[Optional[date], Optional[date], Optional[str]]:
    """
    Парсит диапазон дат.

    Args:
        start_date_str: Начальная дата (YYYY-MM-DD)
        end_date_str: Конечная дата (YYYY-MM-DD)
        required: Обе даты обязательны
        max_range_days: Максимальный размер диапазона в днях

    Returns:
        Tuple[Optional[date], Optional[date], Optional[str]]:
        (start_date, end_date, error_message)
    """
    # Парсим обе даты
    start_date, start_error = parse_date(start_date_str, required=required)
    if start_error:
        return None, None, f'Начальная дата: {start_error}'

    end_date, end_error = parse_date(end_date_str, required=required)
    if end_error:
        return None, None, f'Конечная дата: {end_error}'

    # Если обе пустые — ок
    if start_date is None and end_date is None:
        return None, None, None

    # Если одна пустая, другая нет
    if start_date is None or end_date is None:
        return None, None, 'Укажите обе даты диапазона'

    # Проверка порядка
    if start_date > end_date:
        return None, None, 'Начальная дата не может быть позже конечной'

    # Проверка размера диапазона
    if max_range_days is not None:
        range_days = (end_date - start_date).days
        if range_days > max_range_days:
            return None, None, f'Диапазон не может превышать {max_range_days} дней'

    return start_date, end_date, None


def parse_year_month(
    year: Optional[Union[int, str]],
    month: Optional[Union[int, str]],
    required: bool = False,
) -> Tuple[Optional[int], Optional[int], Optional[str]]:
    """
    Парсит и валидирует год и месяц.

    Returns:
        Tuple[Optional[int], Optional[int], Optional[str]]:
        (year, month, error_message)
    """
    # Пустые значения
    if year is None and month is None:
        if required:
            return None, None, 'Укажите год и месяц'
        return None, None, None

    # Если указан один без другого
    if year is None or month is None:
        return None, None, 'Укажите и год, и месяц'

    # Парсим год
    try:
        year_int = int(year)
    except (ValueError, TypeError):
        return None, None, 'Год должен быть числом'

    # Парсим месяц
    try:
        month_int = int(month)
    except (ValueError, TypeError):
        return None, None, 'Месяц должен быть числом'

    # Валидация года
    if year_int < 1900 or year_int > 2100:
        return None, None, 'Год должен быть между 1900 и 2100'

    # Валидация месяца
    if month_int < 1 or month_int > 12:
        return None, None, 'Месяц должен быть от 1 до 12'

    return year_int, month_int, None
