import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { MessageSquare, Plus, ChevronRight, Pin, Clock, User, Send, Reply, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const GroupForum = ({ topics, currentUser, onCreateTopic, onAddReply, onPinTopic }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'discussion' });
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const categories = [
    { id: 'discussion', name: 'Обсуждение', emoji: '💬' },
    { id: 'question', name: 'Вопрос', emoji: '❓' },
    { id: 'recipe', name: 'Рецепт', emoji: '🍳' },
    { id: 'achievement', name: 'Достижение', emoji: '🏆' },
    { id: 'tip', name: 'Совет', emoji: '💡' },
  ];

  const handleCreateTopic = () => {
    if (newTopic.title && newTopic.content) {
      onCreateTopic({
        id: Date.now(),
        title: newTopic.title,
        content: newTopic.content,
        category: newTopic.category,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        isPinned: false,
        replies: [],
        createdAt: new Date(),
        lastActivity: new Date(),
      });
      setShowCreateModal(false);
      setNewTopic({ title: '', content: '', category: 'discussion' });
    }
  };

  const handleAddReply = () => {
    if (replyText.trim() && selectedTopic) {
      onAddReply(selectedTopic.id, {
        id: Date.now(),
        content: replyText,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        replyToId: replyingTo?.id || null,
        replyToName: replyingTo?.authorName || null,
        replies: [],
        createdAt: new Date(),
      });
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const ReplyItem = ({ reply, depth = 0 }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [localReplyText, setLocalReplyText] = useState('');

    const handleLocalReply = () => {
      if (localReplyText.trim()) {
        onAddReply(selectedTopic.id, {
          id: Date.now(),
          content: localReplyText,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          replyToId: reply.id,
          replyToName: reply.authorName,
          replies: [],
          createdAt: new Date(),
        });
        setLocalReplyText('');
        setShowReplyInput(false);
      }
    };

    return (
      <div className={`${depth > 0 ? 'ml-6 sm:ml-10 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
              {reply.authorAvatar ? (
                <img src={reply.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{reply.authorName}</span>
                {reply.replyToName && (
                  <span className="text-xs text-secondary">
                    <Reply className="w-3 h-3 inline mr-1" />
                    {reply.replyToName}
                  </span>
                )}
                <span className="text-xs text-secondary">
                  {format(new Date(reply.createdAt), 'd MMM в HH:mm', { locale: ru })}
                </span>
              </div>
              <p className="text-sm mt-1 break-words">{reply.content}</p>
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs text-secondary hover:text-black mt-2 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                Ответить
              </button>

              {showReplyInput && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={localReplyText}
                    onChange={(e) => setLocalReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocalReply()}
                    placeholder={`Ответ для ${reply.authorName}...`}
                    className="flex-1 px-3 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
                  />
                  <button
                    onClick={handleLocalReply}
                    disabled={!localReplyText.trim()}
                    className="px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {reply.replies && reply.replies.length > 0 && (
          <div>
            {reply.replies.map((nestedReply) => (
              <ReplyItem key={nestedReply.id} reply={nestedReply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (selectedTopic) {
    const category = getCategoryInfo(selectedTopic.category);

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-2 text-secondary hover:text-black transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span className="font-semibold">Назад к темам</span>
        </button>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold">
                  {category.emoji} {category.name}
                </span>
                {selectedTopic.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    Закреплено
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold break-words">{selectedTopic.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-divider">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {selectedTopic.authorAvatar ? (
                <img src={selectedTopic.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div>
              <div className="font-semibold">{selectedTopic.authorName}</div>
              <div className="text-sm text-secondary">
                {format(new Date(selectedTopic.createdAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
              </div>
            </div>
          </div>

          <div className="py-4">
            <p className="whitespace-pre-wrap break-words">{selectedTopic.content}</p>
          </div>

          <div className="border-t border-divider pt-4">
            <h3 className="font-bold mb-4">
              Ответы ({selectedTopic.replies?.length || 0})
            </h3>

            {selectedTopic.replies && selectedTopic.replies.length > 0 ? (
              <div className="divide-y divide-divider">
                {selectedTopic.replies.filter(r => !r.replyToId).map((reply) => (
                  <ReplyItem key={reply.id} reply={{
                    ...reply,
                    replies: selectedTopic.replies.filter(r => r.replyToId === reply.id)
                  }} />
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center py-8">
                Пока нет ответов. Будьте первым!
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-divider">
              {replyingTo && (
                <div className="mb-2 px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-secondary">
                    Ответ для <span className="font-semibold text-black">{replyingTo.authorName}</span>
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-secondary hover:text-black"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddReply()}
                  placeholder="Написать ответ..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
                />
                <button
                  onClick={handleAddReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const pinnedTopics = topics.filter(t => t.isPinned);
  const regularTopics = topics.filter(t => !t.isPinned);
  const sortedTopics = [...pinnedTopics, ...regularTopics];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Форум</h3>
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Новая тема</span>
        </Button>
      </div>

      {sortedTopics.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="font-bold text-lg mb-2">Пока нет тем</h3>
          <p className="text-secondary mb-4">
            Создайте первую тему для обсуждения!
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Создать тему
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTopics.map((topic) => {
            const category = getCategoryInfo(topic.category);
            return (
              <Card
                key={topic.id}
                padding="md"
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                    {category.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {topic.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-600" />
                      )}
                      <h4 className="font-semibold truncate">{topic.title}</h4>
                    </div>
                    <p className="text-sm text-secondary line-clamp-2 mb-2">
                      {topic.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-secondary flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {topic.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.replies?.length || 0} ответов
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(topic.lastActivity), 'd MMM', { locale: ru })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewTopic({ title: '', content: '', category: 'discussion' });
        }}
        title="Создать тему"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Категория</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewTopic({ ...newTopic, category: cat.id })}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    newTopic.category === cat.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Заголовок</label>
            <input
              type="text"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              placeholder="О чём хотите поговорить?"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Содержание</label>
            <textarea
              value={newTopic.content}
              onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
              placeholder="Опишите подробнее..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setNewTopic({ title: '', content: '', category: 'discussion' });
              }}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!newTopic.title || !newTopic.content}
              onClick={handleCreateTopic}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupForum;
