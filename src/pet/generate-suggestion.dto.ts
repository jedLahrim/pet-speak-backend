import { IsString } from 'class-validator';

export class GenerateSuggestionDto {
  @IsString()
  text: string;

  @IsString()
  languageCode: string;
}
