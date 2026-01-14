# Инструкция по пересборке Docker контейнера

## Проблема
В Docker контейнере отсутствует зависимость `python-multipart`, необходимая для работы FastAPI с загрузкой файлов.

## Решение

### 1. Остановите текущий контейнер
```bash
docker-compose down
```

### 2. Пересоберите образ (без кеша)
```bash
docker-compose build --no-cache
```

### 3. Запустите новый контейнер
```bash
docker-compose up -d
```

### 4. Проверьте логи
```bash
docker-compose logs -f
```

## Что было исправлено

1. ✅ Добавлен `python-multipart==0.0.9` в requirements.docker.txt
2. ✅ Создан файл food_name_mapper.py для маппинга названий
3. ✅ Обновлен nutrition.py для использования маппера
4. ✅ Обновлен use_model.py для работы с model2.pt

## Быстрая команда (все в одной строке)
```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## Проверка работоспособности

После запуска контейнера проверьте:

1. **Главная страница:**
   ```bash
   curl http://localhost:8000/
   ```

2. **Health check:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Swagger документация:**
   Откройте в браузере: http://localhost:8000/docs

4. **Тест загрузки изображения:**
   ```bash
   curl -X POST "http://localhost:8000/predict/simple" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@imgs/apple.png"
   ```
