import SwiftUI

struct StepProgressBar: View {
    let progress: Double

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.black.opacity(0.08))
                    .frame(height: 8)

                Capsule()
                    .fill(Color.black)
                    .frame(width: max(8, geo.size.width * progress), height: 8)
                    .animation(.easeInOut(duration: 0.25), value: progress)
            }
        }
        .frame(height: 8)
        .accessibilityLabel("Прогресс регистрации")
        .accessibilityValue("\(Int(progress * 100)) процентов")
    }
}
