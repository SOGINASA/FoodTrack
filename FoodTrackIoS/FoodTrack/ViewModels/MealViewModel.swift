import Foundation

final class MealViewModel: ObservableObject {
    @Published var todayMeals: [Meal] = []

    // демо-цели (потом подтянем из профиля)
    @Published var goalCalories: Int = 2500
    @Published var goalProtein: Int = 150
    @Published var goalCarbs: Int = 200
    @Published var goalFats: Int = 70

    init() {
        // демо данные
        todayMeals = [
            Meal(name: "Омлет", calories: 320, protein: 22, carbs: 8, fats: 18, emoji: "🍳"),
            Meal(name: "Курица + рис", calories: 540, protein: 38, carbs: 62, fats: 10, emoji: "🍗"),
        ]
    }

    var todayCalories: Int { todayMeals.reduce(0) { $0 + $1.calories } }
    var todayProtein: Int { todayMeals.reduce(0) { $0 + $1.protein } }
    var todayCarbs: Int { todayMeals.reduce(0) { $0 + $1.carbs } }
    var todayFats: Int { todayMeals.reduce(0) { $0 + $1.fats } }

    func addDemoMeal(name: String, calories: Int, protein: Int, carbs: Int, fats: Int) {
        let clean = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let n = clean.isEmpty ? "Блюдо" : clean
        let meal = Meal(name: n, calories: max(calories, 0), protein: max(protein, 0), carbs: max(carbs, 0), fats: max(fats, 0), emoji: "🍽️")
        todayMeals.insert(meal, at: 0)
    }
}
