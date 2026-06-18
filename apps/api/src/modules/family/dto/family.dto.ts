import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { FamilyChallengeKind } from '@ai-academy/types';

export class CreateFamilyGroupDto {
  @IsString()
  @MaxLength(60)
  name!: string;
}

export class CreateChallengeDto {
  @IsString()
  groupId!: string;

  @IsEnum(FamilyChallengeKind)
  kind!: FamilyChallengeKind;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsString()
  goalType!: string; // READ_TOGETHER | ENGLISH_TALK | MOVEMENT

  @IsInt()
  @Min(1)
  targetValue!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewardXp?: number;
}

export class LogChallengeProgressDto {
  @IsInt()
  @Min(1)
  value!: number;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
