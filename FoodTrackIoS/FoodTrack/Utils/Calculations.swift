import Foundation

enum Calculations {
    static func clamp<T: Comparable>(_ value: T, _ minV: T, _ maxV: T) -> T {
        min(max(value, minV), maxV)
    }
}
