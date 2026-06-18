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

export class CreateStudentDto {
  @IsString()
  @MaxLength(60)
  displayName!: string;

  @IsInt()
  @Min(3)
  @Max(6)
  grade!: number;

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
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
