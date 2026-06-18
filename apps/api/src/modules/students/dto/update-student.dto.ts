import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LearningStyle, ProficiencyLevel } from '@ai-academy/types';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(6)
  grade?: number;

  @IsOptional()
  @IsString()
  avatarId?: string;

  @IsOptional()
  @IsEnum(LearningStyle)
  learningStyle?: LearningStyle;

  @IsOptional()
  @IsEnum(ProficiencyLevel)
  englishLevel?: ProficiencyLevel;

  @IsOptional()
  @IsEnum(ProficiencyLevel)
  mathLevel?: ProficiencyLevel;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  goal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
