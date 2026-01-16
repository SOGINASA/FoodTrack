import SwiftUI

struct WeeklyMiniCalendarView: View {
    private let calendar = Calendar.current

    var body: some View {
        let today = Date()
        let start = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) ?? today
        let days = (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }

        return HStack(spacing: 10) {
            ForEach(days, id: \.self) { day in
                let isToday = calendar.isDate(day, inSameDayAs: today)
                VStack(spacing: 6) {
                    Text(shortWeekday(day))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.black.opacity(0.55))
                        .textCase(.uppercase)

                    Text("\(calendar.component(.day, from: day))")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(isToday ? .white : .black.opacity(0.7))
                        .frame(width: 40, height: 40)
                        .background(isToday ? Color.black : Color.black.opacity(0.05))
                        .cornerRadius(999)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(16)
        .background(Color.black.opacity(0.03))
        .cornerRadius(22)
    }

    private func shortWeekday(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "EE"
        return f.string(from: date)
    }
}
