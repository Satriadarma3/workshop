import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        // DATABASE_URL (jika diisi) menimpa host/port/user/password/database
        url: config.get<string>('DATABASE_URL') || undefined,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'langganku'),
        password: config.get<string>('DB_PASSWORD', 'langganku'),
        database: config.get<string>('DB_NAME', 'langganku'),
        ssl: config.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        // gen_random_uuid() (pgcrypto), sama dengan database/schema.sql
        uuidExtension: 'pgcrypto',
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
