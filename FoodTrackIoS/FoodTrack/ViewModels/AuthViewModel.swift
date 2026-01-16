import Foundation

final class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var currentUser: User? = nil

    func login(identity: String, password: String, completion: @escaping (Bool, String?) -> Void) {
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            guard let self else { return }
            self.isLoading = false
            let trimmed = identity.trimmingCharacters(in: .whitespacesAndNewlines)
            if trimmed.isEmpty {
                completion(false, "Введите ник или почту")
                return
            }
            self.currentUser = User(displayName: trimmed, email: Validators.isValidEmail(trimmed) ? trimmed : nil)
            self.isAuthenticated = true
            completion(true, nil)
        }
    }

    func finishRegistration(draft: RegisterDraft) {
        guard draft.isReadyToFinish else { return }
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { [weak self] in
            guard let self else { return }
            self.isLoading = false
            let name = draft.identity.trimmingCharacters(in: .whitespacesAndNewlines)
            self.currentUser = User(displayName: name, email: Validators.isValidEmail(name) ? name : nil)
            self.isAuthenticated = true
        }
    }

    func logout() {
        currentUser = nil
        isAuthenticated = false
    }
}
