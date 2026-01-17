import Foundation

struct RegisterDraft: Codable, Equatable {
    // 1) ник/почта в одном поле
    var identity: String = ""

    // 2) пол
    var gender: Gender? = nil

    // 3) тренировок в неделю
    var workoutsPerWeek: Int = 0

    // 4) диета
    var diet: DietType = .none

    // 5) год рождения
    var birthYear: Int? = nil

    // 6) рост, вес, цель по весу
    var heightCm: Int? = nil
    var weightKg: Double? = nil
    var targetWeightKg: Double? = nil

    // 7) сколько раз в день питаетесь
    var mealsPerDay: Int = 3

    // 8) состояние здоровья (чеклист)
    var health: HealthStatus = .init()

    // 9) отказ от претензий
    var disclaimerAccepted: Bool = false

    // удобство
    var createdAt: Date = Date()
}

extension RegisterDraft {
    var isIdentityValid: Bool {
        Validators.isValidIdentity(identity)
    }

    var isBirthYearValid: Bool {
        guard let birthYear else { return false }
        return Validators.isValidBirthYear(birthYear)
    }

    var isBodyValid: Bool {
        guard let heightCm, let weightKg, let targetWeightKg else { return false }
        return Validators.isValidHeight(heightCm)
            && Validators.isValidWeight(weightKg)
            && Validators.isValidTargetWeight(targetWeightKg)
    }

    var isReadyToFinish: Bool {
        isIdentityValid
        && gender != nil
        && workoutsPerWeek >= 0
        && isBirthYearValid
        && isBodyValid
        && mealsPerDay >= 1
        && disclaimerAccepted
    }
}
