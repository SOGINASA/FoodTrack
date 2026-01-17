import SwiftUI

struct CircularProgressView: View {
    let value: Double
    let max: Double
    var lineWidth: CGFloat = 8
    var size: CGFloat = 72

    private var progress: Double {
        guard max > 0 else { return 0 }
        return min(max(value / max, 0), 1)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.black.opacity(0.08), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(Color.black, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.35), value: progress)
        }
        .frame(width: size, height: size)
    }
}
