import SwiftUI

struct AddMealView: View {
    @EnvironmentObject private var mealVM: MealViewModel
    @State private var name: String = ""
    @State private var calories: String = ""
    @State private var protein: String = ""
    @State private var carbs: String = ""
    @State private var fats: String = ""

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    HStack {
                        Text("Добавить")
                            .font(.system(size: 32, weight: .bold))
                        Spacer()
                    }

                    CardView {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Быстрое добавление (демо)")
                                .font(.system(size: 16, weight: .bold))

                            AuthTextField(title: "Название", placeholder: "например: Омлет", text: $name)
                            NumberTextField(title: "Калории", placeholder: "250", text: $calories)
                            HStack(spacing: 10) {
                                NumberTextField(title: "Белки", placeholder: "20", text: $protein)
                                NumberTextField(title: "Углеводы", placeholder: "10", text: $carbs)
                                NumberTextField(title: "Жиры", placeholder: "12", text: $fats)
                            }

                            PrimaryButton(title: "Добавить") {
                                mealVM.addDemoMeal(
                                    name: name,
                                    calories: Int(calories) ?? 0,
                                    protein: Int(protein) ?? 0,
                                    carbs: Int(carbs) ?? 0,
                                    fats: Int(fats) ?? 0
                                )
                                name = ""; calories = ""; protein = ""; carbs = ""; fats = ""
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
