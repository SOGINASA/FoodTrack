import Foundation

enum Gender: String, CaseIterable, Identifiable, Codable {
    case male, female, other
    var id: String { rawValue }
    var title: String {
        switch self {
        case .male: return "Мужской"
        case .female: return "Женский"
        case .other: return "Другое"
        }
    }
}

enum DietType: String, CaseIterable, Identifiable, Codable {
    case none, pp, keto, vegan, vegetarian, lowCarb

    var id: String { rawValue }
    var title: String {
        switch self {
        case .none: return "Нет"
        case .pp: return "ПП"
        case .keto: return "Кето"
        case .vegan: return "Веган"
        case .vegetarian: return "Вегетарианство"
        case .lowCarb: return "Низкоуглеводная"
        }
    }
}

struct HealthStatus: Codable {
    var diabetes: Bool = false
    var hypertension: Bool = false
    var gastritis: Bool = false
    var lactose: Bool = false
    var gluten: Bool = false
    var notes: String = ""

    struct Preset {
        let title: String
        let key: WritableKeyPath<HealthStatus, Bool>
    }

    static let presets: [Preset] = [
        .init(title: "Диабет", key: \.diabetes),
        .init(title: "Давление", key: \.hypertension),
        .init(title: "Гастрит/ЖКТ", key: \.gastritis),
        .init(title: "Непереносимость лактозы", key: \.lactose),
        .init(title: "Непереносимость глютена", key: \.gluten),
    ]
}

struct RegisterDraft: Codable {
    var identity: String = ""
    var gender: Gender? = nil
    var workoutsPerWeek: Int = 0
    var diet: DietType = .none
    var birthYear: Int? = nil
    var heightCm: Int? = nil
    var weightKg: Double? = nil
    var targetWeightKg: Double? = nil
    var mealsPerDay: Int = 3
    var health: HealthStatus = HealthStatus()
    var disclaimerAccepted: Bool = false

    var isIdentityValid: Bool {
        let v = identity.trimmingCharacters(in: .whitespacesAndNewlines)
        return Validators.isValidEmail(v) || Validators.isValidNickname(v)
    }

    var isBirthYearValid: Bool {
        guard let y = birthYear else { return false }
        let current = Calendar.current.component(.year, from: Date())
        return y >= current - 90 && y <= current - 10
    }

    var isBodyValid: Bool {
        guard let h = heightCm, let w = weightKg, let t = targetWeightKg else { return false }
        return (120...230).contains(h) && w > 25 && w < 250 && t > 25 && t < 250
    }

    var isReadyToFinish: Bool {
        isIdentityValid && gender != nil && isBirthYearValid && isBodyValid && disclaimerAccepted
    }
}

enum Validators {
    static func isValidEmail(_ text: String) -> Bool {
        // простая валидка (потом улучшим)
        return text.contains("@") && text.contains(".") && text.count >= 6
    }

    static func isValidNickname(_ text: String) -> Bool {
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard (3...20).contains(t.count) else { return false }
        return t.unicodeScalars.allSatisfy { allowed.contains($0) }
    }
}
