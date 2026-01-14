import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Heart, MessageCircle, Share2, MoreVertical, Camera, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const GroupFeed = ({ posts, currentUser, onAddPost, onLikePost, onCommentPost, onSharePost }) => {
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    text: '',
    image: null,
    meal: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewPost({ ...newPost, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = () => {
    if (newPost.text || newPost.image) {
      onAddPost({
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: newPost.text,
        image: newPost.image,
        meal: newPost.meal,
        likes: [],
        comments: [],
        timestamp: new Date(),
      });
      setShowAddPostModal(false);
      setNewPost({ text: '', image: null, meal: null });
      setImagePreview(null);
    }
  };

  const FeedPost = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const isLiked = post.likes.includes(currentUser.id);

    const handleAddComment = () => {
      if (commentText.trim()) {
        onCommentPost(post.id, {
          id: Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          text: commentText,
          timestamp: new Date(),
        });
        setCommentText('');
      }
    };

    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {post.userAvatar ? (
                <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  👤
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold">{post.userName}</div>
              <div className="text-sm text-secondary">
                {format(post.timestamp, 'HH:mm · d MMM', { locale: ru })}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {post.text && (
          <p className="text-base leading-relaxed break-words">{post.text}</p>
        )}

        {post.meal && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="font-semibold mb-2">{post.meal.name}</div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
              <span className="font-semibold">🔥 {post.meal.calories} ккал</span>
              <span className="text-secondary">🍗 {post.meal.protein}г</span>
              <span className="text-secondary">🥖 {post.meal.carbs}г</span>
              <span className="text-secondary">🧈 {post.meal.fats}г</span>
            </div>
          </div>
        )}

{post.image && (
  <div className="rounded-2xl overflow-hidden">
    <img src={post.image} alt="Post" className="w-full max-w-full object-cover" />
  </div>
)}

        <div className="flex items-center justify-between pt-2 border-t border-divider gap-2">
          <button
            onClick={() => onLikePost(post.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
              isLiked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold text-sm sm:text-base">{post.likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold text-sm sm:text-base">{post.comments.length}</span>
          </button>

          <button 
            onClick={() => onSharePost(post)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {showComments && (
          <div className="space-y-3 pt-2 border-t border-divider">
            {post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-2xl px-4 py-2">
                        <div className="font-semibold text-sm">{comment.userName}</div>
                        <div className="text-sm break-words">{comment.text}</div>
                      </div>
                      <div className="text-xs text-secondary mt-1 px-4">
                        {format(comment.timestamp, 'HH:mm', { locale: ru })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Написать комментарий..."
                className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card padding="lg">
        <button
          onClick={() => setShowAddPostModal(true)}
          className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <span className="text-secondary">Поделитесь своим прогрессом...</span>
        </button>
      </Card>

      {posts.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-bold text-lg mb-2">Пока нет постов</h3>
          <p className="text-secondary mb-4">
            Будьте первым, кто поделится своим прогрессом!
          </p>
          <Button variant="primary" onClick={() => setShowAddPostModal(true)}>
            Создать пост
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddPostModal}
        onClose={() => {
          setShowAddPostModal(false);
          setNewPost({ text: '', image: null, meal: null });
          setImagePreview(null);
        }}
        title="Создать пост"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={newPost.text}
            onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
            placeholder="Расскажите о своём прогрессе..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
          />

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-2xl" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setNewPost({ ...newPost, image: null });
                }}
                className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">Добавить фото</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowAddPostModal(false);
                setNewPost({ text: '', image: null, meal: null });
                setImagePreview(null);
              }}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!newPost.text && !newPost.image}
              onClick={handleSubmitPost}
            >
              Опубликовать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupFeed;