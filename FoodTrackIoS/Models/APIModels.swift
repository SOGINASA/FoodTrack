import Foundation

// MARK: - Auth

struct AuthRequest: Encodable {
    let identifier: String
    let password: String
}

struct AuthResponse: Decodable {
    let user: UserDTO
    let access_token: String
    let refresh_token: String
}

struct RefreshRequest: Encodable {
    let refresh_token: String
}

struct RefreshResponse: Decodable {
    let access_token: String
}

// MARK: - User

struct UserDTO: Decodable, Identifiable {
    let id: Int
    let email: String?
    let nickname: String?
    let full_name: String?
    let gender: String?
    let birth_year: Int?
    let height_cm: Double?
    let weight_kg: Double?
    let target_weight_kg: Double?
    let workouts_per_week: Int?
    let diet: String?
    let diet_notes: String?
    let meals_per_day: Int?
    let health_flags: [String]?
    let health_notes: String?
    let onboarding_completed: Bool?
    let avatar: String?

    var displayName: String {
        full_name ?? nickname ?? email ?? "User"
    }

    var initials: String {
        let name = displayName
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

struct MeResponse: Decodable {
    let data: MeResponseData?
    let user: UserDTO?

    struct MeResponseData: Decodable {
        let user: UserDTO
    }

    var resolvedUser: UserDTO? {
        data?.user ?? user
    }
}

struct ProfileUpdateRequest: Encodable {
    var full_name: String?
    var nickname: String?
    var gender: String?
    var birth_year: Int?
    var height_cm: Double?
    var weight_kg: Double?
    var target_weight_kg: Double?
    var workouts_per_week: Int?
    var diet: String?
    var diet_notes: String?
    var meals_per_day: Int?
    var health_flags: [String]?
    var health_notes: String?
}

struct ChangePasswordRequest: Encodable {
    let current_password: String
    let new_password: String
}

// MARK: - Onboarding

struct OnboardingRequest: Encodable {
    let gender: String
    let birth_year: Int
    let height_cm: Double
    let weight_kg: Double
    let target_weight_kg: Double
    let diet: String
    let diet_notes: String
    let health_flags: [String]
    let health_notes: String
    let meals_per_day: Int
    let workouts_per_week: Int
}

// MARK: - Meals

struct MealDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let meal_type: String?
    let meal_date: String?
    let meal_time: String?
    let calories: Double?
    let protein: Double?
    let carbs: Double?
    let fats: Double?
    let portions: Double?
    let image_url: String?
    let ai_confidence: Double?
    let health_score: Double?
    let ai_advice: String?
    let tags: [String]?
    let ingredients: [MealIngredientDTO]?

    var mealType: MealType {
        MealType(rawValue: meal_type ?? "") ?? .snack
    }

    var displayCalories: Int { Int(calories ?? 0) }
    var displayProtein: Int { Int(protein ?? 0) }
    var displayCarbs: Int { Int(carbs ?? 0) }
    var displayFats: Int { Int(fats ?? 0) }
}

struct MealIngredientDTO: Decodable, Identifiable {
    let id: Int?
    let name: String
    let amount: String?
    let calories: Double?

    enum CodingKeys: String, CodingKey {
        case id, name, amount, calories
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(Int.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        amount = try c.decodeIfPresent(String.self, forKey: .amount)
        calories = try c.decodeIfPresent(Double.self, forKey: .calories)
    }
}

enum MealType: String, CaseIterable {
    case breakfast, lunch, dinner, snack

    var title: String {
        switch self {
        case .breakfast: return "Завтрак"
        case .lunch: return "Обед"
        case .dinner: return "Ужин"
        case .snack: return "Перекус"
        }
    }

    var icon: String {
        switch self {
        case .breakfast: return "sunrise"
        case .lunch: return "sun.max"
        case .dinner: return "moon"
        case .snack: return "cup.and.saucer"
        }
    }
}

struct CreateMealRequest: Encodable {
    let name: String
    let meal_type: String
    let calories: Double
    let protein: Double
    let carbs: Double
    let fats: Double
    let portions: Double
    let ai_confidence: Double?
    let health_score: Double?
    let ai_advice: String?
    let tags: [String]?
}

struct UpdateMealRequest: Encodable {
    var name: String?
    var type: String?
    var calories: Double?
    var protein: Double?
    var carbs: Double?
    var fats: Double?
    var portions: Double?
}

struct MealsResponse: Decodable {
    let meals: [MealDTO]
}

// MARK: - Goals

struct GoalsDTO: Decodable {
    let calories_goal: Int?
    let protein_goal: Int?
    let carbs_goal: Int?
    let fats_goal: Int?
    let target_weight: Double?
    let activity_level: String?
    let goal_type: String?
    let diet_type: String?

