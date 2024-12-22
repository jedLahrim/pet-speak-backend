import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entity/pet.entity';
import { CreatePetDto } from './create-pet.dto';
import { AttachmentService } from '../attachment/attachment.service';
import { TranslationDto } from './translation.dto';
import { Translation } from './entity/translation.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    private readonly attachmentService: AttachmentService,
  ) {
  }

  async create(
    profileImageFile: Express.Multer.File,
    createPetDto: CreatePetDto,
    user: User,
  ): Promise<Pet> {
    let profileImageUrl: string;
    if (profileImageFile) {
      profileImageUrl = await this.attachmentService.upload(profileImageFile);
    }

    const pet = this.petRepository.create({
      ...createPetDto,
      profileImage: profileImageUrl,
      user: { id: user.id },
    });
    return await this.petRepository.save(pet);
  }

  async findAll(): Promise<Pet[]> {
    return await this.petRepository.find();
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({ where: { id }, relations: { user: true, translations: true } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    return pet;
  }

  async updateTranslation(
    id: string,
    translationDto: TranslationDto,
    voiceFile: Express.Multer.File,
  ): Promise<Pet> {
    const { text, label } = translationDto;
    if (!voiceFile) {
      throw new BadRequestException('No voice file is provided');
    }
    const voiceUrl = await this.attachmentService.upload(voiceFile);
    const pet = await this.findOne(id);
    await this.createTranslation({ petId: pet?.id, voiceUrl: voiceUrl, text: text, label: label });
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
