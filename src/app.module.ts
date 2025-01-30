import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';
import { AttachmentModule } from './attachment/attachment.module';
import { ConfigModule } from '@nestjs/config';
import { ReelsModule } from './reels/reels.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 8889,
      username: 'root',
      password: 'root',
      database: 'lingo_pet',
      autoLoadEntities: true,
      retryDelay: 5000,
      synchronize: true, // Disable in production!
      // logging: true,
    }),
    UserModule,
    PetModule,
    AttachmentModule,
    ReelsModule,
  ],
})
export class AppModule {}
