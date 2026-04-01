'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/store/registration.store';
import { Button } from '@/components/button';
import styles from '../page.module.css';

export default function SuccessPage() {
  const router = useRouter();
  const { registration, reset } = useRegistrationStore();

  const handleNewRegistration = () => {
    reset();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1>Registro Concluído!</h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
          Bem-vindo, {registration?.name}! Seu registro foi concluído com sucesso.
        </p>
        
        <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', color: '#155724' }}>
          <p>Um email de confirmação foi enviado para <strong>{registration?.email}</strong></p>
        </div>

        <Button onClick={handleNewRegistration}>
          Iniciar Novo Registro
        </Button>
      </div>
    </div>
  );
}
