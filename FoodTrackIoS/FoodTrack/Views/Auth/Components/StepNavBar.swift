import SwiftUI

struct StepNavBar: View {
    let title: String
    let canGoBack: Bool
    let onBack: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .frame(width: 40, height: 40)
                    .background(Color.black.opacity(canGoBack ? 0.06 : 0.03))
                    .clipShape(Circle())
            }
            .disabled(!canGoBack)
            .accessibilityLabel("Назад")

            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.black)

            Spacer()
        }
    }
}
