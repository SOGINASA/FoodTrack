import SwiftUI

struct FTCard<Content: View>: View {
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(16)
        .background(FTTheme.card)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }
}
