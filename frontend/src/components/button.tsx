'use client';

import React, { ButtonHTMLAttributes } from 'react';
import styles from './button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading = false, 
  children, 
  disabled,
  ...props 
}) => {
  return (
    <button 
      {...props}
      disabled={disabled || isLoading}
      className={`${styles.button} ${styles[variant]}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
