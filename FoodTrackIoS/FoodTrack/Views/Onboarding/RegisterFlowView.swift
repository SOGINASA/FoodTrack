import SwiftUI

struct RegisterFlowView: View {
    @EnvironmentObject private var authVM: AuthViewModel

    @State private var stepIndex: Int = 0
    @State private var draft = RegisterDraft()

    let onFinish: (RegisterDraft) -> Void

    private let totalSteps = 8

    var body: some View {
        VStack(spacing: 14) {
            // верхняя панель
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Регистрация")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.black)
                    Text("Шаг \(stepIndex + 1) из \(totalSteps)")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.black.opacity(0.5))
                }
                Spacer()
                ProgressPill(value: Double(stepIndex + 1), max: Double(totalSteps))
            }

            // свайп страницы
            TabView(selection: $stepIndex) {
                StepAccountView(draft: $draft).tag(0)
                StepGenderView(draft: $draft).tag(1)
                StepWorkoutsView(draft: $draft).tag(2)
                StepDietView(draft: $draft).tag(3)
                StepBirthYearView(draft: $draft).tag(4)
                StepBodyView(draft: $draft).tag(5)
                StepMealsPerDayView(draft: $draft).tag(6)
                StepDisclaimerView(draft: $draft).tag(7)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut(duration: 0.25), value: stepIndex)

            // кнопки
            HStack(spacing: 12) {
                SecondaryButton(title: "Назад") {
                    withAnimation { stepIndex = max(0, stepIndex - 1) }
                }
                .disabled(stepIndex == 0)

                PrimaryButton(title: stepIndex == totalSteps - 1 ? (authVM.isLoading ? "Создаём..." : "Завершить") : "Далее") {
                    if stepIndex == totalSteps - 1 {
                        guard draft.isReadyToFinish else { return }
                        onFinish(draft)
                    } else {
                        if canGoNext(stepIndex: stepIndex) {
                            withAnimation { stepIndex += 1 }
                        }
                    }
                }
                .disabled(isNextDisabled)
            }
        }
        .padding(16)
        .background(Color.black.opacity(0.02))
        .cornerRadius(22)
    }

    private var isNextDisabled: Bool {
        if stepIndex == totalSteps - 1 { return !draft.isReadyToFinish || authVM.isLoading }
        return !canGoNext(stepIndex: stepIndex)
    }

    private func canGoNext(stepIndex: Int) -> Bool {
        switch stepIndex {
        case 0: return draft.isIdentityValid
        case 1: return draft.gender != nil
        case 2: return true
        case 3: return true
        case 4: return draft.isBirthYearValid
        case 5: return draft.isBodyValid
        case 6: return true
        case 7: return draft.disclaimerAccepted
        default: return true
        }
    }
}

private struct ProgressPill: View {
    let value: Double
    let max: Double

    var body: some View {
        let p = min(value / max, 1)
        ZStack(alignment: .leading) {
            Capsule()
                .fill(Color.black.opacity(0.08))
                .frame(width: 110, height: 10)
            Capsule()
                .fill(Color.black)
                .frame(width: 110 * p, height: 10)
        }
        .accessibilityLabel("Прогресс регистрации")
    }
}
