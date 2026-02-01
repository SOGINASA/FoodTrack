import Foundation
import SwiftUI

@MainActor
final class AppState: ObservableObject {
    enum Route { case auth, onboarding, main }

    @Published var route: Route = .auth
    @Published var isLoading: Bool = true
    @Published var user: UserDTO?
    @Published var goals: GoalsDTO?

    init() {
        Task { await bootstrap() }
    }

    // MARK: - Bootstrap

    private func bootstrap() async {
        guard KeychainHelper.read("access_token") != nil else {
            isLoading = false
            return
        }
        do {
            let me = try await APIClient.shared.getMe()
            user = me
            if me.onboarding_completed == true {
                route = .main
                await loadGoals()
            } else {
                route = .onboarding
            }
        } catch {
            KeychainHelper.deleteAll()
            route = .auth
        }
        isLoading = false
    }

    // MARK: - Auth

    func login(identifier: String, password: String) async throws {
        let resp = try await APIClient.shared.login(AuthRequest(identifier: identifier, password: password))
        user = resp.user
        if resp.user.onboarding_completed == true {
            route = .main
            await loadGoals()
        } else {
            route = .onboarding
        }
    }

    func register(identifier: String, password: String) async throws {
        let resp = try await APIClient.shared.register(AuthRequest(identifier: identifier, password: password))
        user = resp.user
        route = .onboarding
    }

    func logout() {
        KeychainHelper.deleteAll()
        user = nil
        goals = nil
        route = .auth
    }

    // MARK: - Onboarding

    func completeOnboarding(_ draft: OnboardingDraft) async throws {
        let req = OnboardingRequest(
            gender: draft.gender,
            birth_year: Int(draft.birthYear) ?? 2000,
            height_cm: Double(draft.heightCm) ?? 170,
            weight_kg: Double(draft.weightKg) ?? 70,
            target_weight_kg: Double(draft.targetWeightKg) ?? 70,
            diet: draft.diet,
            diet_notes: draft.dietNotes,
            health_flags: Array(draft.healthFlags),
            health_notes: draft.healthNotes,
            meals_per_day: draft.mealsPerDay,
            workouts_per_week: draft.workoutsPerWeek
        )
        try await APIClient.shared.completeOnboarding(req)
        user = try? await APIClient.shared.getMe()
        await loadGoals()
        route = .main
    }

    // MARK: - Goals

    func loadGoals() async {
        goals = try? await APIClient.shared.getGoals()
    }

    // MARK: - Refresh user

    func refreshUser() async {
        user = try? await APIClient.shared.getMe()
    }
}
