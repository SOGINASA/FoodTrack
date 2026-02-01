import SwiftUI

struct FTHeader: View {
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.15))
                    .frame(width: 38, height: 38)
                    .overlay(
                        Text("FT")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black.opacity(0.85))
                    )

                VStack(alignment: .leading, spacing: 2) {
                    Text("FoodTrack")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                    Text("Snap it. Track it.")
                        .font(.system(size: 11))
                        .foregroundColor(FTTheme.muted)
                }

                Spacer()
            }

            Text(title)
                .font(.system(size: 28, weight: .semibold))
                .foregroundColor(.black)

            if let subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.system(size: 13))
                    .foregroundColor(FTTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
