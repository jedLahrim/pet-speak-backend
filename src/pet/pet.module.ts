import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { Pet } from './entity/pet.entity';
import { Translation } from './entity/translation.entity';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Translation]), AttachmentModule],
  providers: [PetService],
  controllers: [PetController],
})
export class PetModule {}
