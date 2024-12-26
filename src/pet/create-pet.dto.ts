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


// AI Prompt: "Please provide a clear and concise explanation of the following text in the same language. Here is the text: [insert your text here]."
