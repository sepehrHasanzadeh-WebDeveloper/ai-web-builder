import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, RefreshToken]),
    UsersModule,
    JwtModule.register({}), // میاد تنظیمات این رو به صورت داینامیک در ConfigService  اعمال میکند
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService , JwtModule], //  سرویس را اکسپورت کنید نه خود ماژول را
})
export class AuthModule {}