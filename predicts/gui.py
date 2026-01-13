import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import os
from use_model import detect_food
from nutrition import get_nutrition_info, format_nutrition_info


class FoodDetectionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CalSnap - Распознавание еды")
        self.root.geometry("1200x700")
        self.root.resizable(True, True)

        self.current_image_path = None
        self.photo_image = None
        self.images_folder = "imgs"
        self.image_list = []

        self.setup_ui()
        self.load_images_from_folder()

    def setup_ui(self):
        # Заголовок
        title_frame = ttk.Frame(self.root, padding="10")
        title_frame.pack(fill=tk.X)

        title_label = ttk.Label(
            title_frame,
            text="CalSnap - Определение блюд",
            font=("Arial", 20, "bold")
        )
        title_label.pack()

        # Кнопки управления
        button_frame = ttk.Frame(self.root, padding="10")
        button_frame.pack(fill=tk.X)

        self.load_button = ttk.Button(
            button_frame,
            text="Загрузить изображение",
            command=self.load_image
        )
        self.load_button.pack(side=tk.LEFT, padx=5)

        self.analyze_button = ttk.Button(
            button_frame,
            text="Анализировать",
            command=self.analyze_image,
            state=tk.DISABLED
        )
        self.analyze_button.pack(side=tk.LEFT, padx=5)

        self.clear_button = ttk.Button(
            button_frame,
            text="Очистить",
            command=self.clear_results
        )
        self.clear_button.pack(side=tk.LEFT, padx=5)

        # Основной контейнер с разделением
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Левая часть - список изображений
        list_frame = ttk.LabelFrame(main_frame, text="Изображения из папки imgs", padding="10")
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 5))

        # Список изображений
        list_scroll = ttk.Scrollbar(list_frame)
        list_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.images_listbox = tk.Listbox(
            list_frame,
            width=25,
            yscrollcommand=list_scroll.set,
            font=("Arial", 10)
        )
        self.images_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        list_scroll.config(command=self.images_listbox.yview)

        # Привязываем событие выбора
        self.images_listbox.bind('<<ListboxSelect>>', self.on_image_select)

        # Кнопка обновить список
        refresh_button = ttk.Button(
            list_frame,
            text="Обновить список",
            command=self.load_images_from_folder
        )
        refresh_button.pack(fill=tk.X, pady=(5, 0))

        # Средняя часть - изображение
        center_frame = ttk.LabelFrame(main_frame, text="Изображение", padding="10")
        center_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)

        self.image_label = ttk.Label(
            center_frame,
            text="Выберите изображение\nиз списка или загрузите файл",
            anchor=tk.CENTER,
            background="#f0f0f0",
            relief=tk.SOLID,
            borderwidth=1
        )
        self.image_label.pack(fill=tk.BOTH, expand=True)

        # Правая часть - результаты
        right_frame = ttk.LabelFrame(main_frame, text="Результаты", padding="10")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))

        # Основной результат
        result_main_frame = ttk.Frame(right_frame)
        result_main_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(result_main_frame, text="Обнаружено:", font=("Arial", 12, "bold")).pack(anchor=tk.W)
        self.main_result_label = ttk.Label(
            result_main_frame,
            text="-",
            font=("Arial", 16),
            foreground="#2e7d32"
        )
        self.main_result_label.pack(anchor=tk.W, pady=5)

        ttk.Label(result_main_frame, text="Уверенность:", font=("Arial", 10)).pack(anchor=tk.W)
        self.confidence_label = ttk.Label(
            result_main_frame,
            text="-",
            font=("Arial", 12)
        )
        self.confidence_label.pack(anchor=tk.W)

        # Прогресс бар для уверенности
        self.confidence_progress = ttk.Progressbar(
            result_main_frame,
            length=200,
            mode='determinate'
        )
        self.confidence_progress.pack(fill=tk.X, pady=5)

        # Разделитель
        ttk.Separator(right_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=10)

        # Информация о калориях
        nutrition_frame = ttk.Frame(right_frame)
        nutrition_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(nutrition_frame, text="Пищевая ценность:", font=("Arial", 11, "bold")).pack(anchor=tk.W)
        self.nutrition_text = tk.Text(
            nutrition_frame,
            height=6,
            wrap=tk.WORD,
            font=("Arial", 9),
            state=tk.DISABLED,
            background="#f9f9f9"
        )
        self.nutrition_text.pack(fill=tk.X, pady=5)

        # Разделитель
        ttk.Separator(right_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=10)

        # Топ-5 предсказаний
        ttk.Label(right_frame, text="Топ-5 предсказаний:", font=("Arial", 11, "bold")).pack(anchor=tk.W)

        # Фрейм с прокруткой для результатов
        predictions_frame = ttk.Frame(right_frame)
        predictions_frame.pack(fill=tk.BOTH, expand=True)

        self.predictions_text = tk.Text(
            predictions_frame,
            height=10,
            wrap=tk.WORD,
            font=("Arial", 10),
            state=tk.DISABLED
        )
        self.predictions_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(predictions_frame, command=self.predictions_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.predictions_text.config(yscrollcommand=scrollbar.set)

        # Статус бар
        self.status_label = ttk.Label(
            self.root,
            text="Готов к работе",
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)

    def load_image(self):
        file_path = filedialog.askopenfilename(
            title="Выберите изображение",
            filetypes=[
                ("Изображения", "*.jpg *.jpeg *.png *.bmp *.webp"),
                ("Все файлы", "*.*")
            ]
        )

        if file_path:
            try:
                self.current_image_path = file_path
                self.display_image(file_path)
                self.analyze_button.config(state=tk.NORMAL)
                self.status_label.config(text=f"Загружено: {os.path.basename(file_path)}")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось загрузить изображение:\n{str(e)}")

    def display_image(self, image_path):
        try:
            # Открываем и изменяем размер изображения
            image = Image.open(image_path)

            # Получаем размер области для изображения
            label_width = self.image_label.winfo_width()
            label_height = self.image_label.winfo_height()

            # Если размеры еще не определены, используем значения по умолчанию
            if label_width <= 1:
                label_width = 500
            if label_height <= 1:
                label_height = 550

            # Пропорционально масштабируем изображение
            image.thumbnail((label_width - 20, label_height - 20), Image.Resampling.LANCZOS)

            # Конвертируем для tkinter
            self.photo_image = ImageTk.PhotoImage(image)
            self.image_label.config(image=self.photo_image, text="")

        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось отобразить изображение:\n{str(e)}")

    def analyze_image(self):
        if not self.current_image_path:
            messagebox.showwarning("Предупреждение", "Сначала загрузите изображение!")
            return

        try:
            self.status_label.config(text="Анализ изображения...")
            self.root.update()

            # Анализируем изображение
            result = detect_food(self.current_image_path, top_n=5)

            # Отображаем результаты
            self.display_results(result)

            self.status_label.config(text="Анализ завершен")

        except Exception as e:
            messagebox.showerror("Ошибка", f"Ошибка при анализе изображения:\n{str(e)}")
            self.status_label.config(text="Ошибка анализа")

    def display_results(self, result):
        # Основной результат
        self.main_result_label.config(text=result['top_prediction'])
        self.confidence_label.config(text=f"{result['confidence']:.2f}%")

        # Прогресс бар
        self.confidence_progress['value'] = result['confidence']

        # Получаем информацию о питательности
        self.nutrition_text.config(state=tk.NORMAL)
        self.nutrition_text.delete(1.0, tk.END)
        self.nutrition_text.insert(tk.END, "Загрузка информации о калориях...")
        self.nutrition_text.config(state=tk.DISABLED)
        self.root.update()

        # Запрашиваем информацию о калориях
        nutrition_data = get_nutrition_info(result['top_prediction'])
        nutrition_info = format_nutrition_info(nutrition_data)

        # Отображаем информацию о питательности
        self.nutrition_text.config(state=tk.NORMAL)
        self.nutrition_text.delete(1.0, tk.END)
        self.nutrition_text.insert(tk.END, nutrition_info)
        self.nutrition_text.config(state=tk.DISABLED)

        # Топ-5 предсказаний
        self.predictions_text.config(state=tk.NORMAL)
        self.predictions_text.delete(1.0, tk.END)

        for i, (name, conf) in enumerate(result['top_predictions'], 1):
            self.predictions_text.insert(tk.END, f"{i}. {name}\n")
            self.predictions_text.insert(tk.END, f"   Уверенность: {conf:.2f}%\n\n")

        self.predictions_text.config(state=tk.DISABLED)

    def clear_results(self):
        self.current_image_path = None
        self.photo_image = None

        self.image_label.config(
            image="",
            text="Выберите изображение\nиз списка или загрузите файл"
        )

        self.main_result_label.config(text="-")
        self.confidence_label.config(text="-")
        self.confidence_progress['value'] = 0

        self.nutrition_text.config(state=tk.NORMAL)
        self.nutrition_text.delete(1.0, tk.END)
        self.nutrition_text.config(state=tk.DISABLED)

        self.predictions_text.config(state=tk.NORMAL)
        self.predictions_text.delete(1.0, tk.END)
        self.predictions_text.config(state=tk.DISABLED)

        self.analyze_button.config(state=tk.DISABLED)
        self.status_label.config(text="Готов к работе")

    def load_images_from_folder(self):
        """Загружает список изображений из папки imgs"""
        self.images_listbox.delete(0, tk.END)
        self.image_list = []

        if not os.path.exists(self.images_folder):
            os.makedirs(self.images_folder)
            self.status_label.config(text=f"Создана папка {self.images_folder}")
            return

        # Поддерживаемые форматы
        supported_formats = ('.jpg', '.jpeg', '.png', '.bmp', '.webp', '.gif')

        try:
            files = os.listdir(self.images_folder)
            for file in sorted(files):
                if file.lower().endswith(supported_formats):
                    full_path = os.path.join(self.images_folder, file)
                    self.image_list.append(full_path)
                    self.images_listbox.insert(tk.END, file)

            if self.image_list:
                self.status_label.config(text=f"Загружено {len(self.image_list)} изображений")
            else:
                self.status_label.config(text="Папка imgs пуста")

        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить список изображений:\n{str(e)}")

    def on_image_select(self, event):
        """Обработчик выбора изображения из списка"""
        selection = self.images_listbox.curselection()
        if selection:
            index = selection[0]
            image_path = self.image_list[index]

            try:
                self.current_image_path = image_path
                self.display_image(image_path)
                self.analyze_button.config(state=tk.NORMAL)
                self.status_label.config(text=f"Выбрано: {os.path.basename(image_path)}")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось загрузить изображение:\n{str(e)}")


def main():
    root = tk.Tk()
    app = FoodDetectionApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
