import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { version } from '../../../package.json';
import { App } from '../app';
import { routes } from '../app.routes';
import {
  COMPLETED_LESSONS_COOKIE,
  CURRENT_LESSON_COOKIE,
} from '../course/course-progress.service';

function clearCourseCookies(doc: Document): void {
  doc.cookie = `${CURRENT_LESSON_COOKIE}=; path=/; max-age=0`;
  doc.cookie = `${COMPLETED_LESSONS_COOKIE}=; path=/; max-age=0`;
}

describe('Pie de página común (Footer)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    clearCourseCookies(TestBed.inject(DOCUMENT));
  });

  afterEach(() => {
    clearCourseCookies(TestBed.inject(DOCUMENT));
  });

  it('se muestra en la portada y en las lecciones con marca StackSSP, versión de package.json, año actual, autoría y enlaces', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const currentYear = String(new Date().getFullYear());

    await router.navigateByUrl('/');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const footer = host.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain('StackSSP');
    expect(footer?.querySelector('.version-badge')?.textContent?.trim()).toBe(
      `v${version}`,
    );
    expect(footer?.textContent).toContain(currentYear);
    expect(footer?.textContent).toContain('Tonio Velayos');

    const nav = footer?.querySelector('nav[aria-label="Navegación del pie de página"]');
    expect(nav).toBeTruthy();
    const links = Array.from(nav?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Inicio', 'Curso']);
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[1].getAttribute('href')).toBe('/curso/leccion-1');

    // Al navegar a la lección 1 sigue presente el mismo pie de página común
    await router.navigateByUrl('/curso/leccion-1');
    fixture.detectChanges();

    const footerInLesson = host.querySelector('footer');
    expect(footerInLesson).toBeTruthy();
    expect(footerInLesson?.textContent).toContain(`v${version}`);
    expect(footerInLesson?.textContent).toContain('Tonio Velayos');
  });
});
