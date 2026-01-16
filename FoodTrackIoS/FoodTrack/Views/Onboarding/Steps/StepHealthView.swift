import SwiftUI

struct StepHealthView: View {
    @Binding var draft: RegisterDraft

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Состояние здоровья")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Отметь то, что важно. Можно ничего не выбирать.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 10) {
                    ForEach(HealthStatus.presets.indices, id: \.self) { idx in
                        let item = HealthStatus.presets[idx]
                        HealthToggleRow(
                            title: item.title,
                            isOn: Binding(
                                get: { draft.health[keyPath: item.key] },
                                set: { draft.health[keyPath: item.key] = $0 }
                            )
                        )
                    }
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Примечания (по желанию)")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.black.opacity(0.7))

                    TextEditor(text: $draft.health.notes)
                        .frame(minHeight: 110)
                        .padding(10)
                        .background(Color.white)
                        .cornerRadius(14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.black.opacity(0.08), lineWidth: 1)
                        )
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                Text("Это не медицинская диагностика. Просто настройки для персонализации.")
                    .font(.system(size: 13))
                    .foregroundColor(.black.opacity(0.5))

                Spacer(minLength: 12)
            }
            .padding(.top, 6)
        }
    }
}

private struct HealthToggleRow: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .stroke(Color.black.opacity(isOn ? 1 : 0.18), lineWidth: 2)
                        .frame(width: 24, height: 24)

                    if isOn {
                        Image(systemName: "checkmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.black)
                    }
                }

                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.black)

                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 14)
            .background(Color.white)
            .cornerRadius(14)
        }
        .buttonStyle(.plain)
    }
}
