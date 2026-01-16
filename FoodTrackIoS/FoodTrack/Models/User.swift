import Foundation

struct User: Identifiable, Codable {
    let id: UUID
    var displayName: String
    var email: String?

    init(id: UUID = UUID(), displayName: String, email: String? = nil) {
        self.id = id
        self.displayName = displayName
        self.email = email
    }
}
