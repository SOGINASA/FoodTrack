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

// MARK: - Generic

struct MessageResponse: Decodable {
    let message: String?
    let error: String?
}
