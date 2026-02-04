import SwiftUI

struct OptionRow: View {
    let title: String
    let selected: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                Spacer()
                Circle()
                    .fill(selected ? Color(.systemBackground) : FTTheme.fill)
                    .frame(width: 10, height: 10)
            }
            .foregroundColor(selected ? Color(.systemBackground) : FTTheme.text)
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(selected ? FTTheme.tint : FTTheme.card)
            .overlay(
                RoundedRectangle(cornerRadius: FTTheme.corner)
                    .stroke(selected ? FTTheme.tint : FTTheme.border, lineWidth: 1)
            )
            .cornerRadius(FTTheme.corner)
        }
    }
}
