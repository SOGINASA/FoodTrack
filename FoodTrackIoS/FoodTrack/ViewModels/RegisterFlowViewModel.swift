import Foundation
import SwiftUI

final class RegisterFlowViewModel: ObservableObject {
    enum Step: Int, CaseIterable {
        case account = 0
        case gender
        case workouts
        case diet
        case birthYear
        case body
        case mealsPerDay
        case health
        case disclaimer
        case summary
    }

    @Published var step: Step = .account
    @Published var draft: RegisterDraft = .init()

    // можно сохранять черновик локально позже (UserDefaults), но пока не усложняем

    var progress: Double {
        Double(step.rawValue + 1) / Double(Step.allCases.count)
    }

    var canGoBack: Bool {
        step.rawValue > 0
    }

    var canGoNext: Bool {
        validate(step: step)
    }

    func next() {
        guard canGoNext else { return }
        guard let nextStep = Step(rawValue: step.rawValue + 1) else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = nextStep
        }
    }

    func back() {
        guard canGoBack else { return }
        guard let prevStep = Step(rawValue: step.rawValue - 1) else { return }
        withAnimation(.easeInOut(duration: 0.25)) {
            step = prevStep
        }
    }

    func goTo(_ step: Step) {
        withAnimation(.easeInOut(duration: 0.25)) {
            self.step = step
        }
    }

    // Валидация ПО ШАГАМ (это важно, чтобы “Далее” не было всегда доступно)
    func validate(step: Step) -> Bool {
        switch step {
        case .account:
            return draft.isIdentityValid
        case .gender:
            return draft.gender != nil
        case .workouts:
            return draft.workoutsPerWeek >= 0 && draft.workoutsPerWeek <= 14
        case .diet:
            return true // всегда ок (даже .none)
        case .birthYear:
            return draft.isBirthYearValid
        case .body:
            return draft.isBodyValid
        case .mealsPerDay:
            return draft.mealsPerDay >= 1 && draft.mealsPerDay <= 8
        case .health:
            return true // можно пусто
        case .disclaimer:
            return draft.disclaimerAccepted
        case .summary:
            return draft.isReadyToFinish
        }
    }
}