    var caloriesGoal: Int { calories_goal ?? 2100 }
    var proteinGoal: Int { protein_goal ?? 140 }
    var carbsGoal: Int { carbs_goal ?? 220 }
    var fatsGoal: Int { fats_goal ?? 70 }
}

struct GoalsResponse: Decodable {
    let goals: GoalsDTO
}

struct UpdateGoalsRequest: Encodable {
    var calories_goal: Int?
    var protein_goal: Int?
    var carbs_goal: Int?
    var fats_goal: Int?
    var target_weight: Double?
    var activity_level: String?
    var diet_type: String?
}

// MARK: - Weight Tracking

struct WeightEntryDTO: Decodable, Identifiable {
    let id: Int
    let weight: Double
    let date: String?
    let notes: String?
    let created_at: String?
}

struct WeightHistoryResponse: Decodable {
    let entries: [WeightEntryDTO]
    let stats: WeightStats?
    let count: Int?

    struct WeightStats: Decodable {
        let current: Double?
        let min: Double?
        let max: Double?
        let avg: Double?
        let change: Double?
    }
}

struct AddWeightRequest: Encodable {
    let weight: Double
    let date: String?
    let notes: String?
}

struct AddWeightResponse: Decodable {
    let message: String?
    let entry: WeightEntryDTO
}

// MARK: - Analytics

// Backend returns: {date, totals: {calories, protein, carbs, fats, meals_count}, goals, progress, remaining}
struct DailyStatsDTO: Decodable {
    let date: String?
    let totals: DailyTotals?
    let progress: DailyProgress?

    struct DailyTotals: Decodable {
        let calories: Double?
        let protein: Double?
        let carbs: Double?
        let fats: Double?
        let meals_count: Int?
    }

    struct DailyProgress: Decodable {
        let calories: Double?
        let protein: Double?
        let carbs: Double?
        let fats: Double?
    }

    var total_calories: Double { totals?.calories ?? 0 }
    var total_protein: Double { totals?.protein ?? 0 }
    var total_carbs: Double { totals?.carbs ?? 0 }
    var total_fats: Double { totals?.fats ?? 0 }
    var meals_count: Int { totals?.meals_count ?? 0 }
}

// Backend returns: {start_date, end_date, daily: [...], summary: {...}}
struct WeeklyStatsDTO: Decodable {
    let daily: [DailyEntry]?
    let summary: WeeklySummary?

    struct DailyEntry: Decodable, Identifiable {
        let date: String
        let calories: Double?
        let meals_count: Int?
        var id: String { date }
    }

    struct WeeklySummary: Decodable {
        let avg_calories: Double?
        let days_with_goal: Int?
        let total_meals: Int?
    }
}

// Backend returns flat: {current_streak, longest_streak, total_days_tracked}
struct StreakDTO: Decodable {
    let current_streak: Int?
    let longest_streak: Int?
    let total_days_tracked: Int?
}

struct TopFoodDTO: Decodable {
    let name: String
    let count: Int
    let avg_calories: Double?
    let total_calories: Double?
}

struct TopFoodsResponse: Decodable {
    let top_foods: [TopFoodDTO]
    let period_days: Int?
}

// MARK: - Recipes

struct RecipeDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let instructions: String?
    let image_url: String?
    let preparation_time: Int?
    let servings: Int?
    let calories: Double?
    let protein: Double?
    let carbs: Double?
    let fats: Double?
    let ingredients: [RecipeIngredientDTO]?
}

struct RecipeIngredientDTO: Decodable, Identifiable {
    let id: Int?
    let name: String
    let amount: String?

