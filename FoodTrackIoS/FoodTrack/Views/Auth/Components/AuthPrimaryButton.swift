import SwiftUI

struct AuthPrimaryButton: View {
    let title: String
    let isEnabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(isEnabled ? Color.black : Color.black.opacity(0.35))
                .cornerRadius(16)
        }
        .disabled(!isEnabled)
        .accessibilityLabel(title)
    }
}
