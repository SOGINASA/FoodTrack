import React, { useMemo, useState } from 'react';
import Card from '../common/Card';
import { Crown, Shield, User, UserPlus, UserCheck, UserX, Clock, Search } from 'lucide-react';

const GroupMembers = ({
  members,
  currentUserId,
  friendStatusById = {},
  onAddFriend,
  onCancelFriendRequest,
  onRemoveFriend,
}) => {
  const [query, setQuery] = useState('');

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Владелец';
      case 'admin':
        return 'Админ';
      default:
        return 'Участник';
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => (m.name || '').toLowerCase().includes(q));
  }, [members, query]);

  const getFriendStatus = (member) => {
    // приоритет — внешний стейт
    if (friendStatusById[member.id]) return friendStatusById[member.id];

    // если когда-то добавишь с бэка:
    // if (member.isFriend) return 'friends';
    // if (member.friendRequestSent) return 'pending';

    return 'none';
  };

  const ActionButton = ({ member }) => {
    if (!currentUserId || member.id === currentUserId) return null;

    const status = getFriendStatus(member);

    if (status === 'friends') {
      return (
        <button
          onClick={() => onRemoveFriend?.(member.id)}
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-2"
          title="Удалить из друзей"
        >
          <UserCheck className="w-4 h-4" />
          <span className="hidden xl:inline">В друзьях</span>
        </button>
      );
    }

    if (status === 'pending') {
      return (
        <button
          onClick={() => onCancelFriendRequest?.(member.id)}
          className="px-3 py-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-800 transition-colors text-sm font-semibold flex items-center gap-2"
          title="Отменить запрос"
        >
          <Clock className="w-4 h-4" />
          <span className="hidden xl:inline">Запрос</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => onAddFriend?.(member.id)}
        className="px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors text-sm font-semibold flex items-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden xl:inline">В друзья</span>
      </button>
    );
  };

  return (
    <Card padding="lg" className="h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold">
          Участники <span className="text-secondary font-semibold">({members.length})</span>
        </h3>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск участника..."
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
        />
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[70vh] lg:max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate">{member.name}</div>
                {getRoleBadge(member.role)}
              </div>
              <div className="text-sm text-secondary">{getRoleLabel(member.role)}</div>
            </div>

            {/* right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right hidden xl:block">
                <div className="text-sm font-semibold">{member.streak} 🔥</div>
                <div className="text-xs text-secondary">стрик</div>
              </div>

              <ActionButton member={member} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-secondary py-10">
            Ничего не найдено
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupMembers;
