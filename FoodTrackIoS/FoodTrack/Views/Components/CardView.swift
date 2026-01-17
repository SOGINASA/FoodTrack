import SwiftUI

struct CardView<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack {
            content
        }
        .padding(16)
        .background(Color.black.opacity(0.03))
        .cornerRadius(22)
    }
}
