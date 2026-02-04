import SwiftUI

enum FTTheme {
    // MARK: - Adaptive Base Colors (auto light/dark)

    static let bg          = Color(.systemBackground)
    static let secondaryBg = Color(.secondarySystemBackground)
    static let text        = Color(.label)
    static let muted       = Color(.secondaryLabel)
    static let border      = Color(.separator)
    static let card        = Color(.secondarySystemBackground)
    static let elevated    = Color(.tertiarySystemBackground)
    static let fill        = Color(.systemFill)

    /// Primary tint — used for buttons, active tab, accents
    static let tint        = Color(.label)

    // MARK: - Accent (macros — work in both modes)

    static let protein = Color(red: 1.0, green: 0.42, blue: 0.42)   // #FF6B6B
    static let carbs   = Color(red: 1.0, green: 0.72, blue: 0.30)   // #FFB84D
    static let fats    = Color(red: 0.30, green: 0.62, blue: 1.0)   // #4D9FFF
    static let success = Color(red: 0.22, green: 0.78, blue: 0.45)  // green

    // MARK: - Layout

    static let corner: CGFloat = 18
    static let hPad: CGFloat = 18
}
