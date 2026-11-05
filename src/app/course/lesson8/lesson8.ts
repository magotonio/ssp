import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../icon';
import { CourseProgressService } from '../course-progress.service';
import { PrincipleMeta, PRINCIPLES } from './principles/principles';

@Component({
  selector: 'app-lesson8',
  imports: [RouterLink, Icon, NgComponentOutlet],
  templateUrl: './lesson8.html',
  styleUrl: './lesson8.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson8 {
  protected readonly progress = inject(CourseProgressService);
  private readonly document = inject(DOCUMENT);

  protected readonly principles = PRINCIPLES;
  protected readonly currentIndex = signal<number>(0);

  protected readonly current = computed<PrincipleMeta>(() => PRINCIPLES[this.currentIndex()]);
  protected readonly isFirst = computed<boolean>(() => this.currentIndex() === 0);
  protected readonly isLast = computed<boolean>(() => this.currentIndex() === PRINCIPLES.length - 1);

  protected readonly isLessonCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-8'),
  );

  constructor() {
    this.progress.recordLessonVisit('leccion-8');
  }

  protected goTo(index: number): void {
    if (index < 0 || index >= PRINCIPLES.length || index === this.currentIndex()) {
      return;
    }
    this.currentIndex.set(index);
    this.focusPrinciple();
  }

  protected previous(): void {
    this.goTo(this.currentIndex() - 1);
  }

  protected next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-8');
  }

  /** Devuelve el foco al título del principio para lectores de pantalla y teclado. */
  private focusPrinciple(): void {
    queueMicrotask(() => {
      this.document.getElementById('principio-actual')?.focus({ preventScroll: false });
    });
  }
}

