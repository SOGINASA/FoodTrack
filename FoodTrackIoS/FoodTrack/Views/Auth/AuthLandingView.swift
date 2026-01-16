import SwiftUI

struct AuthLandingView: View {
    @State private var showLogin = false
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                VStack(spacing: 10) {
                    Text("FoodTrack")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundColor(.black)

                    Text("Ешь. Считай. Держи курс.")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.black.opacity(0.6))
                }
                .padding(.bottom, 10)

                VStack(spacing: 12) {
                    PrimaryButton(title: "Войти") {
                        showLogin = true
                    }
                    SecondaryButton(title: "Регистрация") {
                        showRegister = true
                    }
                }
                .padding(.horizontal, 16)

                Spacer()

                Text("Демо-версия фронта. Логику докрутим дальше.")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.black.opacity(0.45))
                    .padding(.bottom, 18)
            }
            .padding(.top, 20)
            .background(Color.white)
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}
