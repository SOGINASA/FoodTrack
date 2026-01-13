import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddMealButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/add-meal')}
      className="fixed bottom-24 right-6 lg:bottom-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
      aria-label="Add meal"
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};

export default AddMealButton;