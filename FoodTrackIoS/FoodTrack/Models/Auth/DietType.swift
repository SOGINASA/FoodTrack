import Foundation

enum DietType: String, CaseIterable, Codable, Identifiable {
    case none
    case balanced
    case keto
    case lowCarb
    case vegetarian
    case vegan
    case halal

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none: return "Нет"
        case .balanced: return "Сбалансированная"
        case .keto: return "Кето"
        case .lowCarb: return "Низкоуглеводная"
        case .vegetarian: return "Вегетарианская"
        case .vegan: return "Веганская"
        case .halal: return "Халяль"
        }
    }
}
