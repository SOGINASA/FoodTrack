import Foundation

struct Recipe: Identifiable, Hashable {
    let id: UUID = UUID()
    let title: String
    let subtitle: String
    let kcal: Int
    let protein: Int
    let fat: Int
    let carbs: Int
    let timeMin: Int
    let imageSymbol: String // пока вместо реальных картинок — SF Symbol
    let ingredients: [String]
    let steps: [String]
}
