import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './create-pet.dto';
import { Pet } from './entity/pet.entity';
import { UpdatePetDto } from './update-pet.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranslationDto } from './translation.dto';
import { Translation } from './entity/translation.entity';
import { JwtAuthGuard } from '../user/guard/jwt-auth.guard';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entity/user.entity';

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

  @Post('translation')
  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  createTranslation(
    @Body() translationDto: TranslationDto,
  ): Promise<Translation> {
    return this.petService.createTranslation(translationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<Pet[]> {
    return this.petService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<Pet> {
    return this.petService.findOne(id);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('voiceFile'))
  update(
    @UploadedFile() voiceFile: Express.Multer.File,
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @GetUser() user: User,
  ): Promise<Pet> {
    return this.petService.update(id, updatePetDto, voiceFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.petService.remove(id);
  }
}
