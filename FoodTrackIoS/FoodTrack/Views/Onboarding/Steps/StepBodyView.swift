import SwiftUI

struct StepBodyView: View {
    @Binding var draft: RegisterDraft

    private var isValid: Bool { draft.isBodyValid }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Параметры тела")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Рост, вес и цель по весу — чтобы считать прогресс.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 12) {
                    NumberField(
                        title: "Рост (см)",
                        placeholder: "например: 176",
                        value: Binding(
                            get: { draft.heightCm.map(String.init) ?? "" },
                            set: { draft.heightCm = Int($0.filter { $0.isNumber }) }
                        ),
                        keyboard: .numberPad
                    )

                    NumberField(
                        title: "Вес (кг)",
                        placeholder: "например: 78.5",
                        value: Binding(
                            get: { draft.weightKg.map { trimZeros($0) } ?? "" },
                            set: { draft.weightKg = parseDouble($0) }
                        ),
                        keyboard: .decimalPad
                    )

                    NumberField(
                        title: "Цель (кг)",
                        placeholder: "например: 72",
                        value: Binding(
                            get: { draft.targetWeightKg.map { trimZeros($0) } ?? "" },
                            set: { draft.targetWeightKg = parseDouble($0) }
                        ),
                        keyboard: .decimalPad
                    )

                    HStack {
                        Image(systemName: isValid ? "checkmark.circle.fill" : "info.circle")
                            .foregroundColor(isValid ? .green : .black.opacity(0.45))
                        Text(isValid ? "Выглядит нормально" : "Заполни все поля корректно")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(isValid ? .green : .black.opacity(0.5))
                        Spacer()
                    }
                    .padding(.top, 2)
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                Spacer(minLength: 12)
            }
            .padding(.top, 6)
        }
    }

    private func parseDouble(_ text: String) -> Double? {
        let cleaned = text
            .replacingOccurrences(of: ",", with: ".")
            .filter { $0.isNumber || $0 == "." }
        return Double(cleaned)
    }

    private func trimZeros(_ value: Double) -> String {
        let s = String(format: "%.2f", value)
        // убираем лишние нули
        if s.hasSuffix("00") { return String(s.dropLast(3)) }
        if s.hasSuffix("0") { return String(s.dropLast(1)) }
        return s
    }
}

private struct NumberField: View {
    let title: String
    let placeholder: String
    @Binding var value: String
    let keyboard: UIKeyboardType

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.black.opacity(0.7))

            TextField(placeholder, text: $value)
                .keyboardType(keyboard)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(.horizontal, 14)
                .frame(height: 52)
                .background(Color.white)
                .cornerRadius(14)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.black.opacity(0.08), lineWidth: 1)
                )
        }
    }
}
