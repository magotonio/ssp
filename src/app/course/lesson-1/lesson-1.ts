import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../../icon';
import { SUITS, SuitCode, SuitMeta } from '../../ssp/ssp-stack';
import { SuitIcon } from '../../ssp/suit-icon';
import { CourseProgressService } from '../course-progress.service';
import { SspCircle } from './ssp-circle';

interface ConstructionRuleItem {
  readonly suit: SuitCode;
  readonly suitMeta: SuitMeta;
  readonly heading: string;
  readonly description: string;
}

interface SspPropertyItem {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly tone: 'peach' | 'sage' | 'lavender';
}

@Component({
  selector: 'app-lesson-1',
  imports: [RouterLink, Icon, SuitIcon, SspCircle],
  templateUrl: './lesson-1.html',
  styleUrl: './lesson-1.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lesson1 {
  protected readonly progress = inject(CourseProgressService);
  private readonly circleRef = viewChild(SspCircle);

  protected readonly isCompleted = computed<boolean>(() =>
    this.progress.isLessonCompleted('leccion-1'),
  );

  protected readonly constructionRules: readonly ConstructionRuleItem[] = [
    {
      suit: 'P',
      suitMeta: SUITS[0],
      heading: '1. Picas · Punto de partida',
      description:
        'Se coloca el As de Picas arriba (las 12 del reloj) y se avanza contando de 3 en 3 huecos en sentido horario para situar 2, 3, 4… hasta el Rey de Picas.',
    },
    {
      suit: 'C',
      suitMeta: SUITS[1],
      heading: '2. Corazones · Tras el 5 de Picas',
      description:
        'El As de Corazones se sitúa justo en el hueco siguiente al 5 de Picas, y continúa el conteo de 3 en 3 para el resto de corazones.',
    },
    {
      suit: 'T',
      suitMeta: SUITS[2],
      heading: '3. Tréboles · Tras el 5 de Corazones',
      description:
        'El As de Tréboles se coloca inmediatamente después del 5 de Corazones, avanzando de nuevo de 3 en 3 hasta completar el palo.',
    },
    {
      suit: 'D',
      suitMeta: SUITS[3],
      heading: '4. Diamantes (rombos) · Tras el 5 de Tréboles',
      description:
        'El As de Diamantes se posiciona tras el 5 de Tréboles y mantiene el salto de 3 en 3 hasta ocupar los últimos huecos libres.',
    },
  ];

  protected readonly properties: readonly SspPropertyItem[] = [
    {
      title: 'Naturaleza matemática y cíclica',
      description:
        'Es una estructura cíclica de tipo rosario: después de la última carta vuelve a empezar la primera, por lo que admite cortes completos sin alterar el ciclo interno.',
      icon: 'cycle',
      tone: 'peach',
    },
    {
      title: 'Aspecto de baraja mnemónica',
      description:
        'A diferencia de la Si Stebbins tradicional, no muestra una alternancia evidente de colores (rojo/negro) ni de cartas pares e impares, resultando indetectable para los espectadores.',
      icon: 'cards',
      tone: 'sage',
    },
    {
      title: 'Localización directa (9P a KD)',
      description:
        'Al fijar el 9 de Picas en la posición 1 y el Rey de Diamantes en la 52, es posible deducir la posición de cualquier carta con reglas muy simples y mínima memorización.',
      icon: 'grid',
      tone: 'lavender',
    },
  ];

  constructor() {
    this.progress.recordLessonVisit('leccion-1');
  }

  protected showSuitOnCircle(suit: SuitCode): void {
    this.circleRef()?.jumpToSuitStage(suit);
  }

  protected focusBoundaryCard(boundary: 'start' | 'end'): void {
    this.circleRef()?.inspectSspBoundary(boundary);
  }

  protected completeLesson(): void {
    this.progress.markLessonCompleted('leccion-1');
  }
}

