# Implementation checklist

Use this after implementing a feature that combines a list, filters, and a create/edit dialog.

- Filter controls live in a semantic `<form [formRoot]>` with submit and clear actions.
- The filter draft is synchronized through `createUrlTableFormState`; browser navigation restores filters, sort, pagination, and page size.
- Table columns are typed, row identity is stable, non-scalar cells use `appDataTableCellDef`, and pagination/sorting events reach the URL store.
- Loading preserves existing rows; loading and error states are announced accessibly; errors expose a retry action.
- Create and edit use the same feature-local dialog. Its result determines whether the resource reloads.
- Form validation uses Signal Forms; submitting invalid data focuses the first invalid bound control; request failures are visible without discarding user input.
- Delete requires `ConfirmDialog`, and failure feedback is shown on the owning page.
- Interactive controls and row actions have stable test selectors and meaningful accessible names.

The implementation pattern is intentionally self-contained in [implementation-pattern.md](implementation-pattern.md), so this skill does not depend on any feature remaining in the repository.
