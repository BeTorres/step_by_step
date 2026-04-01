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
import { formatCPF, formatCNPJ, cleanCPF, cleanCNPJ, isValidCPF, isValidCNPJ } from '@/lib/validators';
import styles from '../page.module.css';

export default function DocumentPage() {
  const router = useRouter();
  const { email, registration, documentType, setDocumentType, documentNumber, setDocumentNumber, setRegistration, setCurrentStep, setEmail } = useRegistrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentError, setDocumentError] = useState('');

  useAbandonmentTracking(email, registration?.status || null);

  useEffect(() => {

    if (!registration) {
      console.warn('No registration found, redirecting to /');
      router.push('/');
    } else {
      if (!email && registration.email) {
        setEmail(registration.email);
      }
      
      if (!documentNumber && registration.documentNumber) {
        const formatted = registration.documentType === 'cpf'
          ? formatCPF(registration.documentNumber)
          : formatCNPJ(registration.documentNumber);
        setDocumentNumber(formatted);
      }
      
      if (documentType !== registration.documentType && registration.documentType) {
        setDocumentType(registration.documentType as 'cpf' | 'cnpj');
      }
    }
  }, [registration, router, email, setEmail, documentNumber, documentType, setDocumentType, setDocumentNumber]);

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    const cleaned = value.replace(/\D/g, '');
    const formatted = documentType === 'cpf' 
      ? formatCPF(cleaned)
      : formatCNPJ(cleaned);
    
    setDocumentNumber(formatted);
    
    if (cleaned.length > 0) {
      const minLength = documentType === 'cpf' ? 11 : 14;
      if (cleaned.length === minLength) {
        const isValid = documentType === 'cpf'
          ? isValidCPF(cleaned)
          : isValidCNPJ(cleaned);
        
        setDocumentError(!isValid ? `${documentType.toUpperCase()} inválido` : '');
      } else {
        setDocumentError('');
      }
    } else {
      setDocumentError('');
    }
  };

  const handleNext = async () => {
    setError('');

    if (!documentNumber) {
      setError('Número do documento é obrigatório');
      return;
    }

    const cleaned = documentType === 'cpf' 
      ? cleanCPF(documentNumber)
      : cleanCNPJ(documentNumber);

    const isValid = documentType === 'cpf'
      ? isValidCPF(cleaned)
      : isValidCNPJ(cleaned);

    if (!isValid) {
      setDocumentError(`${documentType.toUpperCase()} inválido`);
      return;
    }

    setIsLoading(true);

    try {
      const updated = await apiClient.completeDocumentStep(email, documentType, cleaned);

      setRegistration(updated);
      setCurrentStep(updated.status as any);
      router.push('/contact');
    } catch (err: any) {
      console.error('Document step error:', err.response?.data);
      setError(err.response?.data?.message || 'Falha ao atualizar documento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <StepIndicator currentStep={RegistrationStatus.DOCUMENT_STEP} />
        <h1>Etapa 2: Documento</h1>
        <p>Por favor, forneça suas informações de documento</p>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Documento</label>
          <select
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value as 'cpf' | 'cnpj');
              setDocumentNumber('');
              setDocumentError('');
            }}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              width: '100%', 
              marginBottom: '1rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="cpf">CPF (11 dígitos)</option>
            <option value="cnpj">CNPJ (14 dígitos)</option>
          </select>
        </div>

        <Input
          label={`Número do ${documentType.toUpperCase()}`}
          type="text"
          value={documentNumber}
          onChange={handleDocumentNumberChange}
          error={documentError || error}
          placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={handleNext} isLoading={isLoading} disabled={!!documentError || !documentNumber}>
            Próxima Etapa
          </Button>
        </div>
      </div>
    </div>
  );
}
