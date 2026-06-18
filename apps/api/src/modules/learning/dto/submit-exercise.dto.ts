import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AnswerItemDto {
  @IsString()
  questionId!: string;

  @IsString()
  response!: string; // option id / text / code

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs?: number;
}

export class SubmitExerciseDto {
  @IsString()
  studentId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];
}

export class MathHintRequestDto {
  @IsString()
  studentId!: string;

  @IsString()
  problem!: string;

  @IsOptional()
  reveal?: boolean;
}
