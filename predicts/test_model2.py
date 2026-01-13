"""
Тестирование структуры результатов model2.pt
"""
from ultralytics import YOLO

model = YOLO('model/model2.pt')
results = model('imgs/apple.png', verbose=False)

print("Анализ структуры результатов:")
print(f"Тип results: {type(results)}")
print(f"Длина results: {len(results)}")

result = results[0]
print(f"\nТип result: {type(result)}")
print(f"Атрибуты result: {dir(result)}")

# Проверим различные атрибуты
print(f"\nHas 'probs': {hasattr(result, 'probs')}")
print(f"Probs value: {result.probs}")

print(f"\nHas 'boxes': {hasattr(result, 'boxes')}")
if hasattr(result, 'boxes') and result.boxes is not None:
    print(f"Boxes: {result.boxes}")

print(f"\nHas 'names': {hasattr(result, 'names')}")
if hasattr(result, 'names'):
    print(f"Names (first 10): {list(result.names.items())[:10]}")

# Посмотрим на сам результат
print(f"\nResult summary: {result}")
