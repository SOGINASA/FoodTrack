import Foundation

struct Meal: Identifiable, Codable {
    let id: UUID
    var name: String
    var calories: Int
    var protein: Int
    var carbs: Int
    var fats: Int
    var emoji: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        calories: Int,
        protein: Int,
        carbs: Int,
        fats: Int,
        emoji: String = "🍽️",
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fats = fats
        self.emoji = emoji
        self.createdAt = createdAt
    }
}
