from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Tuple, Optional, Dict
import os
import shutil
from pathlib import Path
from use_model import detect_food, detect_food_simple
from nutrition import get_nutrition_info
from food_name_ru import get_russian_name

app = FastAPI(
    title="CalSnap API",
    description="API для распознавания еды на изображениях",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://food-track-beta.vercel.app",
        "https://foodtrack.vercel.app",
        "http://localhost:3000",
        "http://localhost",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Папка для временных загрузок
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class PredictionResponse(BaseModel):
    top_prediction: str
    confidence: float
    top_predictions: List[Tuple[str, float]]


class SimplePredictionResponse(BaseModel):
    product: str
    confidence: float


class NutritionResponse(BaseModel):
    title: str
    calories: float
    protein: float
    fat: float
    carbs: float
    calories_unit: str
    protein_unit: str
    fat_unit: str
    carbs_unit: str
    error: Optional[str] = None


class PredictionWithNutritionResponse(BaseModel):
    top_prediction: Optional[str] = None
    top_prediction_ru: Optional[str] = None
    confidence: float = 0.0
    top_predictions: List[Tuple[str, float]] = []
    top_predictions_ru: List[Tuple[str, float]] = []
    nutrition: Optional[Dict] = None


@app.get("/")
async def root():
    """Главная страница API"""
    return {
        "message": "CalSnap API",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Полный анализ изображения",
            "/predict/simple": "POST - Простой анализ изображения",
            "/predict/with-nutrition": "POST - Анализ изображения с информацией о калориях",
            "/nutrition/{food_name}": "GET - Получить информацию о калориях по названию продукта",
            "/health": "GET - Проверка работоспособности"
        }
    }


@app.get("/health")
async def health_check():
    """Проверка работоспособности API"""
    return {"status": "healthy", "message": "API работает нормально"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Анализирует изображение и возвращает полную информацию о распознанной еде

    Args:
        file: Изображение для анализа (jpg, jpeg, png, bmp, webp)

    Returns:
        JSON с результатами распознавания:
        - top_prediction: название продукта с максимальной уверенностью
        - confidence: уверенность в процентах (0-100)
        - top_predictions: список топ-5 предсказаний
    """
    # Проверка типа файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Файл должен быть изображением"
        )

    # Сохраняем файл временно
    temp_file_path = UPLOAD_DIR / file.filename

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Анализируем изображение
        result = detect_food(str(temp_file_path), top_n=5)

        return PredictionResponse(
            top_prediction=result['top_prediction'],
            confidence=result['confidence'],
            top_predictions=result['top_predictions']
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при анализе изображения: {str(e)}"
        )

    finally:
        # Удаляем временный файл
        if temp_file_path.exists():
            temp_file_path.unlink()


@app.post("/predict/simple", response_model=SimplePredictionResponse)
async def predict_simple(file: UploadFile = File(...)):
    """
    Упрощенный анализ изображения - возвращает только название продукта и уверенность

    Args:
        file: Изображение для анализа (jpg, jpeg, png, bmp, webp)

    Returns:
        JSON с результатами:
        - product: название продукта
        - confidence: уверенность в процентах
    """
    # Проверка типа файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Файл должен быть изображением"
        )

    # Сохраняем файл временно
    temp_file_path = UPLOAD_DIR / file.filename

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Анализируем изображение
        product, confidence = detect_food_simple(str(temp_file_path))

        return SimplePredictionResponse(
            product=product,
            confidence=confidence
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при анализе изображения: {str(e)}"
        )

    finally:
        # Удаляем временный файл
        if temp_file_path.exists():
            temp_file_path.unlink()


@app.post("/predict/with-nutrition", response_model=PredictionWithNutritionResponse)
async def predict_with_nutrition(file: UploadFile = File(...)):
    """
    Анализирует изображение и возвращает информацию о распознанной еде вместе с данными о калориях

    Args:
        file: Изображение для анализа (jpg, jpeg, png, bmp, webp)

    Returns:
        JSON с результатами распознавания и информацией о питательности:
        - top_prediction: название продукта с максимальной уверенностью
        - confidence: уверенность в процентах (0-100)
        - top_predictions: список топ-5 предсказаний
        - nutrition: информация о калориях и питательных веществах
    """
    # Проверка типа файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Файл должен быть изображением"
        )

    # Сохраняем файл временно
    temp_file_path = UPLOAD_DIR / file.filename

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Анализируем изображение
        result = detect_food(str(temp_file_path), top_n=5)

        # Проверяем, нашла ли модель что-то
        if not result['top_prediction']:
            return PredictionWithNutritionResponse(
                top_prediction=None,
                top_prediction_ru=None,
                confidence=0.0,
                top_predictions=[],
                top_predictions_ru=[],
                nutrition=None
            )

        # Получаем информацию о питательности
        nutrition_data = get_nutrition_info(result['top_prediction'])
        
        # Проверяем, есть ли ошибка при получении питательной информации
        if nutrition_data and 'error' in nutrition_data:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Nutrition data error: {nutrition_data['error']}")
            nutrition_data = None

        # Переводим названия на русский
        top_prediction_ru = get_russian_name(result['top_prediction'])
        top_predictions_ru = [
            (get_russian_name(name), conf)
            for name, conf in result['top_predictions']
        ]

        return PredictionWithNutritionResponse(
            top_prediction=result['top_prediction'],
            top_prediction_ru=top_prediction_ru,
            confidence=result['confidence'],
            top_predictions=result['top_predictions'],
            top_predictions_ru=top_predictions_ru,
            nutrition=nutrition_data
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при анализе изображения: {str(e)}"
        )

    finally:
        # Удаляем временный файл
        if temp_file_path.exists():
            temp_file_path.unlink()


@app.get("/nutrition/{food_name}")
async def get_nutrition(food_name: str):
    """
    Получает информацию о калориях и питательных веществах по названию продукта

    Args:
        food_name: Название продукта или блюда

    Returns:
        JSON с информацией о питательности
    """
    try:
        nutrition_data = get_nutrition_info(food_name)

        if 'error' in nutrition_data:
            raise HTTPException(
                status_code=400,
                detail=nutrition_data['error']
            )

        return nutrition_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении информации о питании: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
