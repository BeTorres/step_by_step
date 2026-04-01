'use client';

import React, { InputHTMLAttributes, useState, useCallback, useEffect } from 'react';
import styles from './input.module.css';
import { formatFieldValue, validateField } from '@/lib/validation';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onValidChange?: (isValid: boolean) => void;
  validationType?: string;
  showValidation?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error,
  onValidChange,
  validationType,
  showValidation = false,
  onChange,
  value: propsValue,
  ...props 
}) => {
  const [validationError, setValidationError] = useState<string>('');
  const [value, setValue] = useState(propsValue as string || '');

  useEffect(() => {
    setValue(propsValue as string || '');
  }, [propsValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (validationType && showValidation) {
      newValue = formatFieldValue(validationType, newValue);
    }

    setValue(newValue);

    if (showValidation && validationType && newValue.length > 0) {
      const validation = validateField(validationType, newValue);
      setValidationError(validation.message || '');
      onValidChange?.(validation.valid);
    } else {
      setValidationError('');
    }

    if (onChange) {
      const event = { ...e, target: { ...e.target, value: newValue } };
      onChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  }, [validationType, showValidation, onChange, onValidChange]);

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        {...props}
        value={value}
        onChange={handleChange}
        className={`${styles.input} ${error || validationError ? styles.error : ''}`} 
      />
      {(error || validationError) && (
        <span className={styles.errorText}>{error || validationError}</span>
      )}
    </div>
  );
};
