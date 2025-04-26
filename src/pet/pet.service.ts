import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { ChatDto } from './chat.dto';
import { PetType } from './enums/pet-type.enum';
import catQuiz from './assets/json/cat-quiz.json';
import dogQuiz from './assets/json/dog-quiz.json';
import { Question } from './entity/questions.entity';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { AnalyseImageDto } from './analyse-image.dto';

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
    // voiceFile: Express.Multer.File,
  ): Promise<void> {
    const { text, label, languageCode } = translationDto;
    // if (!voiceFile) {
    //   throw new BadRequestException('No voice file is provided');
    // }
    // const voiceUrl = await this.attachmentService.upload(voiceFile);
    // const pet = await this.findOne(id);
    await this.createTranslation({
      petId: id,
      // voiceUrl: voiceUrl,
      text: text,
      label: label,
      languageCode: languageCode,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.petRepository.delete(id);
  }

  async createTranslation(translationDto: TranslationDto) {
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

  async transcribeAudio(audioFile: Express.Multer.File) {
    if (!audioFile) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const formData = new FormData();
      const originalFileName = audioFile?.originalname;
      const fileName = `${uuidv4()}_${originalFileName}`;
      // Use the buffer directly
      const buffer = audioFile.buffer;
      formData.append('file', buffer, fileName);
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        `${process.env.OPENAI_BASE_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_TRANSCRIPTION_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return { transcribed_text: response.data.text };
    } catch (error) {
      throw new InternalServerErrorException({ error });
    }
  }

  async getRefinedText(
    originalText: string,
    languageCode: string,
  ): Promise<string> {
    try {
      const prompt = `Explain the following text in detail, 
      maintaining the same Language Code: '${languageCode}': \n${originalText}`;
      const data = await this._callAi(prompt);
      return data?.choices[0].message?.content;
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
    const translation = await this.translationRepository.findOne({
      where: { id },
    });
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

  async chat(dto: ChatDto): Promise<{ message: string }> {
    const { text, isPetExpert } = dto;
    const data = await this._callAi(text, isPetExpert);
    return { message: data?.choices[0].message?.content };
  }

  getQuiz(dto: { petType: PetType }) {
    const { petType } = dto;
    switch (petType) {
      case PetType.CAT:
        return this.getRandomItems<Question>(catQuiz, 10);
      case PetType.DOG:
        return this.getRandomItems<Question>(dogQuiz, 10);
    }
  }

  getRandomItems<T>(array: Array<T>, count: number): Array<T & { id: string }> {
    if (!array || array.length === 0) return [];

    // Map to add unique IDs
    const mappedArray = array.map((value) => ({
      id: crypto.randomUUID(),
      ...value,
    }));

    // Fisher-Yates shuffle
    for (let i = mappedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mappedArray[i], mappedArray[j]] = [mappedArray[j], mappedArray[i]];
    }

    // Return the specified count of random items
    return mappedArray.slice(0, count);
  }

  _createRequestOptions = (content: any, model: string, url: string) => ({
    method: 'POST',
    url,
    headers: Constant.OPEN_AI_HEADERS,
    data: {
      messages: [
        {
          role: 'system',
          content:
            "You are 'Vet 2' a pet expert with a PhD in veterinary medicine. powered by Mobinuity labs",
        },
        {
          role: 'user',
          content: content,
        },
      ],
      stream: false,
      model,
    },
  });

  async analyseImage(imageFile: Express.Multer.File, dto: AnalyseImageDto) {
    const { text } = dto;
    if (!imageFile) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const imageUrl = this._getImageUrl(imageFile);
      const requestOptions = this._createRequestOptions(
        [
          {
            type: 'text',
            text: text ?? 'Please analyse this image',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
        Constant.OPEN_AI_MODEL_NAME,
        Constant.OPEN_AI_URL,
      );
      const response = await axios.request(requestOptions);
      const content: string = response?.data?.choices[0]?.message?.content;
      return { message: content };
    } catch (e) {
      throw e;
    }
  }

  private async _callAi(prompt: string, isPetExpert?: boolean) {
    const primaryOptions = this._createRequestOptions(
      prompt,
      isPetExpert ? 'deepseek/deepseek-v3-turbo' : Constant.OPEN_AI_MODEL_NAME,
      isPetExpert
        ? 'https://router.huggingface.co/novita/v3/openai/chat/completions'
        : Constant.OPEN_AI_URL,
    );

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
      const response = (await Promise.race([
        axios.request(primaryOptions),
        timeoutPromise,
      ])) as { data: any };
      return response.data;
    } catch (firstError) {
      if (firstError.message === 'Request timeout') {
        try {
          const fallbackOptions = this._createRequestOptions(
            prompt,
            'deepseek/deepseek-v3-turbo',
            Constant.SECOND_OPEN_AI_URL,
          );
          const secondResponse = (await axios.request(fallbackOptions)) as {
            data: any;
          };
          return secondResponse.data;
        } catch (secondError) {
          console.error('Fallback request failed:', secondError);
          throw secondError;
        }
      }
      console.error('Initial request failed:', firstError);
      throw firstError;
    }
  }

  private _getImageUrl(imageFile: Express.Multer.File) {
    const base64Image = imageFile?.buffer.toString('base64');
    const extension = path.extname(imageFile.originalname).slice(1);
    return `data:image/${extension};base64,${base64Image}`;
  }
}
