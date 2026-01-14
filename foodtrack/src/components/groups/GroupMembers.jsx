import React from 'react';
import Card from '../common/Card';
import { Crown, Shield, User } from 'lucide-react';

const GroupMembers = ({ members }) => {
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

  return (
    <Card padding="lg">
      <h3 className="text-xl font-bold mb-4">
        Участники ({members.length})
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  👤
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate">{member.name}</div>
                {getRoleBadge(member.role)}
              </div>
              <div className="text-sm text-secondary">{getRoleLabel(member.role)}</div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold">{member.streak} 🔥</div>
              <div className="text-xs text-secondary">стрик</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GroupMembers;