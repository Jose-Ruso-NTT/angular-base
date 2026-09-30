import {
  Injectable,
  InjectionToken,
  Service,
  Type,
  inject,
  type StaticProvider,
} from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import type { Observable } from 'rxjs';

/** Typed data made available to content opened through AppDialogService. */
export const APP_DIALOG_DATA = new InjectionToken<unknown>('APP_DIALOG_DATA');

/** Narrow close-only reference exposed to application dialog content. */
@Injectable()
export class AppDialogRef<R = unknown> {
  private readonly dialogRef = inject(DialogRef<R>);

  /** Closes the dialog and optionally returns a value to the caller. */
  close(result?: R): void {
    this.dialogRef.close(result);
  }
}

/** Configuration supported by the application dialog wrapper. */
export interface AppDialogConfig<D> {
  /** Data consumed by the opened component via APP_DIALOG_DATA. */
  readonly data: D;
  /** Accessible name announced for the dialog container. */
  readonly ariaLabel: string;
  /** Prevents dismissing the dialog by backdrop click or Escape. */
  readonly disableClose?: boolean;
}

/** Application boundary for CDK dialogs, keeping CDK-specific APIs out of features. */
@Service()
export class AppDialogService {
  private readonly dialog = inject(Dialog);

  /** Opens content in an accessible CDK dialog and returns only its completion stream. */
  open<T, D, R>(component: Type<T>, config: AppDialogConfig<D>): Observable<R | undefined> {
    const providers: StaticProvider[] = [
      { provide: AppDialogRef, useClass: AppDialogRef },
      {
        provide: APP_DIALOG_DATA,
        useFactory: (): unknown => {
          const data: unknown = inject(DIALOG_DATA);
          return data;
        },
      },
    ];
    return this.dialog.open<R, D, T>(component, {
      data: config.data,
      ariaLabel: config.ariaLabel,
      disableClose: config.disableClose,
      autoFocus: 'first-tabbable',
      providers,
    }).closed;
  }
}
