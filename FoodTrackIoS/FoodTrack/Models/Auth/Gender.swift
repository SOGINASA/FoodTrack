import Foundation

enum Gender: String, CaseIterable, Codable, Identifiable {
    case male
    case female
    case other

    var id: String { rawValue }

    var title: String {
        switch self {
        case .male: return "Мужской"
        case .female: return "Женский"
        case .other: return "Другое"
        }
    }
}
