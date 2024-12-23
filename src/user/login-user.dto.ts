import { IsOptional, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  emailOrUsername?: string;
}
