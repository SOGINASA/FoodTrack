import SwiftUI

struct MealCard: View {
    let meal: Meal

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.black.opacity(0.06))
                    .frame(width: 54, height: 54)
                Text(meal.emoji)
                    .font(.system(size: 24))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(meal.name)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.black)

                Text("\(meal.calories) ккал • Б \(meal.protein) • У \(meal.carbs) • Ж \(meal.fats)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.black.opacity(0.55))
            }

            Spacer()
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        )
    }
}
