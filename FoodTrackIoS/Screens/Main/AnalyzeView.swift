import SwiftUI

struct AnalyzeView: View {
    @EnvironmentObject private var appState: AppState

    @State private var showCamera = false
    @State private var showPhotoLibrary = false
    @State private var capturedImage: UIImage?
    @State private var analysis: FoodPrediction?
    @State private var showResultSheet = false
    @State private var isAnalyzing = false
    @State private var errorMessage = ""
    @State private var selectedMealType: MealType = .lunch
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Анализ по фото",
                        subtitle: "Сфотографируйте блюдо — мы покажем оценку калорий и БЖУ"
                    )
                    .padding(.top, 10)

                    // Photo block
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
                                    Text("Лучше при хорошем освещении, без теней")
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
                                            errorMessage = ""
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

                                    Button { showPhotoLibrary = true } label: {
                                        Text("Галерея")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.black)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 10)
                                            .background(Color.white.opacity(0.95))
                                            .cornerRadius(999)
                                            .overlay(RoundedRectangle(cornerRadius: 999).stroke(FTTheme.border, lineWidth: 1))
                                    }

                                    Button { showCamera = true } label: {
                                        Text(capturedImage == nil ? "Камера" : "Переснять")
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

                        if isAnalyzing {
                            HStack(spacing: 10) {
                                ProgressView().tint(.black)
                                Text("Анализируем фото...")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.black.opacity(0.75))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                        }

                        if !errorMessage.isEmpty {
                            Text(errorMessage)
                                .font(.system(size: 13))
                                .foregroundColor(.red)
                                .padding(.top, 4)
                        }

                        if capturedImage != nil && analysis == nil && !isAnalyzing {
                            PrimaryButton(title: "Проанализировать") {
                                analyzePhoto()
                            }
                            .padding(.top, 10)
                        }

                        if capturedImage == nil {
                            Text("Фото не публикуются и не передаются третьим лицам")
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)
                                .padding(.top, 8)
                        }
                    }

                    // Tips
                    FTCard {
                        Text("Как получить точнее")
                            .font(.system(size: 16, weight: .semibold))

                        AnalyzeTipRow(title: "Кадр целиком", text: "Блюдо полностью в кадре — гарнир и соус тоже видны")
                        AnalyzeTipRow(title: "Чистый фон", text: "Лишние предметы мешают распознаванию")
                        AnalyzeTipRow(title: "Один ракурс", text: "Сверху или под углом — самый стабильный вариант")
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showCamera) {
            CameraPicker { image in
                capturedImage = image
                analyzePhoto()
            }
            .ignoresSafeArea()
        }
        .sheet(isPresented: $showPhotoLibrary) {
            PhotoLibraryPicker { image in
                capturedImage = image
                analyzePhoto()
            }
        }
        .sheet(isPresented: $showResultSheet) {
            if let analysis {
                AnalyzeResultSheet(
                    image: capturedImage,
                    analysis: analysis,
                    selectedMealType: $selectedMealType,
                    isSaving: $isSaving,
                    onRetake: {
                        showResultSheet = false
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                            showCamera = true
                        }
                    },
                    onClose: { showResultSheet = false },
                    onSave: { saveToDiary() }
                )
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
        }
    }

    // MARK: - Actions

    private func analyzePhoto() {
        guard let image = capturedImage else { return }
        isAnalyzing = true
        errorMessage = ""

        Task {
            do {
                let result = try await APIClient.shared.analyzePhoto(image)
                analysis = result
                showResultSheet = true
            } catch {
                errorMessage = "Не удалось распознать. Попробуйте другое фото."
            }
            isAnalyzing = false
        }
    }

    private func saveToDiary() {
        guard let a = analysis else { return }
        isSaving = true

        Task {
            let req = CreateMealRequest(
                name: a.dish_name ?? "Блюдо",
                meal_type: selectedMealType.rawValue,
                calories: a.calories ?? 0,
                protein: a.protein ?? 0,
                carbs: a.carbs ?? 0,
                fats: a.fat ?? 0,
                portions: 1,
                ai_confidence: a.confidence,
                health_score: a.health_score,
                ai_advice: a.advice,
                tags: a.tags
            )
            _ = try? await APIClient.shared.createMeal(req)
            isSaving = false
            showResultSheet = false
            capturedImage = nil
            analysis = nil
        }
    }
}

// MARK: - Result Sheet

private struct AnalyzeResultSheet: View {
    let image: UIImage?
    let analysis: FoodPrediction
    @Binding var selectedMealType: MealType
    @Binding var isSaving: Bool
    let onRetake: () -> Void
    let onClose: () -> Void
    let onSave: () -> Void

    var body: some View {
        ScrollView {
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

                HStack {
                    Text(analysis.dish_name ?? "Блюдо")
                        .font(.system(size: 22, weight: .semibold))
                    Spacer()
                    if let conf = analysis.confidence {
                        Text("\(Int(conf * 100))%")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(FTTheme.success)
                            .cornerRadius(999)
                    }
                }

                if let portion = analysis.portion_size {
                    Text("Порция: \(portion)")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                FTCard {
                    AnalyzeNutritionRow(label: "Калории", value: "\(Int(analysis.calories ?? 0)) ккал", hint: "оценка")
                    AnalyzeNutritionRow(label: "Белки", value: "\(Int(analysis.protein ?? 0)) г", hint: "ориентир")
                    AnalyzeNutritionRow(label: "Жиры", value: "\(Int(analysis.fat ?? 0)) г", hint: "ориентир")
                    AnalyzeNutritionRow(label: "Углеводы", value: "\(Int(analysis.carbs ?? 0)) г", hint: "ориентир")

                    if let tags = analysis.tags, !tags.isEmpty {
                        HStack(spacing: 8) {
                            ForEach(tags.prefix(4), id: \.self) { t in
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
                    }

                    if let advice = analysis.advice, !advice.isEmpty {
                        Text(advice)
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                            .padding(.top, 8)
                    }
                }

                // Meal type selector
                VStack(alignment: .leading, spacing: 8) {
                    Text("Тип приёма")
                        .font(.system(size: 14, weight: .semibold))

                    HStack(spacing: 8) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            Button {
                                selectedMealType = type
                            } label: {
                                Text(type.title)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(selectedMealType == type ? .white : .black.opacity(0.7))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(selectedMealType == type ? Color.black : Color.gray.opacity(0.12))
                                    .cornerRadius(999)
                            }
                        }
                    }
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

                    Button(action: onSave) {
                        Text(isSaving ? "Сохранение..." : "В дневник")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(isSaving ? Color.black.opacity(0.5) : Color.black)
                            .cornerRadius(999)
                    }
                    .disabled(isSaving)
                }

                Spacer(minLength: 6)
            }
            .padding(18)
        }
        .background(FTTheme.bg)
    }
}

private struct AnalyzeTipRow: View {
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.black.opacity(0.75))
                .padding(.top, 1)
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.system(size: 14, weight: .semibold))
                Text(text).font(.system(size: 12)).foregroundColor(FTTheme.muted)
            }
            Spacer()
        }
        .padding(.top, 8)
    }
}

private struct AnalyzeNutritionRow: View {
    let label: String
    let value: String
    let hint: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.system(size: 14, weight: .semibold))
                Text(hint).font(.system(size: 11)).foregroundColor(FTTheme.muted)
            }
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.black.opacity(0.8))
        }
        .padding(.top, 10)
    }
}
