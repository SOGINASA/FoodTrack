import SwiftUI

struct StepGender: View {
    @Binding var draft: OnboardingDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Ваш пол")
                .font(.system(size: 26, weight: .semibold))
            Text("Это помогает точнее подобрать дневные цели.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            VStack(spacing: 12) {
                OptionRow(title: "Мужской", selected: draft.gender == "male") {
                    draft.gender = "male"
                }
                OptionRow(title: "Женский", selected: draft.gender == "female") {
                    draft.gender = "female"
                }
                OptionRow(title: "Не хочу указывать", selected: draft.gender == "na") {
                    draft.gender = "na"
                }
            }
            .padding(.top, 14)
        }
    }
}
