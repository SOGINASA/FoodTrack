import SwiftUI

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword: String = ""
    @State private var newPassword: String = ""
    @State private var confirmPassword: String = ""
    @State private var isSaving = false
    @State private var error: String?
    @State private var showSuccess = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Header
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(FTTheme.text)
                            .padding(12)
                            .background(FTTheme.fill)
                            .clipShape(Circle())
                    }
                    Spacer()
                    Text("Сменить пароль")
                        .font(.system(size: 17, weight: .semibold))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }

                if let error {
                    Text(error)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.red.opacity(0.9))
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.06))
                        .cornerRadius(12)
                }

                if showSuccess {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(FTTheme.success)
                        Text("Пароль изменён")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(FTTheme.success)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(FTTheme.success.opacity(0.08))
                    .cornerRadius(12)
                }

                FTCard {
                    FTTextField(title: "Текущий пароль", text: $currentPassword, isSecure: true)
                    FTTextField(title: "Новый пароль", text: $newPassword, isSecure: true)
                    FTTextField(title: "Подтвердите пароль", text: $confirmPassword, isSecure: true)

                    Text("Минимум 6 символов")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }

                PrimaryButton(
                    title: isSaving ? "Сохранение..." : "Сменить пароль",
                    disabled: isSaving || currentPassword.isEmpty || newPassword.isEmpty
                ) {
                    Task { await save() }
                }

                Spacer(minLength: 20)
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.top, 14)
        }
        .background(FTTheme.bg)
        .navigationBarHidden(true)
    }

    private func save() async {
        error = nil
        showSuccess = false

        guard newPassword.count >= 6 else {
            error = "Пароль должен быть не менее 6 символов"
            return
        }

        guard newPassword == confirmPassword else {
            error = "Пароли не совпадают"
            return
        }

        isSaving = true
        do {
            try await APIClient.shared.changePassword(
                ChangePasswordRequest(current_password: currentPassword, new_password: newPassword)
            )
            showSuccess = true
            currentPassword = ""
            newPassword = ""
            confirmPassword = ""
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }
}
