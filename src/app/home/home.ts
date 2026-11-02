import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon, IconName } from '../icon';

interface Benefit {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly tone: 'peach' | 'sage' | 'lavender';
}

@Component({
  selector: 'app-home',
  imports: [Icon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly benefits: readonly Benefit[] = [
    {
      title: 'Cálculo sencillo, no memoria bruta',
      description:
        'Olvídate de listas interminables. La SSP se basa en una regla de cálculo muy sencilla que interiorizarás rápidamente. Aquí entrenarás la mecánica hasta que deducir la siguiente carta sea un acto reflejo.',
      icon: 'cycle',
      tone: 'peach',
    },
    {
      title: 'Localización al instante',
      description:
        'Controla la baraja al milímetro. Aprenderás a saber exactamente en qué posición está cada carta o qué carta ocupa un número determinado, dándote una libertad total en tus rutinas.',
      icon: 'grid',
      tone: 'sage',
    },
    {
      title: 'Magia de alto impacto',
      description:
        'Al dominar el ciclo y conocer los atajos de la ordenación, tendrás en tus manos una herramienta devastadora. Construye milagros imposibles y rutinas que parecen requerir años de memoria prodigiosa, usando solo un principio simple.',
      icon: 'star',
      tone: 'lavender',
    },
  ];
}
