import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('Panel de estudio', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('muestra el panel, navegación y recursos de ejemplo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('h1')?.textContent).toContain('Tu memoria tiene mucho potencial');
    expect(page.querySelectorAll('nav a')).toHaveLength(5);
    expect(page.querySelectorAll('.resource')).toHaveLength(3);
    expect(page.querySelectorAll('.memory-tile')).toHaveLength(4);
  });

  it('rechaza un formulario vacío y muestra el error accesible', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.session()).toBeNull();
    expect(page.querySelector('#name-error')?.getAttribute('role')).toBe('alert');
    expect(page.querySelector('#session-name')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('rechaza nombres que solo contienen espacios', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.sessionForm.controls.name.setValue('   ');
    app.saveSession();
    expect(app.session()).toBeNull();
    expect(app.submitted()).toBe(true);
  });

  it('guarda una sesión válida sin persistencia externa', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.sessionForm.setValue({
      name: '  Mi repaso  ', topic: 'Estudio activo', minutes: 30, reminders: false,
    });
    app.saveSession();
    await fixture.whenStable();
    expect(app.session()).toEqual({
      name: 'Mi repaso', topic: 'Estudio activo', minutes: 30, reminders: false,
    });
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.session-success')?.textContent).toContain('Sin recordatorio.');
    expect(TestBed.createComponent(App).componentInstance.session()).toBeNull();
  });

  it('valida los límites de duración y nombre', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.sessionForm.controls.name.setValue('a'.repeat(61));
    app.sessionForm.controls.minutes.setValue(61);
    app.saveSession();
    expect(app.session()).toBeNull();
    app.sessionForm.controls.name.setValue('Sesión');
    app.sessionForm.controls.minutes.setValue(4);
    expect(app.sessionForm.invalid).toBe(true);
    app.sessionForm.controls.minutes.setValue(5);
    expect(app.sessionForm.valid).toBe(true);
    app.sessionForm.controls.minutes.setValue(60);
    expect(app.sessionForm.valid).toBe(true);
  });

  it('filtra recursos y muestra un estado vacío', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const input = page.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input).not.toBeNull();
    if (!input) throw new Error('No se encuentra el buscador');
    input.value = '  TARJETAS ';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(page.querySelectorAll('.resource')).toHaveLength(1);
    fixture.componentInstance.search.set('sin coincidencias');
    await fixture.whenStable();
    expect(page.querySelectorAll('.resource')).toHaveLength(0);
    expect(page.querySelector('.empty-state')?.textContent).toContain('No hay recursos');
  });

  it('abre una lección y actualiza el progreso al completarla', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('.play-button')?.click();
    await fixture.whenStable();
    expect(page.querySelector('#lesson-detail')).not.toBeNull();
    page.querySelector<HTMLButtonElement>('#lesson-detail button')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.dailyProgress()).toBe(100);
    expect(page.querySelector('#progreso')?.textContent).toContain('4 de 4');
    expect(page.querySelector<HTMLButtonElement>('#lesson-detail button')?.disabled).toBe(true);
  });

  it('oculta la secuencia durante la prueba y cuenta las respuestas', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.startTraining();
    expect([...app.sequence()].sort()).toEqual([1, 2, 3, 4]);
    app.testMemory();
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(Array.from(page.querySelectorAll('.memory-tile')).every((tile) =>
      tile.textContent?.trim().startsWith('?'),
    )).toBe(true);
    for (const value of app.sequence()) app.answer(value);
    expect(app.correctAnswers()).toBe(4);
    expect(app.trainingPhase()).toBe('result');
    await fixture.whenStable();
    expect(page.querySelector('#entrenamiento')?.textContent).toContain('Has acertado 4 de 4');
  });

  it('no acepta respuestas fuera de la prueba ni duplicadas, y permite reiniciar', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.answer(1);
    expect(app.answers()).toEqual([]);
    app.testMemory();
    expect(app.trainingPhase()).toBe('ready');
    app.startTraining();
    app.testMemory();
    app.answer(1);
    app.answer(1);
    expect(app.answers()).toEqual([1]);
    app.startTraining();
    expect(app.answers()).toEqual([]);
    expect(app.trainingPhase()).toBe('memorize');
  });

  it('detecta una secuencia incorrecta', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.startTraining();
    app.sequence.set([1, 2, 3, 4]);
    app.testMemory();
    [4, 3, 2, 1].forEach((value) => app.answer(value));
    expect(app.trainingPhase()).toBe('result');
    expect(app.correctAnswers()).toBe(0);
  });

  it('alterna el menú y lo cierra al navegar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('.mobile-toggle')?.click();
    await fixture.whenStable();
    expect(page.querySelector('.mobile-toggle')?.getAttribute('aria-expanded')).toBe('true');
    fixture.componentInstance.navigate('biblioteca');
    await fixture.whenStable();
    expect(fixture.componentInstance.menuOpen()).toBe(false);
    expect(page.querySelector('nav [aria-current]')?.getAttribute('href')).toBe('#biblioteca');
  });

  it('permite consultar recursos y cambiar el gráfico semanal', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    page.querySelector<HTMLButtonElement>('.resource')?.click();
    page.querySelector<HTMLButtonElement>('.week-heading button')?.click();
    await fixture.whenStable();
    expect(page.querySelector('#resource-detail')?.textContent).toContain('El arte de recordar');
    expect(fixture.componentInstance.weeklyActivity()).toEqual([30, 45, 20, 55, 35, 65, 45]);
    page.querySelector<HTMLButtonElement>('#resource-detail button')?.click();
    await fixture.whenStable();
    expect(page.querySelector('#resource-detail')).toBeNull();
  });
});
