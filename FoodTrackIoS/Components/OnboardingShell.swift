import SwiftUI

struct OnboardingShell<Content: View>: View {
    let step: Int
    let total: Int
    let onBack: (() -> Void)?
    let onContinue: () -> Void
    let error: String?
    var isLoading: Bool = false
    let content: () -> Content

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                if let onBack {
                    Button("Назад", action: onBack)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.black.opacity(0.75))
                } else {
                    Spacer().frame(width: 60)
                }

                Spacer()

                Text("Шаг \(step) из \(total)")
                    .font(.system(size: 14))
                    .foregroundColor(FTTheme.muted)

                Spacer()
                Spacer().frame(width: 60)
            }
            .padding(.top, 10)

            OnboardingProgress(step: step, total: total)
                .padding(.top, 12)

            VStack(alignment: .leading, spacing: 14) {
                content()
            }
            .padding(.top, 26)

            if let error, !error.isEmpty {
                Text(error)
                    .font(.system(size: 14))
                    .foregroundColor(.red)
                    .padding(.top, 10)
            }

            PrimaryButton(
                title: isLoading ? "Сохранение..." : (step == total ? "Завершить" : "Продолжить"),
                disabled: isLoading,
                action: onContinue
            )
            .padding(.top, 18)

            Text("Это можно будет изменить позже в настройках.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.top, 14)

            Spacer()
        }
        .padding(.horizontal, FTTheme.hPad)
        .padding(.vertical, 16)
        .background(FTTheme.bg)
    }
}
