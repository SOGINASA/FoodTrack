import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { friendsAPI } from '../services/api';
import {
  UserPlus, UserCheck, UserX, Users, Search, Clock, X,
  Check, Loader2, UserMinus, Send,
} from 'lucide-react';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(null);

  // Загрузка данных
  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        friendsAPI.getAll(),
        friendsAPI.getIncomingRequests(),
        friendsAPI.getOutgoingRequests(),
      ]);
      setFriends(friendsRes.data);
      setIncoming(incomingRes.data);
      setOutgoing(outgoingRes.data);
    } catch (error) {
      console.error('Error loading friends:', error);
      setShowToast({ type: 'error', message: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Поиск пользователей
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await friendsAPI.search(searchQuery.trim());
        setSearchResults(res.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Отправить запрос в друзья
  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      setSearchResults(searchResults.filter(u => u.id !== userId));
      setShowToast({ type: 'success', message: 'Запрос отправлен' });
      // Обновляем исходящие
      const res = await friendsAPI.getOutgoingRequests();
      setOutgoing(res.data);
    } catch (error) {
      const msg = error.response?.data?.error || 'Не удалось отправить запрос';
      setShowToast({ type: 'error', message: msg });
    }
  };

  // Принять запрос
  const handleAccept = async (friendshipId) => {
    try {
      await friendsAPI.acceptRequest(friendshipId);
      setShowToast({ type: 'success', message: 'Запрос принят' });
      loadFriends();
    } catch (error) {
      const msg = error.response?.data?.error || 'Не удалось принять запрос';
      setShowToast({ type: 'error', message: msg });
    }
  };

  // Отклонить запрос
  const handleReject = async (friendshipId) => {
    try {
      await friendsAPI.rejectRequest(friendshipId);
      setIncoming(incoming.filter(r => r.id !== friendshipId));
      setShowToast({ type: 'info', message: 'Запрос отклонён' });
    } catch (error) {
      const msg = error.response?.data?.error || 'Не удалось отклонить запрос';
      setShowToast({ type: 'error', message: msg });
    }
  };

  // Отменить исходящий запрос
  const handleCancelRequest = async (friendshipId) => {
    try {
      await friendsAPI.remove(friendshipId);
      setOutgoing(outgoing.filter(r => r.id !== friendshipId));
      setShowToast({ type: 'info', message: 'Запрос отменён' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Не удалось отменить запрос' });
    }
  };

  // Удалить из друзей
  const handleRemoveFriend = async (friendshipId) => {
    try {
      await friendsAPI.remove(friendshipId);
      setFriends(friends.filter(f => f.friendshipId !== friendshipId));
      setShowRemoveModal(null);
      setShowToast({ type: 'info', message: 'Удалено из друзей' });
    } catch (error) {
      setShowToast({ type: 'error', message: 'Не удалось удалить из друзей' });
    }
  };

  const tabs = [
    { id: 'friends', label: 'Друзья', icon: Users, count: friends.length },
    { id: 'incoming', label: 'Входящие', icon: UserPlus, count: incoming.length },
    { id: 'outgoing', label: 'Исходящие', icon: Send, count: outgoing.length },
    { id: 'search', label: 'Поиск', icon: Search, count: null },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Друзья</h1>
      </div>

      {/* Табы */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* === Список друзей === */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary font-semibold">Пока нет друзей</p>
                <p className="text-sm text-gray-400 mt-1">Найдите друзей через поиск</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-6 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Найти друзей
                </button>
              </div>
            </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.friendshipId} padding="default">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {friend.fullName || friend.nickname}
                    </div>
                    <div className="text-sm text-secondary">@{friend.nickname}</div>
                  </div>
                  <button
                    onClick={() => setShowRemoveModal(friend)}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">В друзьях</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* === Входящие запросы === */}
      {activeTab === 'incoming' && (
        <div className="space-y-3">
          {incoming.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary font-semibold">Нет входящих запросов</p>
              </div>
            </Card>
          ) : (
            incoming.map((req) => (
              <Card key={req.id} padding="default">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{req.requesterName}</div>
                    <div className="text-sm text-secondary">
                      Хочет добавить вас в друзья
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Принять</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Отклонить</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* === Исходящие запросы === */}
      {activeTab === 'outgoing' && (
        <div className="space-y-3">
          {outgoing.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary font-semibold">Нет исходящих запросов</p>
              </div>
            </Card>
          ) : (
            outgoing.map((req) => (
              <Card key={req.id} padding="default">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{req.addresseeName}</div>
                    <div className="text-sm text-secondary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Ожидает ответа
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Отменить</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* === Поиск === */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени или нику..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-black outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {searchLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
            <Card padding="lg">
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary font-semibold">Никого не найдено</p>
                <p className="text-sm text-gray-400 mt-1">Попробуйте другой запрос</p>
              </div>
            </Card>
          )}

          {!searchLoading && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <Card key={user.id} padding="default">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {user.fullName || user.nickname}
                      </div>
                      <div className="text-sm text-secondary">@{user.nickname}</div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">В друзья</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {searchQuery.length < 2 && !searchLoading && (
            <Card padding="lg">
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-secondary font-semibold">Введите минимум 2 символа</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Модалка подтверждения удаления из друзей */}
      <Modal
        isOpen={!!showRemoveModal}
        onClose={() => setShowRemoveModal(null)}
        title="Удалить из друзей?"
      >
        {showRemoveModal && (
          <div className="space-y-4">
            <p className="text-secondary">
              Вы уверены, что хотите удалить{' '}
              <span className="font-semibold text-black">
                {showRemoveModal.fullName || showRemoveModal.nickname}
              </span>{' '}
              из друзей?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRemoveFriend(showRemoveModal.friendshipId)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserMinus className="w-5 h-5" />
                Удалить
              </button>
            </div>
          </div>
        )}
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

export default Friends;
