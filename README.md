<div align="center">

<img src="https://korolevst.supertest.beast-inside.kz/foodtrack_api/logo" alt="FoodTrack Logo" width="120" />

# FoodTrack

### Snap it. Track it.

**Интеллектуальная система анализа рациона и автоматического учёта КБЖУ**

Сфотографируй еду — получи полный расклад по калориям и нутриентам

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.1-000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-purple?style=for-the-badge)](https://ultralytics.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## Что умеет FoodTrack?

<table>
<tr>
<td width="50%">

### Распознавание еды по фото
YOLOv8 модель определяет блюдо на фотографии и автоматически подтягивает данные о калорийности и БЖУ через FatSecret API

### Дневник питания
Ведение ежедневного журнала приёмов пищи с детальной статистикой по калориям, белкам, жирам и углеводам

### Аналитика и прогресс
Графики за неделю/месяц, трекинг веса, стрик-система для мотивации, отслеживание достижения целей

</td>
<td width="50%">

### Группы
Совместный трекинг с семьёй, друзьями или командой. Групповая лента, приглашения, общая статистика

### Виртуальный холодильник
Учёт продуктов дома. Возможность поделиться излишками с пользователями поблизости через карту (радиус 1 км)

### Рецепты и советы
Подборка рецептов с фотографиями и персонализированные рекомендации по питанию

</td>
</tr>
</table>

---

## Архитектура проекта

```
FoodTrack/
├── foodtrack/          React 19 — веб-приложение (PWA)
├── backend/            Flask — REST API, авторизация, бизнес-логика
├── predicts/           FastAPI — ML-сервис распознавания еды (YOLOv8)
├── FoodTrackIoS/       iOS-приложение
└── android/            Android-приложение
```

<table>
<tr>
<th>Сервис</th>
<th>Технологии</th>
<th>Порт</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React 19, Tailwind CSS, Zustand, React Router 7, Recharts, Framer Motion</td>
<td><code>3000</code></td>
</tr>
<tr>
<td><strong>Backend API</strong></td>
<td>Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Migrate, Authlib</td>
<td><code>5252</code></td>
</tr>
<tr>
<td><strong>ML Service</strong></td>
<td>FastAPI, YOLOv8, PyTorch, OpenCV, FatSecret API</td>
<td><code>8000</code></td>
</tr>
</table>

---

## Быстрый старт

### Требования

- **Node.js** 20.x / npm 10.x
- **Python** 3.11+

### Frontend

```bash
cd FoodTrack/foodtrack
npm install
npm start
```

Приложение запустится на `http://localhost:3000`

Создайте `.env` файл:
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

Создайте `.env` файл:
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

Запуск:
```bash
flask db upgrade
flask run --port 5252
```

### ML-сервис

```bash
cd FoodTrack/predicts
python -m venv venv
source venv/bin/activate
pip install -r requirements.docker.txt
```

Создайте `.env` файл:
```env
FATSECRET_CLIENT_ID=your-client-id
FATSECRET_CLIENT_SECRET=your-client-secret
```

Запуск:
```bash
uvicorn app:app --port 8000
```

### Docker

```bash
# Backend
docker build -t foodtrack-api ./FoodTrack/backend
docker run -p 5252:5252 foodtrack-api

# ML Service
docker build -t foodtrack-ml ./FoodTrack/predicts
docker run -p 8000:8000 foodtrack-ml
```

---

## API Reference

### Backend API (`/api`)

| Группа | Эндпоинты | Описание |
|--------|-----------|----------|
| `/api/auth` | register, login, refresh, me, profile | Регистрация и JWT-авторизация |
| `/api/meals` | CRUD, copy, today | Управление приёмами пищи |
| `/api/water` | CRUD | Трекинг воды |
| `/api/analytics` | daily, weekly, monthly, streak | Статистика и аналитика |
| `/api/goals` | CRUD, weight | Цели и трекинг веса |
| `/api/progress` | measurements, photos | Замеры и фото прогресса |
| `/api/groups` | CRUD, invite, members, feed | Группы и приглашения |
| `/api/fridge` | CRUD, expiring-soon, share | Виртуальный холодильник |
| `/api/recipes` | list, details | Рецепты |
| `/api/tips` | list | Советы по питанию |

### ML Service

| Эндпоинт | Описание |
|----------|----------|
| `POST /predict` | Полный анализ фото (класс, уверенность, top-предсказания) |
| `POST /predict/simple` | Быстрый анализ |
| `POST /predict/with-nutrition` | Анализ + данные о калорийности |
| `GET /nutrition/{food_name}` | Информация о нутриентах по названию |

---

## Технологии

<table>
<tr>
<td align="center" width="33%">

**Frontend**

React 19 • React Router 7 • Zustand • Tailwind CSS • Framer Motion • Recharts • React Hook Form + Zod • Leaflet • Axios • Lucide Icons • date-fns

</td>
<td align="center" width="33%">

**Backend**

Flask • SQLAlchemy • Flask-JWT-Extended • Flask-Migrate • Authlib • PostgreSQL / SQLite • WebSocket

</td>
<td align="center" width="33%">

**ML / AI**

FastAPI • YOLOv8 (Ultralytics) • PyTorch • OpenCV • FatSecret API

</td>
</tr>
</table>

---

<div align="center">

## Команда разработчиков

<table>
<tr>
<td align="center">
<strong>Pinigin Artyom</strong><br/>
<a href="https://t.me/ArtemSogi">@ArtemSogi</a>
</td>
<td align="center">
<strong>Efremov Ivan</strong><br/>
<a href="https://t.me/Vanek3222">@Vanek3222</a>
</td>
<td align="center">
<strong>Zhumabek Alikhan</strong><br/>
<a href="https://t.me/Gaklelk">@Gaklelk</a>
</td>
</tr>
</table>

---

**FoodTrack** — Snap it. Track it.

*2025*

</div>
