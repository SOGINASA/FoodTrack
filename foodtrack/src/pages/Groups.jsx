import React, { useState } from 'react';
import GroupList from '../components/groups/GroupList';
import GroupFeed from '../components/groups/GroupFeed';
import GroupMembers from '../components/groups/GroupMembers';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { Users, Plus, ArrowLeft, UserPlus, Edit3, Trash2, LogOut } from 'lucide-react';

const Groups = () => {
  const [showToast, setShowToast] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    emoji: '💪',
    isPublic: true,
  });
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    description: '',
    emoji: '💪',
    isPublic: true,
  });

  const currentUser = {
    id: 1,
    name: 'Иван Иванов',
    avatar: null,
  };

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Shred Squad',
      description: 'Сбрасываем вес вместе! Поддержка, мотивация и здоровые привычки 💪',
      emoji: '🔥',
      isPublic: true,
      membersCount: 24,
      postsToday: 12,
    },
    {
      id: 2,
      name: 'Здоровое питание',
      description: 'Обмен рецептами и советами по правильному питанию',
      emoji: '🥗',
      isPublic: true,
      membersCount: 156,
      postsToday: 45,
    },
    {
      id: 3,
      name: 'Марафон 30 дней',
      description: 'Приватный челлендж на 30 дней. Ежедневные отчёты обязательны!',
      emoji: '🏃',
      isPublic: false,
      membersCount: 15,
      postsToday: 8,
    },
  ]);

  const [members] = useState([
    { id: 1, name: 'Иван Иванов', role: 'owner', streak: 15, avatar: null },
    { id: 2, name: 'Мария Петрова', role: 'admin', streak: 23, avatar: null },
    { id: 3, name: 'Алексей Сидоров', role: 'member', streak: 7, avatar: null },
    { id: 4, name: 'Елена Козлова', role: 'member', streak: 12, avatar: null },
    { id: 5, name: 'Дмитрий Новиков', role: 'member', streak: 5, avatar: null },
  ]);

  const [posts, setPosts] = useState([
    {
      id: 1,
      userId: 2,
      userName: 'Мария Петрова',
      userAvatar: null,
      text: 'Сегодня впервые за долгое время уложилась в норму калорий! 🎉',
      image: null,
      meal: {
        name: 'Куриная грудка с овощами',
        calories: 420,
        protein: 45,
        carbs: 28,
        fats: 12,
      },
      likes: [1, 3],
      comments: [
        {
          id: 1,
          userId: 1,
          userName: 'Иван Иванов',
          text: 'Отличная работа! Так держать! 💪',
          timestamp: new Date(),
        },
      ],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      userId: 3,
      userName: 'Алексей Сидоров',
      userAvatar: null,
      text: 'Неделя на правильном питании позади! Минус 2 кг 🔥',
      image: 'https://via.placeholder.com/600x400/4D9FFF/FFFFFF?text=Progress+Photo',
      meal: null,
      likes: [1, 2, 4],
      comments: [],
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const handleCreateGroup = () => {
    if (newGroupData.name) {
      const newGroup = {
        id: Date.now(),
        name: newGroupData.name,
        description: newGroupData.description,
        emoji: newGroupData.emoji,
        isPublic: newGroupData.isPublic,
        membersCount: 1,
        postsToday: 0,
      };
      setGroups([...groups, newGroup]);
      setShowCreateModal(false);
      setNewGroupData({ name: '', description: '', emoji: '💪', isPublic: true });
      setShowToast({ type: 'success', message: 'Группа создана!' });
    }
  };

  const handleOpenEditModal = () => {
    setEditGroupData({
      name: selectedGroup.name,
      description: selectedGroup.description,
      emoji: selectedGroup.emoji,
      isPublic: selectedGroup.isPublic,
    });
    setShowSettingsModal(false);
    setShowEditModal(true);
  };

  const handleEditGroup = () => {
    setGroups(groups.map(g => 
      g.id === selectedGroup.id 
        ? { ...g, ...editGroupData }
        : g
    ));
    setSelectedGroup({ ...selectedGroup, ...editGroupData });
    setShowEditModal(false);
    setShowToast({ type: 'success', message: 'Группа обновлена!' });
  };

  const handleDeleteGroup = () => {
    setGroups(groups.filter(g => g.id !== selectedGroup.id));
    setShowDeleteModal(false);
    setSelectedGroup(null);
    setShowToast({ type: 'success', message: 'Группа удалена' });
  };

  const handleAddPost = (post) => {
    setPosts([post, ...posts]);
    setShowToast({ type: 'success', message: 'Пост опубликован!' });
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes.includes(currentUser.id)
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id];
        return { ...post, likes };
      }
      return post;
    }));
  };

  const handleCommentPost = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, comment] };
      }
      return post;
    }));
  };

  const handleSharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: `Пост от ${post.userName}`,
        text: post.text,
      });
    } else {
      setShowToast({ type: 'info', message: 'Ссылка скопирована в буфер обмена' });
    }
  };

  const handleLeaveGroup = () => {
    setShowToast({ type: 'success', message: 'Вы покинули группу' });
    setSelectedGroup(null);
    setShowSettingsModal(false);
  };

  const emojiOptions = ['💪', '🔥', '🥗', '🏃', '🎯', '⭐', '🏆', '👥'];

  if (selectedGroup) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Назад</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
            {selectedGroup.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{selectedGroup.name}</h1>
            <p className="text-secondary">{selectedGroup.membersCount} участников</p>
          </div>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm"
          >
            Настройки
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GroupFeed
              posts={posts}
              currentUser={currentUser}
              onAddPost={handleAddPost}
              onLikePost={handleLikePost}
              onCommentPost={handleCommentPost}
              onSharePost={handleSharePost}
            />
          </div>

          <div className="hidden lg:block">
            <GroupMembers members={members} />
          </div>
        </div>

        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Настройки группы"
        >
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-left">
              <UserPlus className="w-5 h-5" />
              <span className="font-semibold">Пригласить участников</span>
            </button>

            <button 
              onClick={handleOpenEditModal}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-semibold">Редактировать группу</span>
            </button>

            <button 
              onClick={handleLeaveGroup}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Покинуть группу</span>
            </button>

            <button 
              onClick={() => {
                setShowSettingsModal(false);
                setShowDeleteModal(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-semibold">Удалить группу</span>
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Редактировать группу"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Эмодзи группы</label>
              <div className="grid grid-cols-8 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setEditGroupData({ ...editGroupData, emoji })}
                    className={`text-3xl p-2 rounded-xl transition-all ${
                      editGroupData.emoji === emoji
                        ? 'bg-black scale-110'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Название группы</label>
              <input
                type="text"
                value={editGroupData.name}
                onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                placeholder="Название группы"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Описание</label>
              <textarea
                value={editGroupData.description}
                onChange={(e) => setEditGroupData({ ...editGroupData, description: e.target.value })}
                placeholder="Расскажите о группе..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold">Открытая группа</div>
                <div className="text-sm text-secondary">Любой может присоединиться</div>
              </div>
              <button
                onClick={() => setEditGroupData({ ...editGroupData, isPublic: !editGroupData.isPublic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editGroupData.isPublic ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editGroupData.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!editGroupData.name}
                onClick={handleEditGroup}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Удалить группу?"
        >
          <div className="space-y-4">
            <p className="text-secondary">
              Вы уверены, что хотите удалить группу <span className="font-semibold text-black">{selectedGroup.name}</span>? 
              Это действие необратимо.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ Все посты и данные группы будут удалены навсегда
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteGroup}
              >
                Удалить группу
              </Button>
            </div>
          </div>
        </Modal>

        {showToast && (
          <Toast
            type={showToast.type}
            message={showToast.message}
            onClose={() => setShowToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Группы</h1>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать группу</span>
        </Button>
      </div>

      <GroupList
        groups={groups}
        onSelectGroup={setSelectedGroup}
        onCreateGroup={() => setShowCreateModal(true)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewGroupData({ name: '', description: '', emoji: '💪', isPublic: true });
        }}
        title="Создать группу"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Эмодзи группы</label>
            <div className="grid grid-cols-8 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewGroupData({ ...newGroupData, emoji })}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    newGroupData.emoji === emoji
                      ? 'bg-black scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Название группы</label>
            <input
              type="text"
              value={newGroupData.name}
              onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
              placeholder="Например: Марафон похудения"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Описание</label>
            <textarea
              value={newGroupData.description}
              onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
              placeholder="Расскажите о группе..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold">Открытая группа</div>
              <div className="text-sm text-secondary">Любой может присоединиться</div>
            </div>
            <button
              onClick={() => setNewGroupData({ ...newGroupData, isPublic: !newGroupData.isPublic })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                newGroupData.isPublic ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  newGroupData.isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setNewGroupData({ name: '', description: '', emoji: '💪', isPublic: true });
              }}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!newGroupData.name}
              onClick={handleCreateGroup}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

export default Groups;