'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useRegistrationStore } from '@/store/registration.store';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import styles from './page.module.css';

export default function IdentificationPage() {
  const router = useRouter();
  const { email, setEmail, name, setName, setRegistration, setCurrentStep, restoreFromRegistration } = useRegistrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});
  
  const restoredEmailRef = useRef<string | null>(null);
  useEffect(() => {
    if (email && email !== restoredEmailRef.current && !isLoading) {
      restoredEmailRef.current = email;
      
      const normalizedEmail = email.trim().toLowerCase();
      
      apiClient.restoreRegistrationFromEmail(normalizedEmail)
        .then((registration) => {
          if (registration) {
            restoreFromRegistration(registration);
            setEmail(normalizedEmail);
          }
        })
        .catch((err) => {
        });
    }
  }, [email, isLoading, restoreFromRegistration, setEmail]);

  const handleStartRegistration = async () => {
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }

    if (!name) {
      setErrors({ name: 'Nome é obrigatório' });
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const startedRegistration = await apiClient.startRegistration(normalizedEmail);
      
      const registration = await apiClient.completeIdentificationStep(normalizedEmail, name);

      setEmail(normalizedEmail);
      setRegistration(registration);
      setCurrentStep(registration.status as any);
      router.push('/document');
    } catch (error: any) {
      console.error('handleStartRegistration error:', error.response?.data);
      setErrors({
        email: error.response?.data?.message || 'Falha ao iniciar o registro',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Etapa 1: Identificação</h1>
        <p>Vamos começar com suas informações básicas</p>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="eu@email.com.br"
        />

        <Input
          label="Nome Completo"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="João Silva"
        />

        <Button
          onClick={handleStartRegistration}
          isLoading={isLoading}
        >
          Próxima Etapa
        </Button>
      </div>
    </div>
  );
}
