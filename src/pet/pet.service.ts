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
    const { text, label } = translationDto;
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

  async getRefinedText(originalText: string, languageCode: string): Promise<string> {
    const prompt = `Please rewrite the following text with a clear and concise explanation in the same language code ${languageCode}. Ensure the generated text is between 200 and 300 characters. Do not exceed or fall short of this range. 
              Here is the text: ${originalText}`;

    // Replace with your ChatGPT API call logic
    const response = await fetch(Constant.OPEN_AI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_CHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async update(
    profileImageFile: Express.Multer.File,
    updatePetDto: UpdatePetDto,
    id: string,
  ) {
    let profileImageUrl: string;
    if (profileImageUrl) {
      profileImageUrl = await this.attachmentService.upload(profileImageFile);
    }
    updatePetDto.profileImag ??= profileImageUrl;
    await this.petRepository.update(id, updatePetDto);
    return this.findOne(id);
  }
}
