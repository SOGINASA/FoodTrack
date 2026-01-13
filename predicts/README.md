# Docker инструкция для CalSnap API

## Быстрый старт

### 1. Запуск приложения

**Production режим:**
```bash
docker-compose up -d
```

**Development режим (с hot-reload):**
```bash
docker-compose -f docker-compose.dev.yml up
```

### 2. Остановка приложения

```bash
docker-compose down
```

### 3. Просмотр логов

```bash
docker-compose logs -f
```

### 4. Перестроить образ

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Использование API

После запуска контейнера API будет доступен по адресу: **http://localhost:8000**

### Основные endpoints:

- **GET** `http://localhost:8000/` - Информация об API
- **GET** `http://localhost:8000/health` - Проверка работоспособности
- **POST** `http://localhost:8000/predict` - Полный анализ изображения
- **POST** `http://localhost:8000/predict/simple` - Простой анализ
- **POST** `http://localhost:8000/predict/with-nutrition` - Анализ с калориями
- **GET** `http://localhost:8000/nutrition/{food_name}` - Информация о калориях

### Интерактивная документация:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Примеры использования

### С помощью curl:

```bash
# Простой анализ изображения
curl -X POST "http://localhost:8000/predict/simple" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg"

# Получить информацию о калориях
curl -X GET "http://localhost:8000/nutrition/pizza" \
  -H "accept: application/json"
```

### С помощью Python:

```python
import requests

# Анализ изображения
url = "http://localhost:8000/predict/with-nutrition"
files = {"file": open("pizza.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())

# Получить информацию о калориях
url = "http://localhost:8000/nutrition/apple"
response = requests.get(url)
print(response.json())
```

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key
```

### Порты

По умолчанию используется порт **8000**. Чтобы изменить порт, отредактируйте `docker-compose.yml`:

```yaml
ports:
  - "9000:8000"  # Теперь API будет доступен на порту 9000
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs

# Проверить статус
docker-compose ps
```

### Проблемы с моделью

Убедитесь, что файл модели находится в папке `model/model.pt`

### Проблемы с памятью

Для больших моделей может потребоваться увеличить память Docker:
- Docker Desktop: Settings → Resources → Memory

### Очистка

```bash
# Удалить контейнер и образ
docker-compose down --rmi all

# Удалить volumes
docker-compose down -v

# Полная очистка Docker
docker system prune -a
```

## Production деплой

Для production рекомендуется:

1. Использовать `.env` файл с реальными API ключами
2. Настроить reverse proxy (nginx)
3. Использовать HTTPS
4. Настроить мониторинг и логирование
5. Ограничить ресурсы контейнера

Пример с ограничением ресурсов в `docker-compose.yml`:

```yaml
services:
  calsnap-api:
    # ... другие настройки
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Структура проекта

```
CalSnap-AI/
├── app.py                 # FastAPI приложение
├── use_model.py          # Модуль для работы с моделью
├── nutrition.py          # Модуль для получения информации о калориях
├── model/
│   └── model.pt         # Обученная модель
├── Dockerfile           # Конфигурация Docker образа
├── docker-compose.yml   # Production конфигурация
├── docker-compose.dev.yml # Development конфигурация
├── .dockerignore        # Игнорируемые файлы
├── .env                 # Переменные окружения (не в git)
└── requirements.txt     # Python зависимости
```
