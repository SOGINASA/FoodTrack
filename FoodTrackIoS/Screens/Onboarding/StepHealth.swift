import SwiftUI

struct StepHealth: View {
    @Binding var draft: OnboardingDraft

    private let flags: [(String, String)] = [
        ("none", "Нет особенностей"),
        ("diabetes", "Диабет"),
        ("hypertension", "Повышенное давление"),
        ("gi", "Проблемы ЖКТ"),
        ("allergy", "Аллергии / непереносимость"),
        ("other", "Другое")
    ]

    private func isSelected(_ key: String) -> Bool {
        draft.healthFlags.contains(key)
    }

    private func toggle(_ key: String) {
        // "none" взаимоисключает остальные
        if key == "none" {
            if isSelected("none") {
                draft.healthFlags.remove("none")
            } else {
                draft.healthFlags = ["none"]
                draft.healthNotes = ""
            }
            return
        }

        // Если был выбран none, убираем
        if isSelected("none") {
            draft.healthFlags.remove("none")
        }

        if isSelected(key) {
            draft.healthFlags.remove(key)
            if key == "other" { draft.healthNotes = "" }
        } else {
            draft.healthFlags.insert(key)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Состояние здоровья")
                .font(.system(size: 26, weight: .semibold))

            Text("Это нужно для более безопасных подсказок. Можно пропустить.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            VStack(spacing: 12) {
                ForEach(flags, id: \.0) { key, label in
                    OptionRow(title: label, selected: isSelected(key)) {
                        toggle(key)
                    }
                }
            }
            .padding(.top, 14)

            if isSelected("other") && !isSelected("none") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Уточните (необязательно)")
                        .font(.system(size: 14, weight: .medium))

                    TextField("Например: астма, гастрит, противопоказания…", text: $draft.healthNotes)
                        .font(.system(size: 16))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 12)
                        .background(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: FTTheme.corner)
                                .stroke(FTTheme.border, lineWidth: 1)
                        )

                    Text("Мы не заменяем врача. Эти данные нужны только для корректности подсказок.")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                .padding(.top, 14)
            }
        }
    }
}
