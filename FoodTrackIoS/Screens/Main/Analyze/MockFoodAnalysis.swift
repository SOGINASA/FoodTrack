import Foundation

struct MockFoodAnalysis: Identifiable {
    let id = UUID()
    let title: String
    let portionHint: String
    let kcal: Int
    let protein: Int
    let fat: Int
    let carbs: Int
    let confidence: Int          // 55–92 например
    let notes: String
    let tags: [String]
}

enum MockFoodAnalysisStore {
    static let all: [MockFoodAnalysis] = [
        .init(title: "Паста с курицей", portionHint: "порция ~350 г",
              kcal: 640, protein: 38, fat: 18, carbs: 78, confidence: 82,
              notes: "Если соус сливочный — жиры могут быть выше. Уточните соус для точности.",
              tags: ["ужин", "сытно", "высокий белок"]),
        .init(title: "Салат с тунцом", portionHint: "миска ~280 г",
              kcal: 420, protein: 32, fat: 18, carbs: 30, confidence: 86,
              notes: "Заправка решает всё: масло/майонез быстро добавляют калории.",
              tags: ["лёгко", "белок", "обед"]),
        .init(title: "Овсянка с бананом", portionHint: "тарелка ~320 г",
              kcal: 480, protein: 14, fat: 10, carbs: 84, confidence: 88,
              notes: "Если добавляли мёд/орехи — углеводы и жиры вырастут.",
              tags: ["завтрак", "углеводы", "энергия"]),
        .init(title: "Бургер + картофель", portionHint: "сет ~450 г",
              kcal: 980, protein: 35, fat: 48, carbs: 98, confidence: 72,
              notes: "Соусы и сыр — главные источники лишних калорий. Можно “облегчить” без картофеля.",
              tags: ["фастфуд", "калорийно", "читмил"]),
        .init(title: "Плов", portionHint: "порция ~300 г",
              kcal: 760, protein: 26, fat: 28, carbs: 96, confidence: 77,
              notes: "Масло и жирность мяса сильно влияют на итог. Порцию лучше уточнить.",
              tags: ["обед", "сытно", "рис"]),
        .init(title: "Суп (куриный/лапша)", portionHint: "миска ~350 мл",
              kcal: 260, protein: 18, fat: 9, carbs: 26, confidence: 79,
              notes: "Если много лапши/картошки — углеводы будут выше.",
              tags: ["лёгко", "ужин", "тепло"]),
        .init(title: "Стейк + овощи", portionHint: "порция ~320 г",
              kcal: 620, protein: 46, fat: 32, carbs: 18, confidence: 74,
              notes: "Если стейк жирный (рибай) — жиры будут заметно выше.",
              tags: ["высокий белок", "кето-лайт", "ужин"]),
        .init(title: "Суши/роллы", portionHint: "8 шт",
              kcal: 520, protein: 20, fat: 14, carbs: 82, confidence: 70,
              notes: "Сливочный сыр/темпура резко повышают калорийность.",
              tags: ["углеводы", "обед", "рыба"]),
        .init(title: "Яичница + тост", portionHint: "порция ~240 г",
              kcal: 410, protein: 20, fat: 22, carbs: 34, confidence: 85,
              notes: "Если жарили на масле — добавьте +5–10 г жира.",
              tags: ["завтрак", "быстро", "белок"]),
        .init(title: "Шаурма", portionHint: "1 шт",
              kcal: 820, protein: 38, fat: 36, carbs: 88, confidence: 68,
              notes: "Соус и размер сильно влияют. Можно выбрать меньше соуса для контроля калорий.",
              tags: ["стритфуд", "сытно", "обед"])
    ]

    static func randomOne() -> MockFoodAnalysis {
        all.randomElement()!
    }
}
