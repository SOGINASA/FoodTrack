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
                    .fill(selected ? Color.white : Color.gray.opacity(0.35))
                    .frame(width: 10, height: 10)
            }
            .foregroundColor(selected ? .white : .black)
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(selected ? Color.black : Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: FTTheme.corner)
                    .stroke(selected ? Color.black : FTTheme.border, lineWidth: 1)
            )
            .cornerRadius(FTTheme.corner)
        }
    }
}
