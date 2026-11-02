import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { Home } from './home';

describe('Home de la aplicación SSP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('resuelve / como landing sin barra lateral con el hero de StackSSP', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', Home);
    const page = harness.routeNativeElement;

    expect(page?.querySelector('aside')).toBeNull();
    expect(page?.querySelectorAll('h1')).toHaveLength(1);
    expect(page?.querySelector('h1')?.textContent).toBe('StackSSP');
    expect(TestBed.inject(Title).getTitle()).toBe('StackSSP');
    expect(page?.querySelector('.hero-subtitle')?.textContent).toBe(
      'Entrenamiento para la ordenación SSP.',
    );
    expect(page?.querySelector('.hero-description')?.textContent).toContain(
      'Aprende la ordenación SSP de manera fácil y a tu propio ritmo.',
    );
    expect(page?.querySelector('.hero-description')?.textContent).toContain(
      'Si Stebbins estándar',
    );
  });

  it('muestra las secciones de beneficios, práctica y llamado a la acción final', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', Home);
    const page = harness.routeNativeElement;
    const headings = Array.from(page?.querySelectorAll('h2') ?? [], (h) => h.textContent);

    expect(headings).toEqual([
      'Cálculo sencillo, no memoria bruta',
      'Localización al instante',
      'Magia de alto impacto',
      'Entrenamiento paso a paso',
    ]);
    expect(page?.querySelector('.practice-section')?.textContent).toContain(
      'Practica por bloques: primero los saltos de valor, luego el ciclo de palos, y finalmente une ambos conceptos.',
    );
    expect(page?.querySelector('.cta-message')?.textContent).toBe(
      'Coge tu baraja, pon el 9 de Picas arriba y descubre de lo que eres capaz.',
    );
    expect(page?.textContent).not.toContain('Tonio Velayos');
    expect(page?.querySelector('.playing-cards')).toBeNull();
  });

  it('presenta los botones de acción del curso sin navegación activa por ahora', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', Home);
    const page = harness.routeNativeElement;
    const buttons = Array.from(page?.querySelectorAll<HTMLButtonElement>('button') ?? []);

    expect(buttons.map((b) => b.textContent?.trim())).toEqual([
      'Iniciar el Curso',
      'Empezar el Curso',
    ]);
    buttons.forEach((button) => {
      expect(button.getAttribute('type')).toBe('button');
    });
  });
});
