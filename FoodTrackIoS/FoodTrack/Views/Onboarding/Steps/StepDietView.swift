import SwiftUI

struct StepDietView: View {
    @Binding var draft: RegisterDraft

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Есть диета?")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Выбери вариант — можно “Нет”.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 12) {
                    ForEach(DietType.allCases) { d in
                        SelectRow(
                            title: d.title,
                            isSelected: draft.diet == d,
                            onTap: { draft.diet = d }
                        )
                    }
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
