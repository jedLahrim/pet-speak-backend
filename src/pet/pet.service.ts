import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entity/pet.entity';
import { CreatePetDto } from './create-pet.dto';
import { AttachmentService } from '../attachment/attachment.service';
import { TranslationDto } from './translation.dto';
import { Translation } from './entity/translation.entity';
import { User } from '../user/entity/user.entity';
import { GenerateSuggestionDto } from './generate-suggestion.dto';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Constant } from '../common/constant/constant';
import { UpdatePetDto } from './update-pet.dto';
import axios from 'axios';

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
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: { user: true, translations: true },
    });
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
    const { text, label, languageCode} = translationDto;
    if (!voiceFile) {
      throw new BadRequestException('No voice file is provided');
    }
    const voiceUrl = await this.attachmentService.upload(voiceFile);
    const pet = await this.findOne(id);
    await this.createTranslation({
      petId: pet?.id,
      voiceUrl: voiceUrl,
      text: text,
      label: label,
      languageCode: languageCode,
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

  async generateSuggestion(generateSuggestionDto: GenerateSuggestionDto) {
    const { text, languageCode } = generateSuggestionDto;
    const generatedText = await this.getRefinedText(text, languageCode);
    const speech = await this.textToSpeech(generatedText, languageCode);
    return { text: generatedText, speech };
  }

  async textToSpeech(speech: string, languageCode: string): Promise<string> {
    // Make sure gTTS is properly imported
    const GTTSConstructor = require('gtts');
    const gtts = new GTTSConstructor(speech, languageCode);

    // Use /tmp directory for Vercel serverless functions
    const tempFilePath = path.join('/tmp', `${crypto.randomUUID()}.mp3`);

    return new Promise<string>((resolve, reject) => {
      gtts.save(tempFilePath, async (err: Error) => {
        if (err) {
          return reject(err);
        }

        try {
          const fileBuffer = fs.readFileSync(tempFilePath);

          const audioLink = await this.attachmentService.upload({
            originalname: path.basename(tempFilePath),
            buffer: fileBuffer,
            mimetype: 'audio/mpeg',
          });

          // Clean up the temporary file
          fs.unlinkSync(tempFilePath);

          resolve(audioLink);
        } catch (uploadError) {
          // Clean up the temporary file even if upload fails
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          reject(new Error(`Upload failed: ${uploadError?.message}`));
        }
      });
    });
  }

  async getRefinedText(
    originalText: string,
    languageCode: string,
  ): Promise<string> {
    try {
      const prompt = `Please Generates a 300 characters text rewriting the following text with a clear and concise explanation in the same language code ${languageCode}. Ensure the generated text is not less than 300 characters. Do not exceed or fall short of this range. 
              Here is the text: ${originalText}`;
      const options = {
        method: 'POST',
        url: Constant.OPEN_AI_URL,
        headers: Constant.OPEN_AI_HEADERS,
        data: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
      };
      // Replace with your ChatGPT API call logic
      const response = await axios.request(options);
      const data = response.data;
      return data.choices[0].message.content;
    } catch (e) {
      console.log(e);
    }
  }

  async update(
    profileImageFile: Express.Multer.File,
    updatePetDto: UpdatePetDto,
    id: string,
  ) {
    let profileImageUrl: string;
    if (profileImageFile) {
      profileImageUrl = await this.attachmentService.upload(profileImageFile);
    }
    updatePetDto.profileImage ??= profileImageUrl;
    await this.petRepository.update(id, updatePetDto);
    return this.findOne(id);
  }

  async getTranslation(id: string): Promise<Translation> {
  const translation = await this.translationRepository.findOne({ where: { id } });
  if (!translation) {
    throw new NotFoundException(`Translation with ID ${id} not found`);
  }
  return translation;
}

async deleteTranslation(id: string): Promise<void> {
  const translation = await this.getTranslation(id);
  await this.translationRepository.remove(translation);
}

async getAllTranslations(petId: string): Promise<Translation[]> {
  const translations = await this.translationRepository
    .createQueryBuilder('translation')
    .where('translation.petId = :petId', { petId })
     .orderBy('translation.createdAt', 'DESC')
    .getMany();

  return translations;
}

}
