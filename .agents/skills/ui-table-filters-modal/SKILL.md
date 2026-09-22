---
name: ui-table-filters-modal
description: Build Angular list screens with filters, a reusable data table, and create/edit modal forms using this repository's established shared UI and URL-state conventions. Use when a request mentions a table/listado with filters and a modal form; do not use for a simple static table or an unrelated dialog.
---

# Table, filters and modal form

Create a coherent feature, not just markup. Before changing code, read `src/app/shared/ui/form-controls/README.md`, `src/app/shared/ui/data-table/README.md`, and `src/app/shared/ui/dialog/README.md`; then read [the self-contained implementation pattern](references/implementation-pattern.md).

## Required composition

- Use standalone Angular components, signals, and Signal Forms. Bind shared field controls with `[formField]`; do not reimplement labels, validation feedback, or form-control accessibility.
- Use `createUrlTableFormState` for a filter form that changes the listed data. Filters are a draft until the user submits; URL query parameters hold the applied filters, page, page size, and sort. Reset filtering must also reset the URL state.
- Use `AppDataTable` with typed `DataTableColumn` definitions, a stable `rowTrackBy`, and `DataTableCellDefDirective` for cells that are not simple scalar text. Forward `sortChange`, `pageChange`, and `pageSizeChange` to the URL table store.
- Derive the request parameters from the URL store and fetch with the generated API resource. Keep previously loaded rows visible during reloads with `withPreviousValue`.
- Put the create/edit form in a feature-local dialog component. Open it via `AppDialogService`, inject `APP_DIALOG_DATA` and `AppDialogRef`, and reload the list only when the dialog reports a successful save.
- Validate form inputs with Signal Forms. On an invalid submission call `focusBoundControl`. While saving, disable both modal actions; show operation failures with `AppAlert` and keep the dialog open.
- Wrap the table with `LoadingOverlay`, present initial/request errors with `AppAlert` and an explicit retry action, and use `ConfirmDialog` before destructive actions.

## Conventions that must stay consistent

- Define explicit, typed defaults for filter and editor models. Convert empty optional filters to `undefined` before sending an API request.
- Reset pagination to page 1 when filters, sorting, or page size change; the URL table store performs this when used as intended.
- Give every user-interactive control a stable, feature-prefixed `testId` or `data-testid`. Give row-level actions an accessible label containing the entity name.
- Use shared controls and display components (`AppInput`, `AppSelect`, `AppNumber`, `AppCheckbox`, `AppStatusBadge`, etc.) before introducing custom equivalents.
- Keep feature-specific labels, status mapping pipes, API mapping, and the editor dialog inside the feature folder. Do not modify `shared/ui` merely to implement one screen.

## Completion

Read [the implementation checklist](references/implementation-checklist.md) before considering the work complete. Run the most focused relevant tests plus `npm run typecheck`; run `npm run lint` when public APIs or templates changed.
