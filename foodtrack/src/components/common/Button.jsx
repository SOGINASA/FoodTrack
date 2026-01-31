import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'font-semibold transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900 active:scale-[0.98] shadow-lg',
    secondary: 'bg-white text-black border-2 border-gray-200 hover:border-gray-300 active:scale-[0.98]',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-3.5 text-base rounded-full',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;