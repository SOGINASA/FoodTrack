import SwiftUI

struct StepWorkoutsView: View {
    @Binding var draft: RegisterDraft

    private var label: String {
        switch draft.workoutsPerWeek {
        case 0: return "Пока без тренировок"
        case 1...2: return "Редко"
        case 3...4: return "Нормально"
        case 5...6: return "Часто"
        default: return "Очень активно"
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Тренировки в неделю")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Сколько примерно тренировок делаешь за 7 дней?")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("\(draft.workoutsPerWeek)")
                            .font(.system(size: 40, weight: .bold))
                        Text("раз(а)")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.black.opacity(0.6))
                        Spacer()
                        Text(label)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.black.opacity(0.6))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.black.opacity(0.06))
                            .cornerRadius(999)
                    }

                    Slider(value: Binding(
                        get: { Double(draft.workoutsPerWeek) },
                        set: { draft.workoutsPerWeek = Int($0.rounded()) }
                    ), in: 0...14, step: 1)
                    .tint(.black)

                    HStack {
                        Text("0")
                        Spacer()
                        Text("14")
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
