import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root application shell. Feature screens are loaded through the router. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
