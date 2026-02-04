import SwiftUI

struct OnboardingProgress: View {
    let step: Int
    let total: Int

    var percent: Int {
        guard total > 0 else { return 0 }
        return Int(round(Double(step) / Double(total) * 100))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .leading) {
                Capsule().fill(FTTheme.fill).frame(height: 8)
                Capsule().fill(FTTheme.tint).frame(width: max(8, CGFloat(percent) * 3.0), height: 8)
                    .animation(.easeOut(duration: 0.2), value: percent)
            }

            Text("Готово: \(percent)%")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
        }
    }
}
