"""
Скрипт для анализа модели YOLO
"""
from ultralytics import YOLO

# Загружаем обе модели для сравнения
print("=" * 60)
print("АНАЛИЗ ТЕКУЩЕЙ МОДЕЛИ (model.pt)")
print("=" * 60)
model1 = YOLO('model/model.pt')
print(f"\nКоличество классов: {len(model1.names)}")
print(f"\nСписок классов:")
for idx, name in model1.names.items():
    print(f"  {idx}: {name}")

print("\n" + "=" * 60)
print("АНАЛИЗ НОВОЙ МОДЕЛИ (model2.pt)")
print("=" * 60)
model2 = YOLO('model/model2.pt')
print(f"\nКоличество классов: {len(model2.names)}")
print(f"\nСписок классов:")
for idx, name in model2.names.items():
    print(f"  {idx}: {name}")

print("\n" + "=" * 60)
print("СРАВНЕНИЕ")
print("=" * 60)
print(f"model.pt:  {len(model1.names)} классов")
print(f"model2.pt: {len(model2.names)} классов")

# Найти различия
old_classes = set(model1.names.values())
new_classes = set(model2.names.values())

only_in_old = old_classes - new_classes
only_in_new = new_classes - old_classes
common = old_classes & new_classes

print(f"\nОбщих классов: {len(common)}")
print(f"Только в старой модели: {len(only_in_old)}")
if only_in_old:
    print(f"  {', '.join(sorted(only_in_old))}")

print(f"\nТолько в новой модели: {len(only_in_new)}")
if only_in_new:
    print(f"  {', '.join(sorted(only_in_new))}")
