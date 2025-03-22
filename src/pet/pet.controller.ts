import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './create-pet.dto';
import { Pet } from './entity/pet.entity';
import { Translation } from './entity/translation.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranslationDto } from './translation.dto';
import { JwtAuthGuard } from '../user/guard/jwt-auth.guard';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entity/user.entity';
import { GenerateSuggestionDto } from './generate-suggestion.dto';
import { UpdatePetDto } from './update-pet.dto';
import { FilterPetDto } from './filter-pet.dto';
import { ChatDto } from './chat.dto';
import { PetType } from './enums/pet-type.enum';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImageFile'))
  create(
    @UploadedFile() profileImageFile: Express.Multer.File,
    @Body() createPetDto: CreatePetDto,
    @GetUser() user: User,
  ): Promise<Pet> {
    return this.petService.create(profileImageFile, createPetDto, user);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImageFile'))
  update(
    @UploadedFile() profileImageFile: Express.Multer.File,
    @Body() updatePetDto: UpdatePetDto,
    @Param('id') id: string,
  ): Promise<Pet> {
    return this.petService.update(profileImageFile, updatePetDto, id);
  }

  @Post('create/translation')
  @UseGuards(JwtAuthGuard)
  createTranslation(
    @Body() translationDto: TranslationDto,
  ): Promise<Translation> {
    return this.petService.createTranslation(translationDto);
  }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // findAll(): Promise<Pet[]> {
  //   return this.petService.findAll();
  // }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<Pet> {
    return this.petService.findOne(id);
  }

  // @Post(':id/translation')
  // @UseGuards(JwtAuthGuard)
  // updateTranslation(
  //   @Param('id') id: string,
  //   @Body() translationDto: TranslationDto,
  // ): Promise<void> {
  //   return this.petService.updateTranslation(id, translationDto);
  // }

  @Get(':id/translation')
  async getTranslation(@Param('id') id: string): Promise<Translation> {
    try {
      return await this.petService.getTranslation(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id/translation')
  async deleteTranslation(@Param('id') id: string): Promise<void> {
    try {
      await this.petService.deleteTranslation(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  async getAllTranslations(
    @Query() filterPetDto: FilterPetDto,
  ): Promise<Translation[]> {
    const { petId } = filterPetDto;
    return await this.petService.getAllTranslations(petId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.petService.remove(id);
  }

  @Post('generate/suggestion')
  @UseGuards(JwtAuthGuard)
  generateSuggestion(
    @Body() generateSuggestionDto: GenerateSuggestionDto,
  ): Promise<{ speech: string }> {
    return this.petService.generateSuggestion(generateSuggestionDto);
  }

  @Post('generate/chat')
  // @UseGuards(JwtAuthGuard)
  chat(@Body() dto: ChatDto) {
    return this.petService.chat(dto);
  }

  @Post('generate/transcribe')
  @UseInterceptors(FileInterceptor('audio_file'))
  async transcribeAudio(@UploadedFile() audioFile: Express.Multer.File) {
       return this.petService.transcribeAudio(audioFile);
  }

  @Post('generate/quiz')
  @UseGuards(JwtAuthGuard)
  getQuiz(@Body() dto: { petType: PetType }) {
    return this.petService.getQuiz(dto);
  }
}
