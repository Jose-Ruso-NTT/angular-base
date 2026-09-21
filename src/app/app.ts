import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root application shell. Feature screens are loaded through the router. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  styleUrl: './app.css',
  template: '<router-outlet />',
})
export class App {
  protected readonly isApplicationShell = true;
}
