import SwiftUI

struct StepMealsPerDayView: View {
    @Binding var draft: RegisterDraft

    private var subtitle: String {
        switch draft.mealsPerDay {
        case 1: return "Редко"
        case 2...3: return "Обычно"
        case 4...5: return "Часто"
        default: return "Очень часто"
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Сколько раз в день питаешься?")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Примерно. Никто не будет считать твои крошки.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("\(draft.mealsPerDay)")
                            .font(.system(size: 40, weight: .bold))
                        Text("раз(а)")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.black.opacity(0.6))
                        Spacer()
                        Text(subtitle)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.black.opacity(0.6))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.black.opacity(0.06))
                            .cornerRadius(999)
                    }

                    Slider(value: Binding(
                        get: { Double(draft.mealsPerDay) },
                        set: { draft.mealsPerDay = Int($0.rounded()) }
                    ), in: 1...8, step: 1)
                    .tint(.black)

                    HStack {
                        Text("1")
                        Spacer()
                        Text("8")
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.black.opacity(0.45))
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                Spacer(minLength: 12)
            }
            .padding(.top, 6)
        }
    }
}
