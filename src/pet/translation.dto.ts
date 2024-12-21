import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranslationDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  petId: string;
}
