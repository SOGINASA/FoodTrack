FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./

# Устанавливаем зависимости и gunicorn
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Копируем приложение
COPY . .

# Создаём папку для БД
RUN mkdir -p /app/database

EXPOSE 5252

CMD ["gunicorn", "-w", "4", "--threads", "10", "-b", "0.0.0.0:5252", "--timeout", "120", "app:app"]
