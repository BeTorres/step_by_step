'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useRegistrationStore } from '@/store/registration.store';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { RegistrationStatus } from '@/types';
import styles from '../page.module.css';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email, registration, setCurrentStep } = useRegistrationStore();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!registration || registration.status !== RegistrationStatus.ADDRESS_STEP) {
      router.push('/');
    }
  }, [registration, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');

    if (!code || code.length !== 6) {
      setError('Digite os 6 dígitos do código');
      return;
    }

    if (!email) {
      setError('Email não encontrado. Por favor, volte para o início.');
      return;
    }

    setIsLoading(true);

    try {

      const result = await apiClient.verifyMfaCode(email, code);

      if (result.verified) {
        setSuccess('Email verificado com sucesso!');
        setCurrentStep(RegistrationStatus.COMPLETED);
        
        setTimeout(() => {
          router.push('/success');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código inválido ou expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email não encontrado.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiClient.sendMfaCode(email);
      setSuccess('Novo código enviado para seu email!');
      setCode('');
      setTimeLeft(15 * 60);
    } catch (err: any) {
      setError('Erro ao enviar novo código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Verificação de Email</h1>
        <p>Enviamos um código de 6 dígitos para seu email</p>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {email}
          </p>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: timeLeft < 300 ? '#dc3545' : '#007bff'
          }}>
            Tempo restante: <span style={{ fontSize: '24px' }}>{formatTime(timeLeft)}</span>
          </p>
        </div>

        <Input
          label="Código de Verificação"
          type="text"
          value={code}
          onChange={handleCodeChange}
          placeholder="000000"
          error={error}
          maxLength={6}
          style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
        />

        {success && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="secondary" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleVerify} 
            isLoading={isLoading}
            disabled={code.length !== 6}
          >
            Verificar
          </Button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Não recebeu o código?
          </p>
          <Button
            variant="secondary"
            onClick={handleResendCode}
            isLoading={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            Enviar Novo Código
          </Button>
        </div>
      </div>
    </div>
  );
}
