import SwiftUI

struct StepDisclaimerView: View {
    @Binding var draft: RegisterDraft

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Важно")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Небольшая юридическая реальность. Без неё никак.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(alignment: .leading, spacing: 12) {
                    Text("""
                    Приложение носит информационный характер и не является медицинской услугой.
                    Команда разработчиков не несёт ответственности за ваше здоровье.
                    Используя приложение, вы действуете добровольно и берёте ответственность на себя.
                    При сомнениях или хронических состояниях — консультируйтесь с врачом.
                    """)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.black.opacity(0.75))
                    .fixedSize(horizontal: false, vertical: true)

                    Button(action: { draft.disclaimerAccepted.toggle() }) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 7)
                                    .stroke(Color.black.opacity(draft.disclaimerAccepted ? 1 : 0.18), lineWidth: 2)
                                    .frame(width: 24, height: 24)

                                if draft.disclaimerAccepted {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.black)
                                }
                            }

                            Text("Я понимаю и принимаю условия")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)

                            Spacer()
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color.white)
                        .cornerRadius(14)
                    }
                    .buttonStyle(.plain)

                    if !draft.disclaimerAccepted {
                        Text("Без галочки дальше нельзя. Да, это скучно. Но безопасно.")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.red)
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