    enum CodingKeys: String, CodingKey {
        case id, name, amount
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(Int.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        amount = try c.decodeIfPresent(String.self, forKey: .amount)
    }
}

struct RecipesResponse: Decodable {
    let recipes: [RecipeDTO]
}

// MARK: - Photo Analysis

// ML service returns: {top_prediction, top_prediction_ru, confidence, nutrition: {calories, protein, carbs, fat}}
struct FoodPrediction: Decodable {
    let top_prediction: String?
    let top_prediction_ru: String?
    let confidence: Double?
    let nutrition: PredictionNutrition?

    struct PredictionNutrition: Decodable {
        let calories: Double?
        let protein: Double?
        let carbs: Double?
        let fat: Double?
    }

    // Convenience accessors
    var dishName: String { top_prediction_ru ?? top_prediction ?? "Блюдо" }
    var calories: Double { nutrition?.calories ?? 0 }
    var protein: Double { nutrition?.protein ?? 0 }
    var carbs: Double { nutrition?.carbs ?? 0 }
    var fat: Double { nutrition?.fat ?? 0 }
    var confidencePercent: Int { Int((confidence ?? 0) * 100) }
}

// MARK: - Water Tracking

struct WaterEntryDTO: Decodable, Identifiable {
    let id: Int
    let amount_ml: Int
    let date: String?
    let created_at: String?
}

struct WaterResponse: Decodable {
    let entries: [WaterEntryDTO]
    let total_ml: Int
    let goal_ml: Int
    let date: String?
}

struct AddWaterRequest: Encodable {
    let amount_ml: Int
    let date: String?
}

struct AddWaterResponse: Decodable {
    let entry: WaterEntryDTO?
    let total_ml: Int
    let goal_ml: Int
}

// MARK: - Monthly Analytics

struct MonthlyStatsDTO: Decodable {
    let month: Int?
    let year: Int?
    let weeks: [WeekData]?
    let totals: MonthlyTotals?
    let summary: MonthlySummary?

    struct WeekData: Decodable, Identifiable {
        let week_number: Int
        let start_date: String
        let end_date: String
        let avg_calories: Double?
        let total_meals: Int?
        var id: Int { week_number }
    }

    struct MonthlyTotals: Decodable {
        let calories: Double?
        let protein: Double?
        let carbs: Double?
        let fats: Double?
        let meals_count: Int?
    }

    struct MonthlySummary: Decodable {
        let avg_daily_calories: Double?
        let days_tracked: Int?
        let days_with_goal: Int?
    }
}

// MARK: - Tips

struct TipDTO: Decodable, Identifiable {
    let id: Int?
    let title: String
    let description: String?
    let category: String?
    let priority: String?
    let icon: String?

    var safeId: Int { id ?? title.hashValue }
}

struct TipsResponse: Decodable {
    let tips: [TipDTO]
    let count: Int?
}

// MARK: - Progress (Measurements + Photos)

struct MeasurementDTO: Decodable, Identifiable {
    let id: Int
    let date: String?
    let chest: Double?
    let waist: Double?
    let hips: Double?
    let biceps: Double?
    let thigh: Double?
    let neck: Double?
    let notes: String?
    let created_at: String?
}

struct MeasurementsResponse: Decodable {
    let measurements: [MeasurementDTO]
    let count: Int?
}

struct AddMeasurementRequest: Encodable {
    let date: String?
    let chest: Double?
    let waist: Double?
    let hips: Double?
    let biceps: Double?
    let thigh: Double?
    let neck: Double?
    let notes: String?
}

struct ProgressPhotoDTO: Decodable, Identifiable {
    let id: Int
    let image_url: String?
    let date: String?
    let category: String?
    let notes: String?
    let created_at: String?
}

struct ProgressPhotosResponse: Decodable {
    let photos: [ProgressPhotoDTO]
    let count: Int?
}

struct AddProgressPhotoRequest: Encodable {
    let image_url: String
    let date: String?
    let category: String?
    let notes: String?
}

// MARK: - Meal Plans

struct MealPlanDTO: Decodable, Identifiable {
    let id: Int
    let recipe_id: Int?
    let name: String?
    let date: String?
    let type: String?
    let image: String?
    let category: String?
    let calories: Double?
    let protein: Double?
    let carbs: Double?
    let fats: Double?
    let time: Int?
    let difficulty: String?
    let is_completed: Bool?
    let ingredients: [RecipeIngredientDTO]?
    let steps: String?
}

struct MealPlansResponse: Decodable {
    let meal_plans: [MealPlanDTO]
    let count: Int?
}

struct AddMealPlanRequest: Encodable {
    let recipeId: Int
    let name: String
    let date: String
    let type: String
    let calories: Double?
    let protein: Double?
    let carbs: Double?
    let fats: Double?
}

struct WeekMealPlansResponse: Decodable {
    let week_plans: [MealPlanDTO]
    let start_date: String?
    let end_date: String?
    let total_count: Int?
}

// MARK: - Friends

struct FriendshipDTO: Decodable, Identifiable {
    let id: Int
    let user_id: Int?
    let friend_id: Int?
    let status: String?
    let created_at: String?
    // Resolved friend info
    let friend: FriendUserDTO?
    let user: FriendUserDTO?
}

struct FriendUserDTO: Decodable, Identifiable {
    let id: Int
    let full_name: String?
    let nickname: String?
    let avatar: String?

