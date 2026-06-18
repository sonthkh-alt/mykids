import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { StudentsController } from './students.controller';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository],
  exports: [StudentsService],
})
export class StudentsModule {}
