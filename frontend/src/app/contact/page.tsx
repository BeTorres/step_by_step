'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useRegistrationStore } from '@/store/registration.store';
import { useAbandonmentTracking } from '@/hooks/useAbandonmentTracking';
import { StepIndicator } from '@/components/step-indicator';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { RegistrationStatus } from '@/types';
import { formatPhone, cleanPhone, isValidPhone } from '@/lib/validators';
import styles from '../page.module.css';

export default function ContactPage() {
  const router = useRouter();
  const { email, registration, phone, setPhone, setRegistration, setCurrentStep, setEmail } = useRegistrationStore();
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useAbandonmentTracking(email, registration?.status || null);

  useEffect(() => {

    if (!registration) {
      console.warn('No registration found, redirecting to /');
      router.push('/');
    } else {
      if (!email && registration.email) {
        setEmail(registration.email);
      }
      
      if (!phone && registration.phone) {
        const formatted = formatPhone(registration.phone);
        setPhone(formatted);
      }
    }
  }, [registration, router, email, setEmail, phone, setPhone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = cleanPhone(value);
    const formatted = formatPhone(cleaned);
    
    setPhone(formatted);
    if (cleaned.length === 11) {
      const isValid = isValidPhone(cleaned);
      setPhoneError(!isValid ? 'Número de telefone inválido. Deve ter 11 dígitos com código de área (9XXXXXXXX)' : '');
    } else {
      setPhoneError('');
    }
  };

  const handleNext = async () => {
    setError('');

    if (!phone) {
      setError('Telefone é obrigatório');
      return;
    }

    if (!email) {
      console.error('Email vazio!');
      setError('Email não conferenciado. Por favor, volte e tente novamente.');
      return;
    }

    const cleaned = cleanPhone(phone);

    if (!isValidPhone(cleaned)) {
      setPhoneError('Número de telefone inválido');
      return;
    }

    setIsLoading(true);

    try {
      const updated = await apiClient.completeContactStep(email, cleaned);

      setRegistration(updated);
      setCurrentStep(updated.status as any);
      router.push('/address');
    } catch (err: any) {
      console.error('Contact step error:', err.response?.data);
      setError(err.response?.data?.message || 'Falha ao atualizar contato');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <StepIndicator currentStep={RegistrationStatus.CONTACT_STEP} />
        <h1>Etapa 3: Contato</h1>
        <p>Como podemos contatá-lo?</p>

        <Input
          label="Telefone Celular"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          error={phoneError || error}
          placeholder="(11) 98765-4321"
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={handleNext} isLoading={isLoading} disabled={!phone}>
            Próxima Etapa
          </Button>
        </div>
      </div>
    </div>
  );
}
