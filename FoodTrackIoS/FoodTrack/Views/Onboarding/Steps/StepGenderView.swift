import SwiftUI

struct StepGenderView: View {
    @Binding var draft: RegisterDraft

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 14) {
                Text("Пол")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Нужно для более точных рекомендаций.")
                    .font(.system(size: 15))
                    .foregroundColor(.black.opacity(0.6))

                VStack(spacing: 12) {
                    ForEach(Gender.allCases) { g in
                        SelectRow(
                            title: g.title,
                            isSelected: draft.gender == g,
                            onTap: { draft.gender = g }
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

private struct SelectRow: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .stroke(Color.black.opacity(isSelected ? 1 : 0.25), lineWidth: 2)
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(Color.black)
                            .frame(width: 12, height: 12)
                    }
                }

                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.black)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.black.opacity(0.35))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 14)
            .background(Color.white)
            .cornerRadius(14)
        }
        .buttonStyle(.plain)
    }
}
