import SwiftUI

struct StepBirthYear: View {
    @Binding var draft: OnboardingDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Год рождения")
                .font(.system(size: 26, weight: .semibold))
            Text("Нужен для корректных расчётов.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            FTTextField(title: "Введите год", placeholder: "Например: 2004", text: $draft.birthYear, keyboard: .numberPad)
                .padding(.top, 14)

            Text("Мы не показываем ваш возраст другим пользователям.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 6)
        }
    }
}
