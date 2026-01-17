import SwiftUI

struct DiaryView: View {
    @EnvironmentObject private var mealVM: MealViewModel

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    HStack {
                        Text("Дневник")
                            .font(.system(size: 32, weight: .bold))
                        Spacer()
                    }

                    CardView {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Сегодняшние приёмы пищи")
                                .font(.system(size: 16, weight: .bold))

                            if mealVM.todayMeals.isEmpty {
                                Text("Пока пусто. Добавь первый приём пищи.")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.black.opacity(0.55))
                            } else {
                                VStack(spacing: 10) {
                                    ForEach(mealVM.todayMeals) { meal in
                                        MealCard(meal: meal)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(Color.white)
        }
    }
}
