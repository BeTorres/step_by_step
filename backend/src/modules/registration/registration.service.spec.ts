import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { IdentificationStepDto } from './dto/identification-step.dto';
import { DocumentStepDto } from './dto/document-step.dto';
import { ContactStepDto } from './dto/contact-step.dto';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let mockRepository: any;
  let mockCepProvider: any;
  let mockEmailProvider: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockCepProvider = {
      fetchAddressByCep: jest.fn(),
    };

    mockEmailProvider = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: getRepositoryToken(Registration),
          useValue: mockRepository,
        },
        {
          provide: 'ICepProvider',
          useValue: mockCepProvider,
        },
        {
          provide: 'IEmailProvider',
          useValue: mockEmailProvider,
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startRegistration', () => {
    it('should create a new registration if not exists', async () => {
      const email = 'test@example.com';
      const mockReg = {
        email,
        status: RegistrationStatus.PENDING,
        mfaCodeVerified: false,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockReg);
      mockRepository.save.mockResolvedValue(mockReg);

      const result = await service.startRegistration(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockReg);
    });

    it('should return existing registration if already exists', async () => {
      const email = 'test@example.com';
      const existingReg = {
        email,
        status: RegistrationStatus.IDENTIFICATION_STEP,
        mfaCodeVerified: false,
      };

      mockRepository.findOne.mockResolvedValue(existingReg);

      const result = await service.startRegistration(email);

      expect(result).toEqual(existingReg);
    });
  });

  describe('completeIdentificationStep', () => {
    it('should complete identification step successfully', async () => {
      const email = 'test@example.com';
      const dto: IdentificationStepDto = {
        email,
        name: 'John Doe',
      };

      const mockReg: any = {
        email,
        status: RegistrationStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        name: dto.name,
        status: RegistrationStatus.IDENTIFICATION_STEP,
      });

      const result = await service.completeIdentificationStep(dto);

      expect(result.name).toBe('John Doe');
      expect(result.status).toBe(RegistrationStatus.IDENTIFICATION_STEP);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error if registration not found', async () => {
      const email = 'nonexistent@example.com';
      const dto: IdentificationStepDto = {
        email,
        name: 'John Doe',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.completeIdentificationStep(dto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeDocumentStep', () => {
    it('should complete document step successfully', async () => {
      const email = 'test@example.com';
      const dto: DocumentStepDto = {
        email,
        documentType: 'cpf',
        documentNumber: '12345678900',
      };

      const mockReg: any = {
        email,
        status: RegistrationStatus.IDENTIFICATION_STEP,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        status: RegistrationStatus.DOCUMENT_STEP,
      });

      const result = await service.completeDocumentStep(dto);

      expect(result.documentType).toBe('cpf');
      expect(result.status).toBe(RegistrationStatus.DOCUMENT_STEP);
    });

    it('should throw error if not in correct step', async () => {
      const email = 'test@example.com';
      const dto: DocumentStepDto = {
        email,
        documentType: 'cpf',
        documentNumber: '12345678900',
      };

      const mockReg: any = {
        email,
        status: RegistrationStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);

      await expect(
        service.completeDocumentStep(dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeContactStep', () => {
    it('should complete contact step successfully', async () => {
      const email = 'test@example.com';
      const dto: ContactStepDto = {
        email,
        phone: '(11) 98765-4321',
      };

      const mockReg: any = {
        email,
        status: RegistrationStatus.DOCUMENT_STEP,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        phone: dto.phone,
        status: RegistrationStatus.CONTACT_STEP,
      });

      const result = await service.completeContactStep(dto);

      expect(result.phone).toBe('(11) 98765-4321');
      expect(result.status).toBe(RegistrationStatus.CONTACT_STEP);
    });
  });

  describe('sendMfaCode', () => {
    it('should send MFA code and save to database', async () => {
      const email = 'test@example.com';
      const mockReg: any = {
        email,
        status: RegistrationStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        mfaCode: expect.any(String),
        mfaCodeExpiresAt: expect.any(Date),
      });

      await service.sendMfaCode(email);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEmailProvider.sendEmail).toHaveBeenCalledWith(
        email,
        'Seu Codigo de Verificação',
        expect.stringContaining('Verificação'),
      );
    });
  });

  describe('verifyMfaCode', () => {
    it('should verify correct MFA code', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const mockReg: any = {
        email,
        mfaCode: code,
        mfaCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        mfaCodeVerified: false,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        mfaCodeVerified: true,
      });

      const result = await service.verifyMfaCode({ email, code });

      expect(result).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error for expired code', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const mockReg: any = {
        email,
        mfaCode: code,
        mfaCodeExpiresAt: new Date(Date.now() - 10 * 60 * 1000),
        mfaCodeVerified: false,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);

      await expect(
        service.verifyMfaCode({ email, code }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid code', async () => {
      const email = 'test@example.com';
      const mockReg: any = {
        email,
        mfaCode: '123456',
        mfaCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        mfaCodeVerified: false,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);

      await expect(
        service.verifyMfaCode({ email, code: '999999' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeRegistration', () => {
    it('should complete registration and send success email', async () => {
      const email = 'test@example.com';
      const mockReg: any = {
        email,
        name: 'John Doe',
        status: RegistrationStatus.ADDRESS_STEP,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);
      mockRepository.save.mockResolvedValue({
        ...mockReg,
        status: RegistrationStatus.COMPLETED,
        completedAt: expect.any(Date),
      });

      const result = await service.completeRegistration(email);

      expect(result.status).toBe(RegistrationStatus.COMPLETED);
      expect(mockEmailProvider.sendEmail).toHaveBeenCalledWith(
        email,
        'Registro Concluído com Sucesso',
        expect.stringContaining('Welcome'),
      );
    });

    it('should throw error if not all steps completed', async () => {
      const email = 'test@example.com';
      const mockReg: any = {
        email,
        status: RegistrationStatus.CONTACT_STEP,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);

      await expect(
        service.completeRegistration(email),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRegistrationData', () => {
    it('should retrieve registration data', async () => {
      const email = 'test@example.com';
      const mockReg = {
        email,
        name: 'John Doe',
        status: RegistrationStatus.IDENTIFICATION_STEP,
      };

      mockRepository.findOne.mockResolvedValue(mockReg);

      const result = await service.getRegistrationData(email);

      expect(result).toEqual(mockReg);
    });

    it('should throw error if registration not found', async () => {
      const email = 'nonexistent@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getRegistrationData(email),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
