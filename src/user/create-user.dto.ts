import { IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  emailOrUsername?: string;
}
