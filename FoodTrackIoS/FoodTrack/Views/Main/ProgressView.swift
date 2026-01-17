import SwiftUI

struct ProgressScreenView: View {
    @EnvironmentObject private var progressVM: ProgressViewModel

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    HStack {
                        Text("Прогресс")
                            .font(.system(size: 32, weight: .bold))
                        Spacer()
                    }

                    CardView {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Серия активности")
                                .font(.system(size: 16, weight: .bold))

                            HStack {
                                StreakBadgeView(streak: progressVM.streakDays)
                                Spacer()
                            }

                            Divider().opacity(0.15)

                            Text("Фото прогресса (демо-заглушка)")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.black.opacity(0.6))

                            Rectangle()
                                .fill(Color.black.opacity(0.06))
                                .frame(height: 180)
                                .cornerRadius(18)
                                .overlay(
                                    VStack(spacing: 8) {
                                        Image(systemName: "camera")
                                            .font(.system(size: 22, weight: .bold))
                                            .foregroundColor(.black.opacity(0.45))
                                        Text("Камеру подключим позже")
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundColor(.black.opacity(0.45))
                                    }
                                )
                        }
                    }
                }
                .padding(16)
            }
            .background(Color.white)
        }
    }
}
