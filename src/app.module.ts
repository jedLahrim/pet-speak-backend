import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';
import { AttachmentModule } from './attachment/attachment.module';
import { ConfigModule } from '@nestjs/config';

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
    }),
    UserModule,
    PetModule,
    AttachmentModule,
  ],
})
export class AppModule {}
