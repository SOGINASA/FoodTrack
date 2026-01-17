import SwiftUI

struct PrimaryButton: View {
    let title: String
    var disabled: Bool = false
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(disabled ? Color.black.opacity(0.45) : Color.black)
                .clipShape(Capsule())
        }
        .disabled(disabled)
    }
}
