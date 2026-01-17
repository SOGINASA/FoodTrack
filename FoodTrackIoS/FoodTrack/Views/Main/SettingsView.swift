import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    HStack {
                        Text("Настройки")
                            .font(.system(size: 32, weight: .bold))
                        Spacer()
                    }

                    CardView {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Аккаунт")
                                .font(.system(size: 16, weight: .bold))

                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(authVM.currentUser?.displayName ?? "Пользователь")
                                        .font(.system(size: 16, weight: .semibold))
                                    Text(authVM.currentUser?.email ?? "—")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(.black.opacity(0.55))
                                }
                                Spacer()
                            }

                            Divider().opacity(0.15)

                            SecondaryButton(title: "Выйти") {
                                authVM.logout()
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(Color.white)
        }
    }
}
