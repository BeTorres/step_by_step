'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useRegistrationStore } from '@/store/registration.store';
import { StepIndicator } from '@/components/step-indicator';
import { Button } from '@/components/button';
import { RegistrationStatus } from '@/types';
import styles from '../page.module.css';

export default function ReviewPage() {
  const router = useRouter();
  const { email, registration, setRegistration, setCurrentStep, setEmail } = useRegistrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!registration) {
      router.push('/');
    } else if (!email && registration.email) {
      setEmail(registration.email);
    }
  }, [registration, router, email, setEmail]);

  const handleComplete = async () => {
    setError('');
    setIsLoading(true);

    try {
      const updated = await apiClient.completeRegistration(email);
      setRegistration(updated);
      setCurrentStep(updated.status as any);
      router.push('/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao completar o registro');
    } finally {
      setIsLoading(false);
    }
  };

  if (!registration) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <StepIndicator currentStep={RegistrationStatus.REVIEW_STEP} />
        <h1>Etapa 5: Revisão</h1>
        <p>Por favor, revise suas informações</p>

        {error && <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Email:</strong> {registration.email}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Nome:</strong> {registration.name}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Documento:</strong> {registration.documentType?.toUpperCase()} - {registration.documentNumber}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Telefone:</strong> {registration.phone}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Endereço:</strong> {registration.street}, {registration.number}
            {registration.complement && `, ${registration.complement}`}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Cidade/Estado:</strong> {registration.city}, {registration.state}
          </div>
          <div>
            <strong>CEP:</strong> {registration.zipCode}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={handleComplete} isLoading={isLoading}>
            Completar Registro
          </Button>
        </div>
      </div>
    </div>
  );
}
