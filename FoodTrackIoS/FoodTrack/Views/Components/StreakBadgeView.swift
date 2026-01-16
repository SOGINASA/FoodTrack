import SwiftUI

struct StreakBadgeView: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 10) {
            FlameIcon()
                .frame(width: 18, height: 18)

            VStack(alignment: .leading, spacing: 2) {
                Text("\(streak)")
                    .font(.system(size: 18, weight: .heavy))
                    .foregroundColor(.white)
                Text(wordForDays(streak))
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.9))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(
            LinearGradient(colors: [Color.orange, Color.red], startPoint: .leading, endPoint: .trailing)
        )
        .cornerRadius(999)
        .shadow(color: Color.red.opacity(0.2), radius: 14, x: 0, y: 8)
    }

    private func wordForDays(_ n: Int) -> String {
        if n == 1 { return "день" }
        if (2...4).contains(n % 10) && !(11...14).contains(n % 100) { return "дня" }
        return "дней"
    }
}

private struct FlameIcon: View {
    var body: some View {
        ZStack {
            Image(systemName: "flame.fill")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.15), radius: 6, x: 0, y: 3)
        }
    }
}
