import SwiftUI

struct FriendsView: View {

    enum Tab: String, CaseIterable {
        case friends  = "Друзья"
        case incoming = "Входящие"
        case search   = "Поиск"
    }

    // MARK: - State

    @State private var selectedTab: Tab = .friends
    @State private var friends: [FriendshipDTO] = []
    @State private var incomingRequests: [FriendshipDTO] = []
    @State private var searchResults: [FriendUserDTO] = []
    @State private var searchQuery = ""
    @State private var isLoading = false
    @State private var isSearching = false
    @State private var errorMessage: String?
    @State private var confirmRemoveId: Int?
    @State private var sentRequestIds: Set<Int> = []

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Друзья",
                        subtitle: "Находите друзей и отслеживайте прогресс вместе"
                    )
                    .padding(.top, 10)

                    // Segmented picker
                    segmentedPicker

                    // Error banner
                    if let errorMessage {
                        errorBanner(errorMessage)
                    }

                    // Tab content
                    switch selectedTab {
                    case .friends:
                        friendsSection
                    case .incoming:
                        incomingSection
                    case .search:
                        searchSection
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task {
            await loadData()
        }
        .alert("Удалить из друзей?", isPresented: .init(
            get: { confirmRemoveId != nil },
            set: { if !$0 { confirmRemoveId = nil } }
        )) {
            Button("Отмена", role: .cancel) { confirmRemoveId = nil }
            Button("Удалить", role: .destructive) {
                if let id = confirmRemoveId {
                    Task { await removeFriend(id) }
                }
            }
        } message: {
            Text("Вы сможете снова отправить запрос в любой момент")
        }
    }

    // MARK: - Segmented Picker

    private var segmentedPicker: some View {
        HStack(spacing: 0) {
            ForEach(Tab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                    }
                } label: {
                    HStack(spacing: 6) {
                        Text(tab.rawValue)
                            .font(.system(size: 14, weight: .semibold))

                        if tab == .incoming && !incomingRequests.isEmpty {
                            Text("\(incomingRequests.count)")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.red.opacity(0.85))
                                .clipShape(Capsule())
                        }
                    }
                    .foregroundColor(selectedTab == tab ? FTTheme.text : FTTheme.muted)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        selectedTab == tab
                            ? FTTheme.fill
                            : Color.clear
                    )
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(FTTheme.card)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }

    // MARK: - Friends Section

    private var friendsSection: some View {
        Group {
            if isLoading {
                loadingPlaceholder
            } else if friends.isEmpty {
                emptyState(
                    icon: "person.2",
                    title: "Пока нет друзей",
                    subtitle: "Найдите друзей через вкладку \"Поиск\" и начните отслеживать прогресс вместе"
                )
            } else {
                VStack(spacing: 10) {
                    ForEach(friends) { friendship in
                        friendRow(friendship)
                    }
                }
            }
        }
    }

    private func friendRow(_ friendship: FriendshipDTO) -> some View {
        let friendUser = friendship.friend ?? friendship.user
        return FTCard {
            HStack(spacing: 12) {
                avatarCircle(friendUser, size: 46)

                VStack(alignment: .leading, spacing: 3) {
                    Text(friendUser?.displayName ?? "User")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(FTTheme.text)

                    if let nickname = friendUser?.nickname {
                        Text("@\(nickname)")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                }

                Spacer()

                Button {
                    confirmRemoveId = friendship.id
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(FTTheme.muted)
                        .padding(8)
                        .background(FTTheme.fill)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Incoming Section

    private var incomingSection: some View {
        Group {
            if isLoading {
                loadingPlaceholder
            } else if incomingRequests.isEmpty {
                emptyState(
                    icon: "envelope",
                    title: "Нет входящих запросов",
                    subtitle: "Когда кто-то отправит вам запрос в друзья, он появится здесь"
                )
            } else {
                VStack(spacing: 10) {
                    ForEach(incomingRequests) { request in
                        incomingRow(request)
                    }
                }
            }
        }
    }

    private func incomingRow(_ request: FriendshipDTO) -> some View {
        let senderUser = request.user ?? request.friend
        return FTCard {
            HStack(spacing: 12) {
                avatarCircle(senderUser, size: 46)

                VStack(alignment: .leading, spacing: 3) {
                    Text(senderUser?.displayName ?? "User")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(FTTheme.text)

                    if let nickname = senderUser?.nickname {
                        Text("@\(nickname)")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                }

                Spacer()

                HStack(spacing: 8) {
                    Button {
                        Task { await acceptRequest(request.id) }
                    } label: {
                        Image(systemName: "checkmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .padding(9)
                            .background(FTTheme.success)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)

                    Button {
                        Task { await rejectRequest(request.id) }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(FTTheme.text.opacity(0.7))
                            .padding(9)
                            .background(FTTheme.fill)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Search Section

    private var searchSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Search bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(FTTheme.muted)

                TextField("Имя или никнейм...", text: $searchQuery)
                    .font(.system(size: 16))
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled(true)
                    .onSubmit { Task { await performSearch() } }

                if !searchQuery.isEmpty {
                    Button {
                        searchQuery = ""
                        searchResults = []
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(FTTheme.muted)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(FTTheme.card)
            .overlay(
                RoundedRectangle(cornerRadius: FTTheme.corner)
                    .stroke(FTTheme.border, lineWidth: 1)
            )
            .cornerRadius(FTTheme.corner)

            // Search button
            Button {
                Task { await performSearch() }
            } label: {
                HStack {
                    Spacer()
                    if isSearching {
                        ProgressView()
                            .tint(.white)
                            .scaleEffect(0.85)
                    } else {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 13, weight: .semibold))
                        Text("Найти")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    Spacer()
                }
                .foregroundColor(.white)
                .padding(.vertical, 12)
                .background(FTTheme.tint)
                .cornerRadius(FTTheme.corner)
            }
            .buttonStyle(.plain)
            .disabled(searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSearching)
            .opacity(searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.5 : 1)

            // Results
            if isSearching {
                loadingPlaceholder
            } else if searchResults.isEmpty && !searchQuery.isEmpty {
                emptyState(
                    icon: "person.fill.questionmark",
                    title: "Никого не найдено",
                    subtitle: "Попробуйте изменить запрос или проверьте правильность написания"
                )
            } else {
                VStack(spacing: 10) {
                    ForEach(searchResults) { user in
                        searchResultRow(user)
                    }
                }
            }
        }
    }

    private func searchResultRow(_ user: FriendUserDTO) -> some View {
        let alreadyFriend = friends.contains { ($0.friend?.id == user.id) || ($0.user?.id == user.id) }
        let alreadySent = sentRequestIds.contains(user.id)

        return FTCard {
            HStack(spacing: 12) {
                avatarCircle(user, size: 46)

                VStack(alignment: .leading, spacing: 3) {
                    Text(user.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(FTTheme.text)

                    if let nickname = user.nickname {
                        Text("@\(nickname)")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                }

                Spacer()

                if alreadyFriend {
                    Text("В друзьях")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(FTTheme.success)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(FTTheme.success.opacity(0.12))
                        .cornerRadius(999)
                } else if alreadySent {
                    Text("Отправлено")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(FTTheme.muted)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(FTTheme.fill)
                        .cornerRadius(999)
                } else {
                    Button {
                        Task { await sendRequest(userId: user.id) }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "person.badge.plus")
                                .font(.system(size: 12, weight: .semibold))
                            Text("Добавить")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(FTTheme.tint)
                        .cornerRadius(999)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Shared Components

    private func avatarCircle(_ user: FriendUserDTO?, size: CGFloat) -> some View {
        Circle()
            .fill(FTTheme.fill)
            .frame(width: size, height: size)
            .overlay(
                Text(user?.initials ?? "FT")
                    .font(.system(size: size * 0.28, weight: .bold))
                    .foregroundColor(FTTheme.text.opacity(0.75))
            )
    }

    private func emptyState(icon: String, title: String, subtitle: String) -> some View {
        FTCard {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 32, weight: .light))
                    .foregroundColor(FTTheme.muted.opacity(0.6))

                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(FTTheme.text)

                Text(subtitle)
                    .font(.system(size: 13))
                    .foregroundColor(FTTheme.muted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }
    }

    private var loadingPlaceholder: some View {
        VStack {
            ProgressView()
                .tint(FTTheme.tint)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
        }
    }

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 13, weight: .semibold))
            Text(message)
                .font(.system(size: 13))
                .lineLimit(2)
            Spacer()
            Button {
                withAnimation { errorMessage = nil }
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 11, weight: .bold))
            }
            .buttonStyle(.plain)
        }
        .foregroundColor(.red.opacity(0.9))
        .padding(12)
        .background(Color.red.opacity(0.08))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.red.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(14)
    }

    // MARK: - Data Loading

    private func loadData() async {
        isLoading = true
        errorMessage = nil

        async let friendsTask = APIClient.shared.getFriends()
        async let incomingTask = APIClient.shared.getIncomingRequests()

        do {
            let (loadedFriends, loadedIncoming) = try await (friendsTask, incomingTask)
            friends = loadedFriends
            incomingRequests = loadedIncoming
        } catch {
            errorMessage = "Не удалось загрузить данные: \(error.localizedDescription)"
        }

        isLoading = false
    }

    private func performSearch() async {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return }

        isSearching = true
        errorMessage = nil

        do {
            searchResults = try await APIClient.shared.searchUsers(query: query)
        } catch {
            errorMessage = "Ошибка поиска: \(error.localizedDescription)"
        }

        isSearching = false
    }

    private func sendRequest(userId: Int) async {
        errorMessage = nil
        do {
            _ = try await APIClient.shared.sendFriendRequest(userId: userId)
            sentRequestIds.insert(userId)
        } catch {
            errorMessage = "Не удалось отправить запрос: \(error.localizedDescription)"
        }
    }

    private func acceptRequest(_ friendshipId: Int) async {
        errorMessage = nil
        do {
            try await APIClient.shared.acceptFriendRequest(friendshipId)
            incomingRequests.removeAll { $0.id == friendshipId }
            await loadData()
        } catch {
            errorMessage = "Не удалось принять запрос: \(error.localizedDescription)"
        }
    }

    private func rejectRequest(_ friendshipId: Int) async {
        errorMessage = nil
        do {
            try await APIClient.shared.rejectFriendRequest(friendshipId)
            incomingRequests.removeAll { $0.id == friendshipId }
        } catch {
            errorMessage = "Не удалось отклонить запрос: \(error.localizedDescription)"
        }
    }

    private func removeFriend(_ friendshipId: Int) async {
        errorMessage = nil
        do {
            try await APIClient.shared.removeFriend(friendshipId)
            friends.removeAll { $0.id == friendshipId }
        } catch {
            errorMessage = "Не удалось удалить друга: \(error.localizedDescription)"
        }
    }
}
