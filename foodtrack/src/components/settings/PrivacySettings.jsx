import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Shield, Trash2, Download } from 'lucide-react';

const PrivacySettings = ({ privacy, onSave, onExportData, onDeleteAccount }) => {
  const [settings, setSettings] = useState({
    profilePublic: privacy.profilePublic ?? false,
    showWeight: privacy.showWeight ?? false,
    showPhotos: privacy.showPhotos ?? true,
    showStats: privacy.showStats ?? true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-black' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6" />
          <h3 className="text-xl font-bold">Приватность</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Публичный профиль</div>
              <div className="text-sm text-secondary">Другие пользователи могут видеть ваш профиль</div>
            </div>
            <ToggleSwitch
              enabled={settings.profilePublic}
              onChange={() => handleToggle('profilePublic')}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-divider">
            <div>
              <div className="font-semibold">Показывать вес</div>
              <div className="text-sm text-secondary">Отображать текущий вес в профиле</div>
            </div>
            <ToggleSwitch
              enabled={settings.showWeight}
              onChange={() => handleToggle('showWeight')}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-divider">
            <div>
              <div className="font-semibold">Показывать фото прогресса</div>
              <div className="text-sm text-secondary">Фото видны другим пользователям</div>
            </div>
            <ToggleSwitch
              enabled={settings.showPhotos}
              onChange={() => handleToggle('showPhotos')}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-divider">
            <div>
              <div className="font-semibold">Показывать статистику</div>
              <div className="text-sm text-secondary">Калории и БЖУ видны в группах</div>
            </div>
            <ToggleSwitch
              enabled={settings.showStats}
              onChange={() => handleToggle('showStats')}
            />
          </div>
        </div>

        {hasChanges && (
          <Button variant="primary" className="w-full mt-6" onClick={handleSave}>
            Сохранить настройки
          </Button>
        )}
      </Card>

      <Card padding="lg" className="mt-6">
        <h3 className="text-xl font-bold mb-4">Данные и аккаунт</h3>

        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={onExportData}
          >
            <Download className="w-5 h-5" />
            Экспортировать данные
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-5 h-5" />
            Удалить аккаунт
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить аккаунт?"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо. 
            Все ваши данные, включая фото прогресса, замеры и историю питания будут удалены.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ Внимание: восстановление данных будет невозможно
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
              onClick={() => {
                onDeleteAccount();
                setShowDeleteModal(false);
              }}
            >
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PrivacySettings;