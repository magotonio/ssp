import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type LessonId =
  | 'introduccion'
  | 'leccion-1'
  | 'leccion-2'
  | 'leccion-3'
  | 'leccion-4'
  | 'leccion-5';

export interface CourseLessonMeta {
  readonly id: LessonId;
  readonly label: string;
  readonly title: string;
  readonly route: string;
}

export const COURSE_LESSONS: readonly CourseLessonMeta[] = [
  {
    id: 'introduccion',
    label: 'Introducción',
    title: 'Construcción visual de la SSP',
    route: '/curso/introduccion',
  },
  {
    id: 'leccion-1',
    label: 'Lección 1',
    title: 'Montaje de la baraja en las manos',
    route: '/curso/leccion-1',
  },
  {
    id: 'leccion-2',
    label: 'Lección 2',
    title: 'Cálculo del siguiente índice',
    route: '/curso/leccion-2',
  },
  {
    id: 'leccion-3',
    label: 'Lección 3',
    title: 'El orden de los palos',
    route: '/curso/leccion-3',
  },
  {
    id: 'leccion-4',
    label: 'Lección 4',
    title: 'Integración de índice y palo',
    route: '/curso/leccion-4',
  },
  {
    id: 'leccion-5',
    label: 'Lección 5',
    title: 'Los cuatro reinos de la baraja',
    route: '/curso/leccion-5',
  },
] as const;

export const CURRENT_LESSON_COOKIE = 'ssp_current_lesson';
export const COMPLETED_LESSONS_COOKIE = 'ssp_completed_lessons';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function isValidLessonId(value: string): value is LessonId {
  return COURSE_LESSONS.some((lesson) => lesson.id === value);
}

function normalizeLessonId(value: string): LessonId | null {
  const trimmed = value.trim();
  return isValidLessonId(trimmed) ? trimmed : null;
}

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  private readonly document = inject(DOCUMENT);

  private readonly currentLessonState = signal<LessonId | null>(null);
  private readonly completedLessonsState = signal<readonly LessonId[]>([]);
  private readonly cookiesEnabledState = signal<boolean>(true);

  readonly currentLessonId = this.currentLessonState.asReadonly();
  readonly completedLessonIds = this.completedLessonsState.asReadonly();
  readonly cookiesAvailable = this.cookiesEnabledState.asReadonly();

  readonly savedLesson = computed<CourseLessonMeta | null>(() => {
    const id = this.currentLessonState();
    if (!id) {
      return null;
    }
    return COURSE_LESSONS.find((lesson) => lesson.id === id) ?? null;
  });

  readonly hasSavedProgress = computed<boolean>(
    () => this.savedLesson() !== null || this.completedLessonsState().length > 0,
  );

  readonly targetCourseRoute = computed<string>(
    () => this.savedLesson()?.route ?? COURSE_LESSONS[0].route,
  );

  constructor() {
    this.syncFromCookies();
  }

  syncFromCookies(): void {
    const rawCurrent = this.readCookie(CURRENT_LESSON_COOKIE);
    const validCurrent = rawCurrent ? normalizeLessonId(rawCurrent) : null;
    this.currentLessonState.set(validCurrent);

    const rawCompleted = this.readCookie(COMPLETED_LESSONS_COOKIE);
    if (!rawCompleted) {
      this.completedLessonsState.set([]);
      return;
    }

    const parsed = rawCompleted
      .split(',')
      .map(normalizeLessonId)
      .filter((item): item is LessonId => item !== null);

    this.completedLessonsState.set(Array.from(new Set(parsed)));
  }

  recordLessonVisit(lessonId: LessonId): void {
    this.currentLessonState.set(lessonId);
    this.writeCookie(CURRENT_LESSON_COOKIE, lessonId);
  }

  markLessonCompleted(lessonId: LessonId): void {
    const updated = Array.from(new Set([...this.completedLessonsState(), lessonId]));
    this.completedLessonsState.set(updated);
    this.currentLessonState.set(lessonId);
    this.writeCookie(CURRENT_LESSON_COOKIE, lessonId);
    this.writeCookie(COMPLETED_LESSONS_COOKIE, updated.join(','));
  }

  isLessonCompleted(lessonId: LessonId): boolean {
    return this.completedLessonsState().includes(lessonId);
  }

  private readCookie(name: string): string | null {
    try {
      const cookieSource = this.document.cookie ?? '';
      if (!cookieSource) {
        return null;
      }

      for (const part of cookieSource.split(';')) {
        const trimmed = part.trim();
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
          continue;
        }
        const key = trimmed.slice(0, separatorIndex).trim();
        if (key === name) {
          return decodeURIComponent(trimmed.slice(separatorIndex + 1));
        }
      }
      return null;
    } catch {
      this.cookiesEnabledState.set(false);
      return null;
    }
  }

  private writeCookie(name: string, value: string): void {
    try {
      this.document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      const verify = this.readCookie(name);
      this.cookiesEnabledState.set(verify === value);
    } catch {
      this.cookiesEnabledState.set(false);
    }
  }
}
