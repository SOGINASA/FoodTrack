import SwiftUI

struct StepWorkouts: View {
    @Binding var draft: OnboardingDraft

    private let options: [(Int, String)] = [
        (0, "0"),
        (1, "1–2"),
        (3, "3–4"),
        (5, "5–6"),
        (7, "7+")
    ]

    private func isSelected(_ value: Int) -> Bool {
        draft.workoutsPerWeek == value
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Тренировки в неделю")
                .font(.system(size: 26, weight: .semibold))

            Text("Это помогает точнее рассчитать вашу дневную норму.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            VStack(spacing: 12) {
                ForEach(options, id: \.0) { value, label in
                    OptionRow(title: label, selected: isSelected(value)) {
                        draft.workoutsPerWeek = value
                    }
                }
            }
            .padding(.top, 14)

            Text("Под тренировками понимаются любые активности: зал, бег, футбол, домашние упражнения и т.д.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 6)
        }
    }
}
