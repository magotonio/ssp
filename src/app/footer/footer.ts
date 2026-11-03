import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { version } from '../../../package.json';
import { CourseProgressService } from '../course/course-progress.service';
import { Icon } from '../icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private readonly progress = inject(CourseProgressService);

  protected readonly courseRoute = this.progress.targetCourseRoute;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly appVersion: string = version;
}
