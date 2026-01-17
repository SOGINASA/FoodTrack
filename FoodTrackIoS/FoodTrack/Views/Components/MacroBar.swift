import SwiftUI

struct MacroBar: View {
    let title: String
    let value: Int
    let goal: Int
    let accent: Color

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(Double(value) / Double(goal), 1)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.black.opacity(0.6))

            Text("\(value)/\(goal)г")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.black)

            ZStack(alignment: .leading) {
                Capsule().fill(Color.black.opacity(0.08)).frame(height: 8)
                Capsule().fill(accent).frame(width: max(10, 60 * progress), height: 8)
            }
        }
        .frame(maxWidth: .infinity)
    }
}