    var displayName: String {
        full_name ?? nickname ?? "User"
    }

    var initials: String {
        let name = displayName
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

struct FriendStatusResponse: Decodable {
    let status: String?
    let friendshipId: Int?
    let isRequester: Bool?
}

struct FriendRequestBody: Encodable {
    let userId: Int
}

struct SearchUsersResponse: Decodable {
    // Backend may return array directly
    let users: [FriendUserDTO]?
}

// MARK: - Groups

struct GroupDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let emoji: String?
    let is_public: Bool?
    let member_count: Int?
    let created_at: String?
    let is_member: Bool?
    let is_admin: Bool?
}

struct CreateGroupRequest: Encodable {
    let name: String
    let description: String?
    let emoji: String?
    let isPublic: Bool
}

struct GroupPostDTO: Decodable, Identifiable {
    let id: Int
    let text: String?
    let image: String?
    let likes: Int?
    let is_liked: Bool?
    let created_at: String?
    let author: FriendUserDTO?
    let comments: [PostCommentDTO]?
    let comments_count: Int?
}

struct PostCommentDTO: Decodable, Identifiable {
    let id: Int
    let text: String?
    let created_at: String?
    let author: FriendUserDTO?
    let reply_to_name: String?
}

struct GroupPostsResponse: Decodable {
    let posts: [GroupPostDTO]
    let total: Int?
    let pages: Int?
    let current_page: Int?
}

struct CreatePostRequest: Encodable {
    let text: String
    let image: String?
    let mealId: Int?
}

struct CreateCommentRequest: Encodable {
    let text: String
    let replyToId: Int?
    let replyToName: String?
}

struct ForumTopicDTO: Decodable, Identifiable {
    let id: Int
    let title: String
    let content: String?
    let category: String?
    let is_pinned: Bool?
    let replies_count: Int?
    let last_activity: String?
    let created_at: String?
    let author: FriendUserDTO?
}

struct CreateTopicRequest: Encodable {
    let title: String
    let content: String
    let category: String?
}

struct ForumReplyDTO: Decodable, Identifiable {
    let id: Int
    let content: String?
    let created_at: String?
    let author: FriendUserDTO?
    let reply_to_name: String?
}

struct GroupMemberDTO: Decodable, Identifiable {
    let id: Int
    let user: FriendUserDTO?
    let role: String?
    let joined_at: String?
}

// MARK: - Fridge

struct FridgeProductDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let quantity: Double?
    let unit: String?
    let category: String?
    let expiry_date: String?
    let notes: String?
    let created_at: String?

    var isExpiringSoon: Bool {
        guard let expiry = expiry_date else { return false }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: expiry) else { return false }
        let daysUntil = Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0
        return daysUntil <= 7 && daysUntil >= 0
    }

    var isExpired: Bool {
        guard let expiry = expiry_date else { return false }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: expiry) else { return false }
        return date < Date()
    }
}

struct FridgeProductsResponse: Decodable {
    let products: [FridgeProductDTO]?
}

struct AddFridgeProductRequest: Encodable {
    let name: String
    let quantity: Double?
    let unit: String?
    let category: String?
    let expiryDate: String?
    let notes: String?
}

// MARK: - Generic

struct MessageResponse: Decodable {
    let message: String?
    let error: String?
}
