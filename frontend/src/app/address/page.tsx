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
import { formatCEP, cleanCEP } from '@/lib/validators';
import styles from '../page.module.css';

export default function AddressPage() {
  const router = useRouter();
  const { 
    email, 
    registration, 
    zipCode, 
    setZipCode,
    street,
    setStreet,
    number,
    setNumber,
    complement,
    setComplement,
    neighborhood,
    setNeighborhood,
    city,
    setCity,
    state,
    setState,
    setRegistration, 
    setCurrentStep,
    setEmail
  } = useRegistrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useAbandonmentTracking(email, registration?.status || null);

  useEffect(() => {
    if (!registration) {
      router.push('/');
      return;
    }

    setEmail(registration.email || '');
    setZipCode(formatCEP(registration.zipCode || ''));
    setStreet(registration.street || '');
    setNumber(registration.number || '');
    setComplement(registration.complement || '');
    setNeighborhood(registration.neighborhood || '');
    setCity(registration.city || '');
    setState(registration.state || '');
  }, [registration]);

  const handleCepChange = async (value: string) => {
    const cleaned = cleanCEP(value);
    const formatted = formatCEP(cleaned);
    
    setZipCode(formatted);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.zipCode;
      return newErrors;
    });

    if (cleaned.length !== 8) return;

    try {
      const addressData = await apiClient.fetchAddressByCep(formatted);
      setStreet(addressData.street);
      setNeighborhood(addressData.neighborhood);
      setCity(addressData.city);
      setState(addressData.state);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar endereço';
      setErrors(prev => ({ ...prev, zipCode: message }));
    }
    
  };

  const validateAddressFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!zipCode?.trim() || !/^\d{5}-?\d{3}$/.test(cleanCEP(zipCode))) {
      errors.zipCode = zipCode ? 'Formato de CEP inválido' : 'CEP é obrigatório';
    }
    if (!street?.trim() || street.length < 3) {
      errors.street = 'Rua deve ter pelo menos 3 caracteres';
    }
    if (!number?.trim()) {
      errors.number = 'Número é obrigatório';
    }
    if (!neighborhood?.trim() || neighborhood.length < 2) {
      errors.neighborhood = 'Bairro deve ter pelo menos 2 caracteres';
    }
    if (!city?.trim() || city.length < 2) {
      errors.city = 'Cidade deve ter pelo menos 2 caracteres';
    }
    if (!state?.trim() || !/^[A-Z]{2}$/.test(state)) {
      errors.state = 'Estado deve ter 2 letras maiúsculas';
    }

    return errors;
  };

  const handleNext = async () => {
    const newErrors = validateAddressFields();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const updated = await apiClient.completeAddressStep(
        email,
        cleanCEP(zipCode),
        street,
        number,
        neighborhood,
        city,
        state,
        complement,
      );
      
      setRegistration(updated);
      setCurrentStep(updated.status as any);
      router.push('/verify-email');
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Falha ao atualizar endereço',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <StepIndicator currentStep={RegistrationStatus.ADDRESS_STEP} />
        <h1>Etapa 4: Endereço</h1>
        <p>Onde você mora?</p>

        {errors.general && <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{errors.general}</div>}

        <Input
          label="CEP"
          type="text"
          value={zipCode}
          onChange={(e) => handleCepChange(e.target.value)}
          error={errors.zipCode}
          placeholder="12345-678"
        />

        <Input
          label="Rua"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          error={errors.street}
          placeholder="Avenida Principal"
        />

        <Input
          label="Número"
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, ''))}
          error={errors.number}
          placeholder="123"
        />

        <Input
          label="Complemento (Opcional)"
          type="text"
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
          placeholder="Apt 101"
        />

        <Input
          label="Bairro"
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          error={errors.neighborhood}
          placeholder="Centro"
        />

        <Input
          label="Cidade"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={errors.city}
          placeholder="São Paulo"
        />

        <Input
          label="Estado"
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          error={errors.state}
          placeholder="SP"
          maxLength={2}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={handleNext} isLoading={isLoading}>
            Próxima Etapa
          </Button>
        </div>
      </div>
    </div>
  );
}
