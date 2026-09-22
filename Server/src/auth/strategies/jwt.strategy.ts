import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const accessSecret =
      configService.get<string>('JWT_ACCESS_SECRET');

    if (!accessSecret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET تنظیم نشده است',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: { sub: string; phone: string }) {
    return {
      id: payload.sub,
      phone: payload.phone,
    };
  }
}