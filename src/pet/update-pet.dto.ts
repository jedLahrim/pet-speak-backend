import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender, PetType } from './enums/pet-type.enum';

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
  profileImag?: string;

  @IsOptional()
  @IsString()
  translationText?: string;
  @IsOptional()
  @IsString()
  voiceUrl?: string;
}
