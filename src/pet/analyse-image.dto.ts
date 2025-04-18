import { IsOptional, IsString } from 'class-validator';

export class AnalyseImageDto {
  @IsOptional()
  @IsString()
  text?: string;
}
