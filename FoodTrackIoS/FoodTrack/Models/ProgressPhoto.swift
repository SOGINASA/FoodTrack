import Foundation

struct ProgressPhoto: Identifiable, Codable {
    let id: UUID
    var date: Date
    var localPath: String?
}
