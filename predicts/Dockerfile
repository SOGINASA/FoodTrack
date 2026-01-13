# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости для OpenCV и других библиотек
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements для Docker (без Windows-зависимостей)
COPY requirements.docker.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.docker.txt

# Копируем весь проект
COPY . .

# Создаем директорию для временных загрузок
RUN mkdir -p temp_uploads

# Открываем порт 8000
EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
