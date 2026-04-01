'use client';

import React from 'react';
import { RegistrationStatus } from '@/types';
import styles from './step-indicator.module.css';

const steps = [
  { label: 'Identificação', status: RegistrationStatus.IDENTIFICATION_STEP },
  { label: 'Documento', status: RegistrationStatus.DOCUMENT_STEP },
  { label: 'Contato', status: RegistrationStatus.CONTACT_STEP },
  { label: 'Endereço', status: RegistrationStatus.ADDRESS_STEP },
  { label: 'Revisão', status: RegistrationStatus.REVIEW_STEP },
];

interface StepIndicatorProps {
  currentStep: RegistrationStatus;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(s => s.status === currentStep);
  
  return (
    <div className={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.status}>
          <div
            className={`${styles.step} ${
              index <= currentIndex ? styles.active : ''
            }`}
          >
            <span>{index + 1}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`${styles.connector} ${
                index < currentIndex ? styles.active : ''
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
