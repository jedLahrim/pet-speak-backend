import { IsOptional, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsString()
  emailOrUsername?: string;
}
