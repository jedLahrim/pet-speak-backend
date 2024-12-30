import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Injectable,
  NotFoundException,
  Query
} from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './create-pet.dto';
import { Pet } from './entity/pet.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranslationDto } from './translation.dto';
import { JwtAuthGuard } from '../user/guard/jwt-auth.guard';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entity/user.entity';
import { GenerateSuggestionDto } from './generate-suggestion.dto';
import { UpdatePetDto } from './update-pet.dto';
import { FilterPetDto } from './filter-pet.dto';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

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

  // @Post('translation')
  // @UseGuards(JwtAuthGuard)
  // // @UseInterceptors(FileInterceptor('file'))
  // createTranslation(
  //   @Body() translationDto: TranslationDto,
  // ): Promise<Translation> {
  //   return this.petService.createTranslation(translationDto);
  // }

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

  @Post(':id/translation')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('voiceFile'))
  updateTranslation(
    @UploadedFile() voiceFile: Express.Multer.File,
    @Param('id') id: string,
    @Body() translationDto: TranslationDto,
    @GetUser() user: User,
  ): Promise<Pet> {
    return this.petService.updateTranslation(id, translationDto, voiceFile);
  }


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
async getAllTranslations(@Query() filterPetDto: FilterPetDto): Promise<Translation[]> {
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
}
