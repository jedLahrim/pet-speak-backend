import { IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  text: string;

  isPetExpert?: boolean;
}
