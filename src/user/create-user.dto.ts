import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  username?: string;
}
