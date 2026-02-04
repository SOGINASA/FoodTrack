import SwiftUI

struct FTTextField: View {
    let title: String
    var placeholder: String = ""
    @Binding var text: String
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(FTTheme.text)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboard)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled(true)
                }
            }
            .font(.system(size: 16))
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(FTTheme.elevated)
            .overlay(
                RoundedRectangle(cornerRadius: FTTheme.corner)
                    .stroke(FTTheme.border, lineWidth: 1)
            )
        }
    }
}
