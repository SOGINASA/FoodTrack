import Foundation
import UIKit

actor APIClient {
    static let shared = APIClient()

    // Change this to your backend URL
    private let baseURL = "https://korolevst.supertest.beast-inside.kz/foodtrack_api/api"
    private let predictionURL = "https://korolevst.supertest.beast-inside.kz/food_predict/predict/with-nutrition"

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        return e
    }()

    // MARK: - Auth

    func login(_ req: AuthRequest) async throws -> AuthResponse {
        let resp: AuthResponse = try await post("/auth/login", body: req, auth: false)
        KeychainHelper.save(resp.access_token, for: "access_token")
        KeychainHelper.save(resp.refresh_token, for: "refresh_token")
        return resp
    }

    func register(_ req: AuthRequest) async throws -> AuthResponse {
        let resp: AuthResponse = try await post("/auth/register", body: req, auth: false)
        KeychainHelper.save(resp.access_token, for: "access_token")
        KeychainHelper.save(resp.refresh_token, for: "refresh_token")
        return resp
    }

    func getMe() async throws -> UserDTO {
        let resp: MeResponse = try await get("/auth/me")
        guard let user = resp.resolvedUser else {
            throw APIError.invalidData
        }
        return user
    }

    func completeOnboarding(_ req: OnboardingRequest) async throws {
        let _: MessageResponse = try await post("/auth/onboarding", body: req)
    }

    func updateProfile(_ req: ProfileUpdateRequest) async throws -> UserDTO {
        let resp: MeResponse = try await put("/auth/profile", body: req)
        guard let user = resp.resolvedUser else {
            throw APIError.invalidData
        }
        return user
    }

    // MARK: - Meals

    func getMeals(date: String? = nil) async throws -> [MealDTO] {
        var path = "/meals"
        if let date { path += "?date=\(date)" }
        let resp: MealsResponse = try await get(path)
        return resp.meals
    }

    func getTodayMeals() async throws -> [MealDTO] {
        let resp: MealsResponse = try await get("/meals/today")
        return resp.meals
    }

    func createMeal(_ req: CreateMealRequest) async throws -> MealDTO {
        struct Resp: Decodable { let meal: MealDTO }
        let resp: Resp = try await post("/meals", body: req)
        return resp.meal
    }

    func updateMeal(_ id: Int, _ req: UpdateMealRequest) async throws -> MealDTO {
        struct Resp: Decodable { let meal: MealDTO }
        let resp: Resp = try await put("/meals/\(id)", body: req)
        return resp.meal
    }

    func deleteMeal(_ id: Int) async throws {
        let _: MessageResponse = try await delete("/meals/\(id)")
    }

    // MARK: - Goals

    func getGoals() async throws -> GoalsDTO {
        let resp: GoalsResponse = try await get("/goals")
        return resp.goals
    }

    func updateGoals(_ req: UpdateGoalsRequest) async throws -> GoalsDTO {
        struct Resp: Decodable { let goals: GoalsDTO }
        let resp: Resp = try await put("/goals", body: req)
        return resp.goals
    }

    // MARK: - Weight Tracking

    func getWeightHistory(days: Int = 90) async throws -> WeightHistoryResponse {
        try await get("/goals/weight?days=\(days)")
    }

    func addWeight(_ req: AddWeightRequest) async throws -> WeightEntryDTO {
        let resp: AddWeightResponse = try await post("/goals/weight", body: req)
        return resp.entry
    }

    func deleteWeight(_ id: Int) async throws {
        let _: MessageResponse = try await delete("/goals/weight/\(id)")
    }

    // MARK: - Analytics

    func getDailyStats(date: String) async throws -> DailyStatsDTO {
        try await get("/analytics/daily?date=\(date)")
    }

    func getWeeklyStats() async throws -> WeeklyStatsDTO {
        try await get("/analytics/weekly")
    }

    func getStreak() async throws -> StreakDTO {
        try await get("/analytics/streak")
    }

    func getTopFoods(days: Int = 30, limit: Int = 5) async throws -> [TopFoodDTO] {
        let resp: TopFoodsResponse = try await get("/analytics/top-foods?days=\(days)&limit=\(limit)")
        return resp.top_foods
    }

    // MARK: - Password

    func changePassword(_ req: ChangePasswordRequest) async throws {
        let _: MessageResponse = try await post("/auth/change-password", body: req)
    }

    // MARK: - Recipes

    func getRecipes() async throws -> [RecipeDTO] {
        let resp: RecipesResponse = try await get("/recipes")
        return resp.recipes
    }

    // MARK: - Photo Analysis

    func analyzePhoto(_ image: UIImage) async throws -> FoodPrediction {
        guard let data = image.jpegData(compressionQuality: 0.85) else {
            throw APIError.invalidData
        }

        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: predictionURL)!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (responseData, resp) = try await URLSession.shared.data(for: request)

        guard let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw APIError.serverError
        }

        return try decoder.decode(FoodPrediction.self, from: responseData)
    }

    // MARK: - Generic HTTP

    private func get<T: Decodable>(_ path: String, auth: Bool = true) async throws -> T {
        let request = try buildRequest(path: path, method: "GET", auth: auth)
        return try await perform(request)
    }

    private func post<T: Decodable, B: Encodable>(_ path: String, body: B, auth: Bool = true) async throws -> T {
        var request = try buildRequest(path: path, method: "POST", auth: auth)
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await perform(request)
    }

    private func put<T: Decodable, B: Encodable>(_ path: String, body: B, auth: Bool = true) async throws -> T {
        var request = try buildRequest(path: path, method: "PUT", auth: auth)
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await perform(request)
    }

    private func delete<T: Decodable>(_ path: String, auth: Bool = true) async throws -> T {
        let request = try buildRequest(path: path, method: "DELETE", auth: auth)
        return try await perform(request)
    }

    private func buildRequest(path: String, method: String, auth: Bool) throws -> URLRequest {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 15

        if auth, let token = KeychainHelper.read("access_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        #if DEBUG
        print("[API] \(request.httpMethod ?? "?") \(request.url?.absoluteString ?? "?")")
        #endif

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.serverError
        }

        #if DEBUG
        print("[API] Status: \(http.statusCode)")
        if let body = String(data: data, encoding: .utf8)?.prefix(500) {
            print("[API] Body: \(body)")
        }
        #endif

        if http.statusCode == 401 {
            // Try refresh
            if let refreshed = try? await refreshToken() {
                var retryReq = request
                retryReq.setValue("Bearer \(refreshed)", forHTTPHeaderField: "Authorization")
                let (retryData, retryResp) = try await URLSession.shared.data(for: retryReq)
                guard let retryHTTP = retryResp as? HTTPURLResponse, (200...299).contains(retryHTTP.statusCode) else {
                    throw APIError.unauthorized
                }
                return try decoder.decode(T.self, from: retryData)
            }
            throw APIError.unauthorized
        }

        guard (200...299).contains(http.statusCode) else {
            if let msg = try? decoder.decode(MessageResponse.self, from: data) {
                throw APIError.message(msg.error ?? msg.message ?? "Unknown error")
            }
            let bodyStr = String(data: data, encoding: .utf8) ?? ""
            throw APIError.message("HTTP \(http.statusCode): \(bodyStr.prefix(200))")
        }

        return try decoder.decode(T.self, from: data)
    }

    private func refreshToken() async throws -> String? {
        guard let refreshToken = KeychainHelper.read("refresh_token") else { return nil }

        let req = RefreshRequest(refresh_token: refreshToken)
        var request = URLRequest(url: URL(string: baseURL + "/auth/refresh")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(req)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { return nil }
        let resp = try decoder.decode(RefreshResponse.self, from: data)
        KeychainHelper.save(resp.access_token, for: "access_token")
        return resp.access_token
    }
}

// MARK: - Errors

enum APIError: LocalizedError {
    case invalidURL
    case invalidData
    case serverError
    case unauthorized
    case message(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidData: return "Invalid data"
        case .serverError: return "Server error"
        case .unauthorized: return "Session expired"
        case .message(let msg): return msg
        }
    }
}
