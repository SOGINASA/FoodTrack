import Foundation

struct HealthStatus: Codable, Equatable {
    // набор “флажков”, без диагнозов и страшилок
    var diabetes: Bool = false
    var hypertension: Bool = false
    var gastritis: Bool = false
    var allergy: Bool = false
    var kidneyIssues: Bool = false

    // пользователь может добавить текстом (опционально)
    var notes: String = ""
}

extension HealthStatus {
    static var presets: [(key: WritableKeyPath<HealthStatus, Bool>, title: String)] {
        [
            (\.diabetes, "Диабет"),
            (\.hypertension, "Повышенное давление"),
            (\.gastritis, "Проблемы с ЖКТ"),
            (\.allergy, "Аллергии"),
            (\.kidneyIssues, "Почки/отеки")
        ]
    }
}
