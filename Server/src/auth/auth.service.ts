import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface SendOtpResponse {
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  message: string;
  user: {
    id: string;
    phone: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async sendSmsPattern(phone: string, code: string): Promise<void> {
    const patternCode = this.configService.get<string>('IPPANEL_PATTERN');
    const lineNumber = this.configService.get<string>('IPPANEL_FROM');
    const apiKey =
      this.configService.get<string>('SMS_TOKEN_API') ||
      this.configService.get<string>('SMS_API_KEY');

    if (!apiKey || !patternCode || !lineNumber) {
      this.logger.error('SMS configuration keys are missing in environment variables');
      throw new InternalServerErrorException('تنظیمات سرویس پیامک کامل نیست');
    }

    try {
      const response = await fetch(
        'https://api.iranpayamak.com/ws/v1/sms/pattern',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Api-Key': apiKey,
          },
          body: JSON.stringify({
            code: patternCode,
            attributes: {
              code,
            },
            recipient: phone,
            line_number: lineNumber,
            number_format: 'english',
          }),
        },
      );

      const result = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        this.logger.error(`IPPanel API returned error: ${JSON.stringify(result)}`);
        throw new InternalServerErrorException('خطا در سامانه ارسال پیامک');
      }

      this.logger.log(`OTP SMS dispatched successfully to ${phone}`);
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined;
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to dispatch SMS to ${phone}: ${message}`, stack);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('ارتباط با سرور پیامک برقرار نشد');
    }
  }

  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 120 * 1000);

    const newOtp = this.otpRepository.create({
      phone: dto.phone,
      code: otpCode,
      expiresAt,
    });
    await this.otpRepository.save(newOtp);

    await this.sendSmsPattern(dto.phone, otpCode);

    return {
      message: 'کد تایید با موفقیت ارسال شد',
      expiresInSeconds: 120,
    };
  }

  /**
   * ساخت جفت‌توکن Access و Refresh و ذخیره RefreshToken در دیتابیس
   */
 async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, phone: user.phone };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessSecret || !refreshSecret) {
      throw new InternalServerErrorException('تنظیمات امنیتی توکن JWT در سیستم ثبت نشده است');
    }

    const accessExpiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m') as any;
    const refreshExpiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any;

    // ۱. ساخت Access Token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    // ۲. ساخت Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    // ۳. ذخیره Refresh Token در دیتابیس
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenEntity = this.refreshTokenRepository.create({
      user,
      token: refreshToken,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const now = new Date();

    const validOtp = await this.otpRepository.findOne({
      where: {
        phone: dto.phone,
        code: dto.code,
        verifiedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });

    if (!validOtp) {
      throw new BadRequestException('کد تایید نامعتبر است یا منقضی شده است');
    }

    validOtp.verifiedAt = now;
    await this.otpRepository.save(validOtp);

    const { user, isNewUser } = await this.usersService.findOrCreate({
      phone: dto.phone,
    });

    // تولید و دریافت توکن‌ها
    const tokens = await this.generateTokens(user);

    return {
      message: 'ورود با موفقیت انجام شد',
      user: {
        id: user.id,
        phone: user.phone,
      },
      tokens,
      isNewUser,
    };
  }
}