import { IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
