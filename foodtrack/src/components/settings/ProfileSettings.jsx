import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { User, Camera } from 'lucide-react';

const ProfileSettings = ({ profile, onSave }) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    avatar: profile.avatar || null,
  });

  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6" />
        <h3 className="text-xl font-bold">Профиль</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className="font-bold text-lg">{formData.name || 'Ваше имя'}</h4>
            <p className="text-sm text-secondary">{formData.email || 'email@example.com'}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Имя</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите ваше имя"
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Телефон</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+7 (999) 999-99-99"
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {hasChanges && (
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Сохранить изменения
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileSettings;