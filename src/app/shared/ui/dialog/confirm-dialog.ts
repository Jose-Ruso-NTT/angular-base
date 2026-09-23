import { Component, inject } from '@angular/core';
import { APP_DIALOG_DATA, AppDialogRef } from './app-dialog.service';

/** Text and action labels used by the confirmation dialog. */
export interface ConfirmDialogData {
  /** Dialog heading. */
  readonly title: string;
  /** Explanation of the action to confirm. */
  readonly message: string;
  /** Label for the destructive or primary action. */
  readonly confirmLabel: string;
}

/** Reusable confirmation content opened through AppDialogService. */
@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  template: `
    <section class="app-dialog app-dialog--confirm" aria-labelledby="confirm-dialog-title">
      <h2 id="confirm-dialog-title">{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="app-dialog__actions">
        <button
          type="button"
          class="app-button app-button--secondary"
          (click)="dialogRef.close(false)"
          data-testid="confirm-dialog-cancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="app-button app-button--danger"
          (click)="dialogRef.close(true)"
          data-testid="confirm-dialog-accept"
        >
          {{ data.confirmLabel }}
        </button>
      </div>
    </section>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(APP_DIALOG_DATA);
  protected readonly dialogRef = inject(AppDialogRef<boolean>);
}
