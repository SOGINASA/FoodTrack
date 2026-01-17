import SwiftUI

struct StepAccountView: View {
    @Binding var draft: RegisterDraft

    private var hint: String {
        let v = draft.identity.trimmingCharacters(in: .whitespacesAndNewlines)
        if v.isEmpty { return "Введи ник или почту" }
        if Validators.isValidEmail(v) { return "Похоже на почту — отлично" }
        if Validators.isValidNickname(v) { return "Похоже на ник — отлично" }
        return "Ник: 3–20 символов (буквы/цифры/._-)\nили почта в формате name@mail.com"
    }

    private var hintColor: Color {
        let v = draft.identity.trimmingCharacters(in: .whitespacesAndNewlines)
        if v.isEmpty { return .black.opacity(0.45) }
        return draft.isIdentityValid ? .green : .red
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Ник или почта")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Одно поле. Без лишней бюрократии.")
                    .font(.system(size: 15, weight: .regular))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 12) {
                    AuthTextField(
                        title: "Ник/почта",
                        placeholder: "например: tony или tony@mail.com",
                        text: $draft.identity
                    )

                    Text(hint)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(hintColor)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 2)
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                Spacer(minLength: 12)

                Text("Мы не просим пароль на этом шаге — сейчас собираем только профиль.")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.black.opacity(0.5))
            }
            .padding(.top, 6)
        }
    }
}
