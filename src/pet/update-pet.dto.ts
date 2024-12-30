import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender, PetType } from './enums/pet-type.enum';
import { TranslationDto } from './translation.dto';

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(PetType)
  @IsOptional()
  petType?: PetType;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  translationText?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;

  @IsOptional()
  translationDto?: TranslationDto;
}
