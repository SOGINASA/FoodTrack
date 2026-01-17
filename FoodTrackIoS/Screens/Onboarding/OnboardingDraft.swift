import Foundation

struct OnboardingDraft {
    var gender: String = ""
    var birthYear: String = ""
    var heightCm: String = ""
    var weightKg: String = ""
    var targetWeightKg: String = ""
    var diet: String = "none"
    var dietNotes: String = ""
    var healthFlags: Set<String> = []
    var healthNotes: String = ""
    var mealsPerDay: Int = 3
    var workoutsPerWeek: Int = 0
    var disclaimerAccepted: Bool = false
}
