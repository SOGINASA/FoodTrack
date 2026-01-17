import SwiftUI

struct AnalyzeView: View {
    @State private var showCamera = false
    @State private var capturedImage: UIImage? = nil

    @State private var analysis: MockFoodAnalysis? = nil
    @State private var showResultSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Анализ по фото",
                        subtitle: "Сфотографируйте блюдо — мы покажем оценку калорий и БЖУ. Это не лаборатория, но для ежедневного контроля — очень рабочий инструмент."
                    )
                    .padding(.top, 10)

                    // Фото-блок
                    FTCard {
                        Text("Фото блюда")
                            .font(.system(size: 16, weight: .semibold))

                        ZStack {
                            RoundedRectangle(cornerRadius: 22)
                                .fill(Color.gray.opacity(0.10))
                                .frame(height: 240)

                            if let img = capturedImage {
                                Image(uiImage: img)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(height: 240)
                                    .clipShape(RoundedRectangle(cornerRadius: 22))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 22)
                                            .stroke(FTTheme.border, lineWidth: 1)
                                    )
                            } else {
                                VStack(spacing: 10) {
                                    Image(systemName: "camera")
                                        .font(.system(size: 34, weight: .semibold))
                                        .foregroundColor(.black.opacity(0.75))
                                    Text("Сделайте фото для анализа")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(.black.opacity(0.75))
                                    Text("Лучше при хорошем освещении и без сильных теней.")
                                        .font(.system(size: 12))
                                        .foregroundColor(FTTheme.muted)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, 20)
                                }
                            }

                            VStack {
                                Spacer()
                                HStack(spacing: 10) {
                                    if capturedImage != nil {
                                        Button {
                                            capturedImage = nil
                                            analysis = nil
                                        } label: {
                                            Text("Удалить")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(.black)
                                                .padding(.horizontal, 14)
                                                .padding(.vertical, 10)
                                                .background(Color.white.opacity(0.95))
                                                .cornerRadius(999)
                                                .overlay(RoundedRectangle(cornerRadius: 999).stroke(FTTheme.border, lineWidth: 1))
                                        }
                                    }

                                    Spacer()

                                    Button {
                                        showCamera = true
                                    } label: {
                                        Text(capturedImage == nil ? "Сделать фото" : "Переснять")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.white)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 10)
                                            .background(Color.black)
                                            .cornerRadius(999)
                                    }
                                }
                                .padding(14)
                            }
                        }

                        if capturedImage != nil {
                            PrimaryButton(title: "Проанализировать") {
                                analysis = MockFoodAnalysisStore.randomOne()
                                showResultSheet = true
                            }
                            .padding(.top, 10)

                            Text("Совет: если порция нестандартная, в будущем можно будет уточнить граммы — это сильно повышает точность.")
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)
                                .padding(.top, 6)
                        } else {
                            Text("Приватность: фото не публикуются. Сейчас это мок-анализ, но камера уже настоящая.")
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)
                                .padding(.top, 8)
                        }
                    }

                    // Мини-подсказки
                    FTCard {
                        Text("Как получить точнее")
                            .font(.system(size: 16, weight: .semibold))

                        TipRow(title: "Кадр целиком", text: "Блюдо полностью в кадре — гарнир и соус тоже видны.")
                        TipRow(title: "Чистый фон", text: "Лишние предметы мешают распознаванию.")
                        TipRow(title: "Один ракурс", text: "Сверху или под небольшим углом — самый стабильный вариант.")
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showCamera) {
            CameraPicker { image in
                // фото вставилось
                capturedImage = image

                // сразу выдаём рандомный результат + открываем меню
                analysis = MockFoodAnalysisStore.randomOne()
                showResultSheet = true
            }
            .ignoresSafeArea()
        }
        .sheet(isPresented: $showResultSheet) {
            if let analysis {
                AnalysisResultSheet(
                    image: capturedImage,
                    analysis: analysis,
                    onRetake: {
                        showResultSheet = false
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                            showCamera = true
                        }
                    },
                    onClose: {
                        showResultSheet = false
                    },
                    onAddToDiary: {
                        // пока мок — позже подключим настоящий дневник
                        showResultSheet = false
                    }
                )
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            } else {
                Text("Нет данных")
                    .padding()
            }
        }
    }
}

// MARK: - Sheet UI

private struct AnalysisResultSheet: View {
    let image: UIImage?
    let analysis: MockFoodAnalysis

    let onRetake: () -> Void
    let onClose: () -> Void
    let onAddToDiary: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {

            HStack {
                Text("Результат")
                    .font(.system(size: 18, weight: .semibold))
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.gray.opacity(0.7))
                }
            }

            if let img = image {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 120)
                    .clipped()
                    .cornerRadius(18)
                    .overlay(RoundedRectangle(cornerRadius: 18).stroke(FTTheme.border, lineWidth: 1))
            }

            Text(analysis.title)
                .font(.system(size: 22, weight: .semibold))

            Text("Порция: \(analysis.portionHint) • Уверенность: \(analysis.confidence)%")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            FTCard {
                ResultRow(label: "Калории", value: "\(analysis.kcal) ккал", hint: "оценка порции")
                ResultRow(label: "Белки", value: "\(analysis.protein) г", hint: "ориентир")
                ResultRow(label: "Жиры", value: "\(analysis.fat) г", hint: "ориентир")
                ResultRow(label: "Углеводы", value: "\(analysis.carbs) г", hint: "ориентир")

                HStack(spacing: 8) {
                    ForEach(analysis.tags, id: \.self) { t in
                        Text(t)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.black.opacity(0.75))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.gray.opacity(0.10))
                            .cornerRadius(999)
                    }
                    Spacer()
                }
                .padding(.top, 10)

                Text(analysis.notes)
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
                    .padding(.top, 8)
            }

            HStack(spacing: 10) {
                Button(action: onRetake) {
                    Text("Переснять")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.gray.opacity(0.12))
                        .cornerRadius(999)
                }

                Button(action: onAddToDiary) {
                    Text("Добавить в дневник")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.black)
                        .cornerRadius(999)
                }
            }

            Spacer(minLength: 6)
        }
        .padding(18)
        .background(FTTheme.bg)
    }
}

private struct TipRow: View {
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.black.opacity(0.75))
                .padding(.top, 1)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                Text(text)
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }
            Spacer()
        }
        .padding(.top, 8)
    }
}

private struct ResultRow: View {
    let label: String
    let value: String
    let hint: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 14, weight: .semibold))
                Text(hint)
                    .font(.system(size: 11))
                    .foregroundColor(FTTheme.muted)
            }
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.black.opacity(0.8))
        }
        .padding(.top, 10)
    }
}
