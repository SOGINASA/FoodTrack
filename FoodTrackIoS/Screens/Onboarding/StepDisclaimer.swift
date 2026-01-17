import SwiftUI

struct StepDisclaimer: View {
    @Binding var draft: OnboardingDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Важно перед началом")
                .font(.system(size: 26, weight: .semibold))

            Text("Пожалуйста, прочитайте и подтвердите.")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)

            FTCard {
                Text("FoodTrack предоставляет информационные расчёты и материалы, которые не являются медицинской консультацией, диагнозом или лечением.")
                    .font(.system(size: 14))
                    .foregroundColor(Color.black.opacity(0.78))

                Text("Вы используете приложение добровольно и принимаете ответственность за решения о питании и тренировках, а также за своё состояние здоровья.")
                    .font(.system(size: 14))
                    .foregroundColor(Color.black.opacity(0.78))

                Text("При наличии заболеваний, беременности, травм или медицинских ограничений рекомендуем обратиться к врачу.")
                    .font(.system(size: 14))
                    .foregroundColor(Color.black.opacity(0.78))
            }
            .padding(.top, 14)

            Button {
                draft.disclaimerAccepted.toggle()
            } label: {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: draft.disclaimerAccepted ? "checkmark.square.fill" : "square")
                        .font(.system(size: 20))
                        .foregroundColor(.black)

                    Text("Я прочитал(а) и согласен(на) с условиями. Понимаю, что команда разработчиков не несёт ответственности за моё здоровье.")
                        .font(.system(size: 14))
                        .foregroundColor(Color.black.opacity(0.78))
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.top, 12)
            }
            .buttonStyle(.plain)

            Text("Без подтверждения мы не можем продолжить.")
                .font(.system(size: 12))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 6)
        }
    }
}
