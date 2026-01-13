import React from 'react';

const Card = ({ 
  children, 
  className = '',
  onClick,
  hoverable = false,
  padding = 'default',
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-2xl shadow-sm';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
  };
  
  const hoverStyles = hoverable 
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
    : '';
  
  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;