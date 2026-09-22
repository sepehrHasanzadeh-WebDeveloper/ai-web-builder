import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';



@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, RefreshToken]),
    UsersModule,
    JwtModule.register({}),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  controllers: [
    AuthController,
  ],

  exports: [
    AuthService,
    PassportModule
  ],
})
export class AuthModule {}
 