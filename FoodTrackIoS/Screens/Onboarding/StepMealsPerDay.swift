import SwiftUI

struct StepMealsPerDay: View {
    @Binding var draft: OnboardingDraft

    private let options = [1, 2, 3, 4, 5, 6]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Приёмов пищи в день")
                .font(.system(size: 26, weight: .semibold))

            Text("Это поможет удобнее вести дневник.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(options, id: \.self) { n in
                    let selected = draft.mealsPerDay == n

                    Button {
                        draft.mealsPerDay = n
                    } label: {
                        Text("\(n)")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(selected ? .white : .black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(selected ? Color.black : Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: FTTheme.corner)
                                    .stroke(selected ? Color.black : FTTheme.border, lineWidth: 1)
                            )
                            .cornerRadius(FTTheme.corner)
                    }
                }
            }
            .padding(.top, 14)

            Text("Если иногда бывают перекусы — ничего страшного, можно добавлять отдельно.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 6)
        }
    }
}
