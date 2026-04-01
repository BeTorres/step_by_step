import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'pending',
  IDENTIFICATION_STEP = 'identification',
  DOCUMENT_STEP = 'document',
  CONTACT_STEP = 'contact',
  ADDRESS_STEP = 'address',
  REVIEW_STEP = 'review',
  COMPLETED = 'completed',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  documentType: 'cpf' | 'cnpj' | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  documentNumber: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  number: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string | null;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ type: 'varchar', length: 6, nullable: true })
  mfaCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  mfaCodeExpiresAt: Date | null;

  @Column({ type: 'boolean', default: false })
  mfaCodeVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
