import SwiftUI

struct StepBodyGoal: View {
    @Binding var draft: OnboardingDraft

    var goalHint: String {
        let w = Double(draft.weightKg) ?? 0
        let t = Double(draft.targetWeightKg) ?? 0
        if w <= 0 || t <= 0 { return "" }
        if t < w { return "Цель: снизить вес" }
        if t > w { return "Цель: набрать вес" }
        return "Цель: поддерживать вес"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Параметры тела и цель")
                .font(.system(size: 26, weight: .semibold))

            Text("Эти данные нужны, чтобы рассчитать норму калорий и БЖУ.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            VStack(spacing: 14) {
                FTTextField(
                    title: "Рост",
                    placeholder: "Например: 175",
                    text: $draft.heightCm,
                    keyboard: .numberPad
                )

                FTTextField(
                    title: "Вес",
                    placeholder: "Например: 72",
                    text: $draft.weightKg,
                    keyboard: .decimalPad
                )

                FTTextField(
                    title: "Цель по весу",
                    placeholder: "Например: 68",
                    text: $draft.targetWeightKg,
                    keyboard: .decimalPad
                )
            }
            .padding(.top, 14)

            if !goalHint.isEmpty {
                Text(goalHint)
                    .font(.system(size: 14))
                    .foregroundColor(.gray.opacity(0.8))
                    .padding(.top, 6)
            }

            Text("Всё можно будет изменить позже в настройках.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 6)
        }
    }
}
