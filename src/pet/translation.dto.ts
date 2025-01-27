import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranslationDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  text: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;

  @IsOptional()
  @IsString()
  petId?: string;
}
