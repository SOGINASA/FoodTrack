from ultralytics import YOLO
from PIL import Image
from typing import Dict, List, Tuple
import torch

# Загрузка модели (глобально, чтобы не загружать каждый раз)
model = YOLO('model/model2.pt')


def detect_food(image_path: str, top_n: int = 5) -> Dict:
    """
    Определяет продукт/блюдо на изображении

    Args:
        image_path: Путь к изображению
        top_n: Количество топ предсказаний (по умолчанию 5)

    Returns:
        Dict с результатами:
        {
            'top_prediction': str - название продукта с максимальной уверенностью,
            'confidence': float - уверенность в процентах (0-100),
            'top_predictions': List[Tuple[str, float]] - список (название, уверенность%)
        }
    """
    results = model(image_path, verbose=False)

    result_dict = {
        'top_prediction': None,
        'confidence': 0.0,
        'top_predictions': []
    }

    for result in results:
        # Проверяем, это модель классификации или детекции
        if hasattr(result, 'probs') and result.probs is not None:
            # Модель классификации (старая логика)
            top_indices = result.probs.top5[:top_n] if top_n <= 5 else result.probs.top5
            top_conf = result.probs.top5conf.tolist()[:top_n] if top_n <= 5 else result.probs.top5conf.tolist()

            predictions = []
            for idx, conf in zip(top_indices, top_conf):
                class_name = model.names[idx]
                confidence_percent = conf * 100
                predictions.append((class_name, confidence_percent))

            if predictions:
                result_dict['top_prediction'] = predictions[0][0]
                result_dict['confidence'] = predictions[0][1]
                result_dict['top_predictions'] = predictions

        elif hasattr(result, 'boxes') and result.boxes is not None and len(result.boxes) > 0:
            # Модель детекции объектов (model2.pt)
            boxes = result.boxes

            # Получаем все обнаруженные объекты с их уверенностью
            detections = []
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                conf = boxes.conf[i].item()
                class_name = model.names[cls_id]
                confidence_percent = conf * 100
                detections.append((class_name, confidence_percent))

            # Сортируем по уверенности (от большей к меньшей)
            detections.sort(key=lambda x: x[1], reverse=True)

            # Берем топ N
            top_detections = detections[:top_n]

            if top_detections:
                result_dict['top_prediction'] = top_detections[0][0]
                result_dict['confidence'] = top_detections[0][1]
                result_dict['top_predictions'] = top_detections

    return result_dict


def detect_food_simple(image_path: str) -> Tuple[str, float]:
    """
    Упрощенная версия - возвращает только название продукта и уверенность

    Args:
        image_path: Путь к изображению

    Returns:
        Tuple (название_продукта, уверенность_в_процентах)
    """
    result = detect_food(image_path)
    return result['top_prediction'], result['confidence']


# Пример использования
if __name__ == "__main__":
    image_path = 'imgs/real_mango.webp'
    print(detect_food(image_path))