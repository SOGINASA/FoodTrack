import SwiftUI

struct RegisterFlowView: View {
    @StateObject private var vm = RegisterFlowViewModel()

    var body: some View {
        VStack(spacing: 16) {
            StepProgressBar(progress: vm.progress)

            StepNavBar(
                title: titleForStep(vm.step),
                canGoBack: vm.canGoBack,
                onBack: { vm.back() }
            )

            TabView(selection: $vm.step) {
                StepAccountView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.account)
                StepGenderView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.gender)
                StepWorkoutsView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.workouts)
                StepDietView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.diet)
                StepBirthYearView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.birthYear)
                StepBodyView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.body)
                StepMealsPerDayView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.mealsPerDay)
                StepHealthView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.health)
                StepDisclaimerView(draft: $vm.draft).tag(RegisterFlowViewModel.Step.disclaimer)
                StepSummaryView(draft: vm.draft).tag(RegisterFlowViewModel.Step.summary)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut(duration: 0.25), value: vm.step)

            // нижняя кнопка “Далее”
            AuthPrimaryButton(
                title: vm.step == .summary ? "Завершить" : "Далее",
                isEnabled: vm.canGoNext,
                action: {
                    if vm.step == .summary {
                        // пока просто заглушка
                        // позже: закрыть флоу, показать RegisterFinishView
                        print("Регистрация завершена: \(vm.draft)")
                    } else {
                        vm.next()
                    }
                }
            )
            .padding(.top, 8)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(Color.white.ignoresSafeArea())
    }

    private func titleForStep(_ step: RegisterFlowViewModel.Step) -> String {
        switch step {
        case .account: return "Аккаунт"
        case .gender: return "Пол"
        case .workouts: return "Тренировки"
        case .diet: return "Диета"
        case .birthYear: return "Год рождения"
        case .body: return "Параметры тела"
        case .mealsPerDay: return "Питание"
        case .health: return "Здоровье"
        case .disclaimer: return "Важно"
        case .summary: return "Проверка"
        }
    }
}
