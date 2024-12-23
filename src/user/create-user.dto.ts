import { IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @Length(3, 30)
  emailOrUsername?: string;
}
