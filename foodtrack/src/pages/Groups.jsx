import React, { useState, useEffect, useCallback } from 'react';
import GroupList from '../components/groups/GroupList';
import GroupFeed from '../components/groups/GroupFeed';
import GroupMembers from '../components/groups/GroupMembers';
import GroupForum from '../components/groups/GroupForum';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { groupsAPI, authAPI } from '../services/api';
import { Users, Plus, ArrowLeft, UserPlus, Edit3, Trash2, LogOut, MessageSquare, Newspaper, Loader2 } from 'lucide-react';

const Groups = () => {
  const [showToast, setShowToast] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);

  // Загрузка текущего пользователя
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authAPI.getMe();
        setCurrentUser({
          id: response.data.id,
          name: response.data.full_name || response.data.nickname,
          avatar: null,
        });
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // Загрузка групп
  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getMyGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
      setShowToast({ type: 'error', message: 'Ошибка загрузки групп' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Загрузка данных выбранной группы
  const loadGroupData = useCallback(async (groupId) => {
    try {
      const [membersRes, postsRes, topicsRes] = await Promise.all([
        groupsAPI.getMembers(groupId),
        groupsAPI.getPosts(groupId),
        groupsAPI.getTopics(groupId),
      ]);
      setMembers(membersRes.data);
      setPosts(postsRes.data.posts || []);
      setTopics(topicsRes.data);
    } catch (error) {
      console.error('Error loading group data:', error);
      setShowToast({ type: 'error', message: 'Ошибка загрузки данных группы' });
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData(selectedGroup.id);
    }
  }, [selectedGroup, loadGroupData]);

  const handleCreateGroup = async () => {
    if (newGroupData.name) {
      try {
        const response = await groupsAPI.createGroup(newGroupData);
        setGroups([...groups, response.data]);
        setShowCreateModal(false);
        setNewGroupData({ name: '', description: '', emoji: '💪', isPublic: true });
        setShowToast({ type: 'success', message: 'Группа создана!' });
      } catch (error) {
        setShowToast({ type: 'error', message: 'Ошибка создания группы' });
      }
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

  const handleEditGroup = async () => {
    try {
      const response = await groupsAPI.updateGroup(selectedGroup.id, editGroupData);
      setGroups(groups.map(g => g.id === selectedGroup.id ? response.data : g));
      setSelectedGroup(response.data);
      setShowEditModal(false);
      setShowToast({ type: 'success', message: 'Группа обновлена!' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка обновления группы' });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await groupsAPI.deleteGroup(selectedGroup.id);
      setGroups(groups.filter(g => g.id !== selectedGroup.id));
      setShowDeleteModal(false);
      setSelectedGroup(null);
      setShowToast({ type: 'success', message: 'Группа удалена' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка удаления группы' });
    }
  };

  const handleAddPost = async (postData) => {
    try {
      const response = await groupsAPI.createPost(selectedGroup.id, {
        text: postData.text,
        image: postData.image,
        mealId: postData.meal?.id,
      });
      setPosts([response.data, ...posts]);
      setShowToast({ type: 'success', message: 'Пост опубликован!' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка публикации поста' });
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await groupsAPI.toggleLike(selectedGroup.id, postId);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: response.data.likes };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentPost = async (postId, comment) => {
    try {
      const response = await groupsAPI.addComment(selectedGroup.id, postId, {
        text: comment.text,
        replyToId: comment.replyToId,
        replyToName: comment.replyToName,
      });
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...post.comments, response.data] };
        }
        return post;
      }));
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка добавления комментария' });
    }
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

  const handleCreateTopic = async (topicData) => {
    try {
      const response = await groupsAPI.createTopic(selectedGroup.id, {
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
      });
      setTopics([response.data, ...topics]);
      setShowToast({ type: 'success', message: 'Тема создана!' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка создания темы' });
    }
  };

  const handleAddReply = async (topicId, replyData) => {
    try {
      const response = await groupsAPI.addReply(selectedGroup.id, topicId, {
        content: replyData.content,
        replyToId: replyData.replyToId,
        replyToName: replyData.replyToName,
      });
      setTopics(topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            replies: [...topic.replies, response.data],
            lastActivity: new Date().toISOString(),
          };
        }
        return topic;
      }));
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка добавления ответа' });
    }
  };

  const handlePinTopic = async (topicId) => {
    try {
      const response = await groupsAPI.togglePinTopic(selectedGroup.id, topicId);
      setTopics(topics.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, isPinned: response.data.isPinned };
        }
        return topic;
      }));
    } catch (error) {
      setShowToast({ type: 'error', message: 'Ошибка закрепления темы' });
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await groupsAPI.leaveGroup(selectedGroup.id);
      setGroups(groups.filter(g => g.id !== selectedGroup.id));
      setShowToast({ type: 'success', message: 'Вы покинули группу' });
      setSelectedGroup(null);
      setShowSettingsModal(false);
    } catch (error) {
      setShowToast({ type: 'error', message: error.response?.data?.error || 'Ошибка' });
    }
  };

  const emojiOptions = ['💪', '🔥', '🥗', '🏃', '🎯', '⭐', '🏆', '👥'];

  if (loading && !selectedGroup) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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

        <div className="flex gap-2 border-b border-divider pb-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
              activeTab === 'feed'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span>Лента</span>
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
              activeTab === 'forum'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Форум</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'feed' ? (
              <GroupFeed
                posts={posts}
                currentUser={currentUser}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onCommentPost={handleCommentPost}
                onSharePost={handleSharePost}
              />
            ) : (
              <GroupForum
                topics={topics}
                currentUser={currentUser}
                onCreateTopic={handleCreateTopic}
                onAddReply={handleAddReply}
                onPinTopic={handlePinTopic}
              />
            )}
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
                Все посты и данные группы будут удалены навсегда
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
