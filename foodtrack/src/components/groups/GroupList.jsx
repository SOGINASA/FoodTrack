import React from 'react';
import GroupCard from './GroupCard';
import Button from '../common/Button';
import Card from '../common/Card';
import { Plus } from 'lucide-react';

const GroupList = ({ groups, onSelectGroup, onCreateGroup }) => {
  if (groups.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="font-bold text-lg mb-2">Нет групп</h3>
        <p className="text-secondary mb-4">
          Создайте свою первую группу или присоединитесь к существующей
        </p>
        <Button variant="primary" onClick={onCreateGroup}>
          <Plus className="w-5 h-5" />
          Создать группу
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onSelectGroup(group)}
        />
      ))}
    </div>
  );
};

export default GroupList;