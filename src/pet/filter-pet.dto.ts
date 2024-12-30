import { IsOptional, IsString } from 'class-validator';

export class FilterPetDto {
  @IsOptional()
  @IsString()
  petId?: string;
}
