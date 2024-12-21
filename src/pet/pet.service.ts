import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entity/pet.entity';
import { CreatePetDto } from './create-pet.dto';
import { UpdatePetDto } from './update-pet.dto';
import { AttachmentService } from '../attachment/attachment.service';
import { TranslationDto } from './translation.dto';
import { Translation } from './entity/translation.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    private readonly attachmentService: AttachmentService,
  ) {}

  async create(
    profileImageFile: Express.Multer.File,
    createPetDto: CreatePetDto,
  ): Promise<Pet> {
    if (!profileImageFile) {
      throw new BadRequestException('No file provided');
    }
    const profileImageUrl = await this.attachmentService.upload(
      profileImageFile,
    );
    const pet = this.petRepository.create({
      ...createPetDto,
      profileImage: profileImageUrl,
      createdAt: new Date(),
    });
    return await this.petRepository.save(pet);
  }

  async findAll(): Promise<Pet[]> {
    return await this.petRepository.find();
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async update(
    id: string,
    updatePetDto: UpdatePetDto,
    voiceFile: Express.Multer.File,
  ): Promise<Pet> {
    if (!voiceFile) {
      throw new BadRequestException('No file provided');
    }
    const voiceUrl = await this.attachmentService.upload(voiceFile);
    await this.findOne(id);
    await this.petRepository.update(id, {
      ...updatePetDto,
      voiceUrl: voiceUrl,
      updatedAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.petRepository.delete(id);
  }

  async createTranslation(translationDto: TranslationDto) {
    await this.findOne(translationDto.petId);
    const translations = this.translationRepository.create({
      ...translationDto,
      pet: { id: translationDto.petId },
    });
    return await this.translationRepository.save(translations);
  }
}
