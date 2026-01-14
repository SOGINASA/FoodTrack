import React from 'react';
import Card from '../common/Card';
import { Users, TrendingUp } from 'lucide-react';

const GroupCard = ({ group, onClick }) => {
  return (
    <Card hoverable padding="lg" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
          {group.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg truncate">{group.name}</h3>
            {group.isPublic ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Открытая
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                Приватная
              </span>
            )}
          </div>

          <p className="text-sm text-secondary line-clamp-2 mb-3">
            {group.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-secondary">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.membersCount} участников</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{group.postsToday} постов сегодня</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GroupCard;