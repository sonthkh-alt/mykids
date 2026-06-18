import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Subject } from '@ai-academy/types';

export class AiTutorRequestDto {
  @IsEnum(Subject)
  subject!: Subject;

  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  studentId!: string;
}
