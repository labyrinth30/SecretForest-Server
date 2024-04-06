/* eslint-disable prettier/prettier */
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_USERNAME_KEY,
  ENV_HOST_KEY,
} from './common/const/env-keys.const';
import { LogMiddleware } from './common/middleware/log-middleware';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';
import { UsersModel } from './users/entity/users.entity';
import { ThemesModule } from './themes/themes.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ThemesModel } from './themes/entity/themes.entity';
import { ReservationsModel } from './reservations/entity/reservations.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_HOST_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [UsersModel, ThemesModel, ReservationsModel],
      synchronize: true,
    }),
    UsersModule,
    ThemesModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, 
     {
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor,
  },
     {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
  },
   ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
