import SwiftUI

struct StepDiet: View {
    @Binding var draft: OnboardingDraft

    private let options: [(String, String)] = [
        ("none", "Нет"),
        ("keto", "Кето"),
        ("vegetarian", "Вегетарианство"),
        ("vegan", "Веганство"),
        ("halal", "Халяль"),
        ("lowcarb", "Низкоуглеводная"),
        ("custom", "Другое")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Диета сейчас")
                .font(.system(size: 26, weight: .semibold))

            Text("Выберите, если уже придерживаетесь какого-то режима питания.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            VStack(spacing: 12) {
                ForEach(options, id: \.0) { key, label in
                    OptionRow(title: label, selected: draft.diet == key) {
                        draft.diet = key
                        if key != "custom" {
                            draft.dietNotes = ""
                        }
                    }
                }
            }
            .padding(.top, 14)

            if draft.diet == "custom" {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Опишите кратко (необязательно)")
                        .font(.system(size: 14, weight: .medium))

                    TextField("Например: без сахара, ИГ и т.д.", text: $draft.dietNotes)
                        .font(.system(size: 16))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 12)
                        .background(FTTheme.elevated)
                        .overlay(
                            RoundedRectangle(cornerRadius: FTTheme.corner)
                                .stroke(FTTheme.border, lineWidth: 1)
                        )

                    Text("Это поможет точнее подстраивать советы и аналитику.")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                .padding(.top, 14)
            }
        }
    }
}
