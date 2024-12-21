import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender, PetType } from './enums/pet-type.enum';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsEnum(PetType)
  petType: PetType;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  profileImag?: string;

  @IsOptional()
  @IsString()
  translationText?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;
}
