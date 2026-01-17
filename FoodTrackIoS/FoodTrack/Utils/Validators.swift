import Foundation

enum Validators {
    static func isValidIdentity(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 3 else { return false }

        // допускаем: ник ИЛИ email
        if isValidEmail(trimmed) { return true }
        return isValidNickname(trimmed)
    }

    static func isValidEmail(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        // простой, но нормальный паттерн для фронта
        let pattern = #"^[A-Z0-9a-z._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$"#
        return trimmed.range(of: pattern, options: .regularExpression) != nil
    }

    static func isValidNickname(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        // ник: 3..20, латиница/кириллица/цифры/._-
        let pattern = #"^[A-Za-zА-Яа-я0-9._\-]{3,20}$"#
        return trimmed.range(of: pattern, options: .regularExpression) != nil
    }

    static func isValidBirthYear(_ year: Int) -> Bool {
        let current = Calendar.current.component(.year, from: Date())
        // 10..90 лет примерно (можно подкрутить)
        return year >= current - 90 && year <= current - 10
    }

    static func isValidHeight(_ cm: Int) -> Bool {
        cm >= 120 && cm <= 230
    }

    static func isValidWeight(_ kg: Double) -> Bool {
        kg >= 30 && kg <= 250
    }

    static func isValidTargetWeight(_ kg: Double) -> Bool {
        kg >= 30 && kg <= 250
    }
}
