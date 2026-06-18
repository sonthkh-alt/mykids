import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuestsService } from './quests.service';
import { LESSON_COMPLETED, type LessonCompletedEvent } from '../learning/events';

/** Khi học xong 1 bài → tự hoàn thành nhiệm vụ hằng ngày tương ứng. */
@Injectable()
export class QuestsListener {
  constructor(private readonly quests: QuestsService) {}

  @OnEvent(LESSON_COMPLETED)
  async onLessonCompleted(e: LessonCompletedEvent): Promise<void> {
    await this.quests.autoCompleteForSubject(e.studentId, e.subject);
  }
}
