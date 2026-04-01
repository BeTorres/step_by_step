import { useEffect } from 'react';
import { RegistrationStatus } from '@/types';

export function useAbandonmentTracking(
  email: string | null,
  currentStatus: RegistrationStatus | null,
  isCompleted: boolean = false,
) {
  useEffect(() => {
    if (!email || isCompleted || currentStatus === RegistrationStatus.COMPLETED) {
      return;
    }

    const handleBeforeUnload = () => {
      if (email && currentStatus) {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/send-abandonment-email`;
        const data = JSON.stringify({ email });
        
        navigator.sendBeacon(url, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [email, currentStatus, isCompleted]);
}
