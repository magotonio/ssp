import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon, IconName } from './icon';

interface Resource {
  title: string;
  category: string;
  description: string;
  icon: IconName;
  color: string;
  duration: string;
}

interface StudySession {
  name: string;
  topic: string;
  minutes: number;
  reminders: boolean;
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly menuOpen = signal(false);
  readonly activeSection = signal('inicio');
  readonly lessonOpen = signal(false);
  readonly lessonCompleted = signal(false);
  readonly search = signal('');
  readonly selectedResource = signal<Resource | null>(null);
  readonly session = signal<StudySession | null>(null);
  readonly submitted = signal(false);
  readonly previousWeek = signal(false);
  readonly trainingPhase = signal<'ready' | 'memorize' | 'recall' | 'result'>('ready');
  readonly sequence = signal<number[]>([3, 1, 4, 2]);
  readonly answers = signal<number[]>([]);
  readonly today = new Intl.DateTimeFormat('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());
  readonly navigation: { id: string; label: string; icon: IconName }[] = [
    { id: 'inicio', label: 'Mi espacio', icon: 'grid' },
    { id: 'lecciones', label: 'Mis lecciones', icon: 'book' },
    { id: 'entrenamiento', label: 'Entrenamiento', icon: 'brain' },
    { id: 'progreso', label: 'Mi progreso', icon: 'chart' },
    { id: 'biblioteca', label: 'Biblioteca', icon: 'folder' },
  ];
  readonly resources: Resource[] = [
    { title: 'El arte de recordar', category: 'Guía práctica', description: 'Relaciona una idea nueva con algo que ya conoces. Después, crea una imagen mental singular y comprueba si puedes recuperarla sin mirar tus notas.', icon: 'book', color: 'sage', duration: '8 min de lectura' },
    { title: 'Una imagen, mil ideas', category: 'Ejercicio visual', description: 'Observa un objeto durante un minuto. Cierra los ojos y describe su forma, textura y color. Vuelve a observarlo y compara los detalles.', icon: 'brain', color: 'peach', duration: '5 min de práctica' },
    { title: 'Tu primera baraja mental', category: 'Tarjetas de estudio', description: 'Escribe una pregunta por tarjeta y su respuesta al dorso. Intenta responder antes de girarla y separa las tarjetas que necesitan otro repaso.', icon: 'cards', color: 'lavender', duration: '12 tarjetas' },
  ];
  readonly filteredResources = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('es');
    return this.resources.filter((resource) =>
      `${resource.title} ${resource.category}`.toLocaleLowerCase('es').includes(query),
    );
  });
  readonly weeklyActivity = computed(() =>
    this.previousWeek() ? [30, 45, 20, 55, 35, 65, 45] : [40, 65, 48, 85, 60, 100, this.lessonCompleted() ? 95 : 72],
  );
  readonly dailyProgress = computed(() => this.lessonCompleted() ? 100 : 75);
  readonly correctAnswers = computed(() =>
    this.answers().filter((answer, index) => this.sequence()[index] === answer).length,
  );
  readonly sessionForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)] }),
    topic: new FormControl('Técnicas de memoria', { nonNullable: true, validators: [Validators.required] }),
    minutes: new FormControl(15, { nonNullable: true, validators: [Validators.required, Validators.min(5), Validators.max(60)] }),
    reminders: new FormControl(true, { nonNullable: true }),
  });

  navigate(section: string): void {
    this.activeSection.set(section);
    this.menuOpen.set(false);
  }

  startTraining(): void {
    const numbers = [1, 2, 3, 4];
    for (let index = numbers.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [numbers[index], numbers[target]] = [numbers[target], numbers[index]];
    }
    this.sequence.set(numbers);
    this.answers.set([]);
    this.trainingPhase.set('memorize');
  }

  testMemory(): void {
    if (this.trainingPhase() === 'memorize') {
      this.trainingPhase.set('recall');
    }
  }

  answer(value: number): void {
    if (this.trainingPhase() !== 'recall' || this.answers().includes(value)) return;
    this.answers.update((answers) => [...answers, value]);
    if (this.answers().length === 4) this.trainingPhase.set('result');
  }

  saveSession(): void {
    this.submitted.set(true);
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    const value = this.sessionForm.getRawValue();
    this.session.set({ ...value, name: value.name.trim() });
    this.submitted.set(false);
  }
}
