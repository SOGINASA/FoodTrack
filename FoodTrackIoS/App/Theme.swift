import SwiftUI

enum FTTheme {
    // Base
    static let bg = Color.white
    static let text = Color.black
    static let muted = Color.gray.opacity(0.65)
    static let border = Color.gray.opacity(0.18)
    static let card = Color.white

    // Accent (macros like the web app)
    static let protein = Color(red: 1.0, green: 0.42, blue: 0.42)   // #FF6B6B
    static let carbs   = Color(red: 1.0, green: 0.72, blue: 0.30)   // #FFB84D
    static let fats    = Color(red: 0.30, green: 0.62, blue: 1.0)   // #4D9FFF
    static let success = Color(red: 0.22, green: 0.78, blue: 0.45)  // green

    // Sizes
    static let corner: CGFloat = 18
    static let hPad: CGFloat = 18
}
