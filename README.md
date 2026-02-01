<div align="center">

# 🍽️ FoodTrack

### Snap it. Track it.

Интеллектуальная система анализа рациона и автоматического учёта КБЖУ.
Сфотографируй еду — получи полный расклад по калориям и нутриентам.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000?logo=flask&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-ultralytics-purple)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)

</div>

---

## Возможности

**Распознавание еды по фото** — YOLOv8 модель определяет блюдо на фотографии и автоматически подтягивает данные о калорийности и БЖУ через FatSecret API.

**Дневник питания** — ведение ежедневного журнала приёмов пищи с детальной статистикой по калориям, белкам, жирам и углеводам.

**Аналитика и прогресс** — графики за неделю/месяц, трекинг веса, стрик-система для мотивации, отслеживание достижения целей.

**Группы** — совместный трекинг с семьёй, друзьями или командой. Групповая лента, приглашения, общая статистика.

**Виртуальный холодильник** — учёт продуктов дома. Возможность поделиться излишками с пользователями поблизости через карту (Leaflet, радиус 1 км).

**Рецепты и советы** — подборка рецептов с фотографиями и персонализированные рекомендации по питанию.

**Онбординг** — пошаговая настройка профиля: возраст, рост, вес, цели, уровень активности, частота приёмов пищи.

---

## Архитектура

```
FoodTrack/
├── foodtrack/          React 19 · веб-приложение (PWA)
├── backend/            Flask · REST API, авторизация, бизнес-логика
├── predicts/           FastAPI · ML-сервис распознавания еды (YOLOv8)
├── FoodTrackIoS/       iOS-приложение
└── android/            Android-приложение
```

| Сервис | Стек | Порт |
|--------|------|------|
| **Frontend** | React 19, Tailwind CSS, Zustand, React Router 7, Recharts, Framer Motion | `3000` |
| **Backend API** | Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Migrate, Authlib | `5252` |
| **ML Service** | FastAPI, YOLOv8, PyTorch, OpenCV, FatSecret API | `8000` |

---

## Быстрый старт

### Требования

- Node.js 20.x / npm 10.x
- Python 3.11+

### Frontend

```bash
cd FoodTrack/foodtrack
npm install
npm start
```

Приложение запустится на `http://localhost:3000`.

Для указания адреса API создайте `.env`:

```env
REACT_APP_API_URL=http://localhost:5252/api
```

### Backend

```bash
cd FoodTrack/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Создайте `.env` в папке `backend`:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

Запуск:

```bash
flask db upgrade
flask run --port 5252
```

### ML-сервис (распознавание еды)

```bash
cd FoodTrack/predicts
python -m venv venv
source venv/bin/activate
pip install -r requirements.docker.txt
```

Создайте `.env` в папке `predicts`:

```env
FATSECRET_CLIENT_ID=your-client-id
FATSECRET_CLIENT_SECRET=your-client-secret
```

Запуск:

```bash
uvicorn app:app --port 8000
```

### Docker

Для каждого сервиса есть `Dockerfile`:

```bash
# Backend
docker build -t foodtrack-api ./FoodTrack/backend
docker run -p 5252:5252 foodtrack-api

# ML Service
docker build -t foodtrack-ml ./FoodTrack/predicts
docker run -p 8000:8000 foodtrack-ml
```

---

## API

### Backend (`/api`)

| Группа | Эндпоинты | Описание |
|--------|-----------|----------|
| `/api/auth` | register, login, refresh, me, profile | Регистрация, JWT-авторизация, OAuth |
| `/api/meals` | CRUD, copy, today | Управление приёмами пищи |
| `/api/analytics` | daily, weekly, monthly, nutrition | Статистика и аналитика |
| `/api/goals` | CRUD, weight | Цели и трекинг веса |
| `/api/progress` | overview, weight-chart, calories-chart | Графики прогресса |
| `/api/groups` | CRUD, invite, members | Группы и приглашения |
| `/api/recipes` | list, details | Рецепты |
| `/api/tips` | list | Советы по питанию |

### ML Service

| Эндпоинт | Описание |
|-----------|----------|
| `POST /predict` | Полный анализ фото (класс, уверенность, top-предсказания) |
| `POST /predict/simple` | Быстрый анализ |
| `POST /predict/with-nutrition` | Анализ + данные о калорийности |
| `GET /nutrition/{food_name}` | Информация о нутриентах по названию |

---

## Стек технологий

**Frontend:** React 19 · React Router 7 · Zustand · Tailwind CSS · Framer Motion · Recharts · React Hook Form + Zod · Leaflet · Axios · Lucide Icons

**Backend:** Flask · SQLAlchemy · Flask-JWT-Extended · Flask-Migrate (Alembic) · Authlib · PostgreSQL / SQLite

**ML:** FastAPI · YOLOv8 (Ultralytics) · PyTorch · OpenCV · FatSecret API

---

<div align="center">

**FoodTrack** — Snap it. Track it.

</div>
