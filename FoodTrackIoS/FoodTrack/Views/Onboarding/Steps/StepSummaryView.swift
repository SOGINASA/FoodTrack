import SwiftUI

struct StepSummaryView: View {
    let draft: RegisterDraft

    private var genderText: String { draft.gender?.title ?? "—" }
    private var birthYearText: String { draft.birthYear.map(String.init) ?? "—" }
    private var heightText: String { draft.heightCm.map { "\($0) см" } ?? "—" }
    private var weightText: String { draft.weightKg.map { formatKg($0) } ?? "—" }
    private var targetText: String { draft.targetWeightKg.map { formatKg($0) } ?? "—" }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Проверка")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Смотри — всё ли верно. Потом можно будет поменять в настройках.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 10) {
                    SummaryRow(title: "Ник/почта", value: draft.identity.isEmpty ? "—" : draft.identity)
                    SummaryRow(title: "Пол", value: genderText)
                    SummaryRow(title: "Тренировок/нед", value: "\(draft.workoutsPerWeek)")
                    SummaryRow(title: "Диета", value: draft.diet.title)
                    SummaryRow(title: "Год рождения", value: birthYearText)
                    SummaryRow(title: "Рост", value: heightText)
                    SummaryRow(title: "Вес", value: weightText)
                    SummaryRow(title: "Цель", value: targetText)
                    SummaryRow(title: "Питание/день", value: "\(draft.mealsPerDay)")
                    SummaryRow(title: "Условия", value: draft.disclaimerAccepted ? "Приняты" : "Не приняты")
                }
                .padding(16)
                .background(Color.black.opacity(0.03))
                .cornerRadius(18)

                if !draft.isReadyToFinish {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Не всё заполнено")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.red)

                        Text("Проверь поля: аккаунт, пол, год рождения, параметры тела и принятие условий.")
                            .font(.system(size: 13))
                            .foregroundColor(.black.opacity(0.6))
                    }
                    .padding(16)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(18)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Готово")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.green)

                        Text("Нажимай «Завершить».")
                            .font(.system(size: 13))
                            .foregroundColor(.black.opacity(0.6))
                    }
                    .padding(16)
                    .background(Color.green.opacity(0.08))
                    .cornerRadius(18)
                }

                Spacer(minLength: 12)
            }
            .padding(.top, 6)
        }
    }

    private func formatKg(_ v: Double) -> String {
        let s = String(format: "%.2f", v)
        if s.hasSuffix("00") { return "\(String(s.dropLast(3))) кг" }
        if s.hasSuffix("0") { return "\(String(s.dropLast(1))) кг" }
        return "\(s) кг"
    }
}

private struct SummaryRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.black.opacity(0.55))
                .frame(width: 120, alignment: .leading)

            Text(value)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.white)
        .cornerRadius(14)
    }
}
