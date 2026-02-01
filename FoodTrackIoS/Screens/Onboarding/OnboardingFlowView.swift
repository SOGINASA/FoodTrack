import SwiftUI

struct OnboardingFlowView: View {
    @EnvironmentObject private var appState: AppState

    @State private var stepIndex: Int = 0
    @State private var draft = OnboardingDraft()
    @State private var error: String = ""
    @State private var isSubmitting = false

    private let total = 8

    var body: some View {
        OnboardingShell(
            step: stepIndex + 1,
            total: total,
            onBack: stepIndex == 0 ? nil : { stepIndex -= 1; error = "" },
            onContinue: handleContinue,
            error: error,
            isLoading: isSubmitting
        ) {
            currentStepView()
        }
    }

    @ViewBuilder
    private func currentStepView() -> some View {
        switch stepIndex {
        case 0: StepGender(draft: $draft)
        case 1: StepBirthYear(draft: $draft)
        case 2: StepBodyGoal(draft: $draft)
        case 3: StepDiet(draft: $draft)
        case 4: StepHealth(draft: $draft)
        case 5: StepMealsPerDay(draft: $draft)
        case 6: StepWorkouts(draft: $draft)
        default: StepDisclaimer(draft: $draft)
        }
    }

    private func handleContinue() {
        error = ""

        switch stepIndex {
        case 0:
            if draft.gender.isEmpty { error = "Выберите вариант"; return }
        case 1:
            if draft.birthYear.count != 4 { error = "Введите год рождения"; return }
        case 2:
            if draft.heightCm.isEmpty || draft.weightKg.isEmpty || draft.targetWeightKg.isEmpty {
                error = "Заполните рост, вес и цель"
                return
            }
        case 7:
            if !draft.disclaimerAccepted { error = "Нужно принять условия"; return }
        default:
            break
        }

        if stepIndex < total - 1 {
            stepIndex += 1
        } else {
            submitOnboarding()
        }
    }

    private func submitOnboarding() {
        isSubmitting = true
        Task {
            do {
                try await appState.completeOnboarding(draft)
            } catch {
                // Even if server fails, proceed
                appState.route = .main
            }
            isSubmitting = false
        }
    }
}
