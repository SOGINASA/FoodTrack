import SwiftUI

struct StepBirthYearView: View {
    @Binding var draft: RegisterDraft

    private var yearRange: [Int] {
        let current = Calendar.current.component(.year, from: Date())
        let minYear = current - 90
        let maxYear = current - 10
        return Array((minYear...maxYear).reversed())
    }

    private var selectedYearIndex: Int {
        guard let y = draft.birthYear, let idx = yearRange.firstIndex(of: y) else { return 0 }
        return idx
    }

    private var hint: String {
        if draft.birthYear == nil { return "Выбери год" }
        return draft.isBirthYearValid ? "Ок" : "Странный год…"
    }

    private var hintColor: Color {
        if draft.birthYear == nil { return .black.opacity(0.45) }
        return draft.isBirthYearValid ? .green : .red
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Год рождения")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.black)

            Text("Нужно для корректных расчётов.")
                .font(.system(size: 15))
                .foregroundColor(.black.opacity(0.6))

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text(draft.birthYear.map(String.init) ?? "—")
                        .font(.system(size: 40, weight: .bold))
                    Spacer()
                    Text(hint)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(hintColor)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.black.opacity(0.06))
                        .cornerRadius(999)
                }

                Picker("Год", selection: Binding(
                    get: { draft.birthYear ?? yearRange.first! },
                    set: { draft.birthYear = $0 }
                )) {
                    ForEach(yearRange, id: \.self) { y in
                        Text(String(y)).tag(y)
                    }
                }
                .pickerStyle(.wheel)
                .frame(height: 180)
            }
            .padding(16)
            .background(Color.black.opacity(0.03))
            .cornerRadius(18)

            Spacer(minLength: 12)
        }
        .padding(.top, 6)
    }
}
