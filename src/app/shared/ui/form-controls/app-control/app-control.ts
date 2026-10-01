import { Directive } from '@angular/core';

/** Applies the shared visual treatment to a native form control. */
@Directive({
  selector: '[appControl]',
  host: { class: 'app-control' },
})
export class AppControl {}
