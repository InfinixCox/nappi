import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-panel',
  imports: [RouterOutlet],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  auth = inject(Auth);
}
