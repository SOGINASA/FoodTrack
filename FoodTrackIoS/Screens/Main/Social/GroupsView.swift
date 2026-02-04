import SwiftUI

struct GroupsView: View {
    @State private var segment = 0 // 0 = My groups, 1 = Discover
    @State private var myGroups: [GroupDTO] = []
    @State private var discoverGroups: [GroupDTO] = []
    @State private var isLoading = true
    @State private var showCreateSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    // Header
                    FTHeader(title: "Группы", subtitle: "Общайтесь, делитесь прогрессом и мотивируйте друг друга")

                    // Segmented picker
                    Picker("", selection: $segment) {
                        Text("Мои группы").tag(0)
                        Text("Обзор").tag(1)
                    }
                    .pickerStyle(.segmented)

                    // Create group button
                    Button {
                        showCreateSheet = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 16))
                            Text("Создать группу")
                                .font(.system(size: 15, weight: .semibold))
                        }
                        .foregroundColor(FTTheme.bg)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(FTTheme.tint)
                        .cornerRadius(FTTheme.corner)
                    }

                    // Content
                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(FTTheme.tint)
                            Text("Загрузка...")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 40)
                    } else if segment == 0 {
                        myGroupsSection
                    } else {
                        discoverSection
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
            .navigationDestination(for: GroupDTO.ID.self) { groupId in
                let group = (myGroups + discoverGroups).first { $0.id == groupId }
                GroupDetailView(group: group, groupId: groupId)
            }
            .sheet(isPresented: $showCreateSheet) {
                CreateGroupSheet { newGroup in
                    myGroups.insert(newGroup, at: 0)
                    segment = 0
                }
            }
        }
        .task { await loadData() }
    }

    // MARK: - My Groups

    private var myGroupsSection: some View {
        Group {
            if myGroups.isEmpty {
                emptyState(
                    icon: "person.3",
                    title: "Нет групп",
                    subtitle: "Создайте свою группу или найдите интересную во вкладке \"Обзор\""
                )
            } else {
                VStack(spacing: 12) {
                    ForEach(myGroups) { group in
                        NavigationLink(value: group.id) {
                            GroupCard(group: group)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    // MARK: - Discover

    private var discoverSection: some View {
        Group {
            if discoverGroups.isEmpty {
                emptyState(
                    icon: "globe",
                    title: "Нет доступных групп",
                    subtitle: "Пока нет публичных групп для вступления"
                )
            } else {
                VStack(spacing: 12) {
                    ForEach(discoverGroups) { group in
                        NavigationLink(value: group.id) {
                            GroupCard(group: group)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    // MARK: - Empty State

    private func emptyState(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(FTTheme.muted)
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(FTTheme.text)
            Text(subtitle)
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    // MARK: - Data

    private func loadData() async {
        isLoading = true
        async let myTask = APIClient.shared.getMyGroups()
        async let discoverTask = APIClient.shared.discoverGroups()
        myGroups = (try? await myTask) ?? []
        discoverGroups = (try? await discoverTask) ?? []
        isLoading = false
    }
}

// MARK: - Group Card

private struct GroupCard: View {
    let group: GroupDTO

    var body: some View {
        FTCard {
            HStack(spacing: 14) {
                // Emoji avatar
                RoundedRectangle(cornerRadius: 14)
                    .fill(FTTheme.fill)
                    .frame(width: 56, height: 56)
                    .overlay(
                        Text(group.emoji ?? "🍽")
                            .font(.system(size: 26))
                    )

                VStack(alignment: .leading, spacing: 5) {
                    HStack(spacing: 6) {
                        Text(group.name)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(FTTheme.text)
                            .lineLimit(1)

                        if group.is_public == false {
                            Image(systemName: "lock.fill")
                                .font(.system(size: 10))
                                .foregroundColor(FTTheme.muted)
                        }
                    }

                    if let desc = group.description, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(FTTheme.muted)
                            .lineLimit(2)
                    }

                    HStack(spacing: 4) {
                        Image(systemName: "person.2.fill")
                            .font(.system(size: 11))
                        Text("\(group.member_count ?? 0)")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundColor(FTTheme.muted)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(FTTheme.muted)
            }
        }
    }
}

// MARK: - Create Group Sheet

private struct CreateGroupSheet: View {
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var desc = ""
    @State private var selectedEmoji = "🍎"
    @State private var isPublic = true
    @State private var isSaving = false
    @State private var errorMsg: String?

    var onCreated: (GroupDTO) -> Void

    private let emojiList = [
        "🍎", "🥑", "🥗", "🍕", "🥩", "🍜", "🧁", "🥤", "🏋️", "🏃",
        "💪", "🧘", "🥦", "🍳", "🥐", "🍣", "🌮", "🍔", "🥕", "🍇",
        "🔥", "❤️", "⭐️", "🎯", "🏆", "🌿", "☕️", "🧃", "🥚", "🍰"
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {

                    // Emoji picker
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Иконка группы")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(FTTheme.text)

                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 6), spacing: 8) {
                            ForEach(emojiList, id: \.self) { emoji in
                                Button {
                                    selectedEmoji = emoji
                                } label: {
                                    Text(emoji)
                                        .font(.system(size: 28))
                                        .frame(width: 48, height: 48)
                                        .background(selectedEmoji == emoji ? FTTheme.tint.opacity(0.15) : FTTheme.fill)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(selectedEmoji == emoji ? FTTheme.tint : Color.clear, lineWidth: 2)
                                        )
                                        .cornerRadius(12)
                                }
                            }
                        }
                    }

                    // Name
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Название")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(FTTheme.text)

                        TextField("Введите название группы", text: $name)
                            .font(.system(size: 16))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(FTTheme.card)
                            .overlay(
                                RoundedRectangle(cornerRadius: FTTheme.corner)
                                    .stroke(FTTheme.border, lineWidth: 1)
                            )
                            .cornerRadius(FTTheme.corner)
                    }

                    // Description
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Описание")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(FTTheme.text)

                        TextField("Кратко опишите группу", text: $desc, axis: .vertical)
                            .font(.system(size: 16))
                            .lineLimit(3...6)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(FTTheme.card)
                            .overlay(
                                RoundedRectangle(cornerRadius: FTTheme.corner)
                                    .stroke(FTTheme.border, lineWidth: 1)
                            )
                            .cornerRadius(FTTheme.corner)
                    }

                    // Public / Private toggle
                    FTCard {
                        Toggle(isOn: $isPublic) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Публичная группа")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(FTTheme.text)
                                Text(isPublic
                                     ? "Любой пользователь может найти и вступить"
                                     : "Только по приглашению")
                                    .font(.system(size: 12))
                                    .foregroundColor(FTTheme.muted)
                            }
                        }
                        .tint(FTTheme.success)
                    }

                    // Error
                    if let errorMsg {
                        Text(errorMsg)
                            .font(.system(size: 13))
                            .foregroundColor(.red)
                    }

                    // Save button
                    Button {
                        Task { await createGroup() }
                    } label: {
                        HStack(spacing: 8) {
                            if isSaving {
                                ProgressView()
                                    .tint(FTTheme.bg)
                                    .scaleEffect(0.85)
                            }
                            Text("Создать")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(FTTheme.bg)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(name.trimmingCharacters(in: .whitespaces).isEmpty ? FTTheme.muted : FTTheme.tint)
                        .cornerRadius(FTTheme.corner)
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isSaving)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.vertical, 16)
            }
            .background(FTTheme.bg)
            .navigationTitle("Новая группа")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
            }
        }
    }

    private func createGroup() async {
        isSaving = true
        errorMsg = nil
        do {
            let req = CreateGroupRequest(
                name: name.trimmingCharacters(in: .whitespaces),
                description: desc.trimmingCharacters(in: .whitespaces).isEmpty ? nil : desc.trimmingCharacters(in: .whitespaces),
                emoji: selectedEmoji,
                isPublic: isPublic
            )
            let group = try await APIClient.shared.createGroup(req)
            onCreated(group)
            dismiss()
        } catch {
            errorMsg = error.localizedDescription
        }
        isSaving = false
    }
}
