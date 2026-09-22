import {
  computed,
  effect,
  inject,
  untracked,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, type Params } from '@angular/router';

/** Converts one typed value to and from a URL query parameter. */
export interface UrlParamCodec<TValue> {
  /** Reads a query value, falling back safely when it is missing or invalid. */
  parse(value: string | null, fallback: TValue): TValue;
  /** Serializes a value, returning null when the default should be removed from the URL. */
  serialize(value: TValue, defaultValue: TValue): string | null;
}

/** Schema associating every URL filter with its URL codec. */
export type UrlParamSchema<TFilters extends object> = {
  readonly [Key in keyof TFilters]: UrlParamCodec<TFilters[Key]>;
};

/** A discrete state change requested by a reusable data table. */
export type DataTableStateChange<TSortBy extends string = string> =
  | { readonly kind: 'page'; readonly page: number }
  | { readonly kind: 'pageSize'; readonly pageSize: number }
  | { readonly kind: 'sort'; readonly sortBy: TSortBy };

/** Fields shared by every URL table state. */
interface BaseUrlTableState<TUrlFilters extends object> {
  /** One-based current page. */
  readonly page: number;
  /** Requested row count per page. */
  readonly pageSize: number;
  /** Typed filters stored in the URL. */
  readonly filters: TUrlFilters;
}

/** A URL table state with an explicit sort selected by the user. */
interface SortedUrlTableState<
  TUrlFilters extends object,
  TSortBy extends string,
> extends BaseUrlTableState<TUrlFilters> {
  /** Current server-side sort column. */
  readonly sortBy: TSortBy;
  /** Current server-side sort direction. */
  readonly sortDirection: 'asc' | 'desc';
}

/** A URL table state without an explicit sort. */
interface UnsortedUrlTableState<TUrlFilters extends object> extends BaseUrlTableState<TUrlFilters> {
  /** No server-side sort column is selected. */
  readonly sortBy: null;
  /** There is no sort direction without a sort column. */
  readonly sortDirection: null;
}

/** Table state decoded from the URL. */
export type UrlTableState<TUrlFilters extends object, TSortBy extends string = string> =
  SortedUrlTableState<TUrlFilters, TSortBy> | UnsortedUrlTableState<TUrlFilters>;

/** Configuration for pagination and sorting values stored in the URL. */
export interface UrlTableOptions<TSortBy extends string> {
  /** Values exposed by the table page-size selector. */
  readonly pageSizeOptions: readonly number[];
  /** Page size used when the URL has no valid value. */
  readonly defaultPageSize: number;
  /** Sort fields accepted from the URL and emitted by the table. */
  readonly sortByOptions: readonly TSortBy[];
}

/** Root capabilities required from a writable Signal Form. */
export type UrlTableForm<TFormValue extends object> = () => {
  /** Writable form value, backed by Signal Forms' source model. */
  readonly value: WritableSignal<TFormValue>;
  /** Replaces the value and clears interaction state. */
  reset(value?: TFormValue): void;
};

/** Configuration for a typed filter form synchronized with URL table state. */
export interface CreateUrlTableFormStateConfig<
  TFormValue extends object,
  TUrlFilters extends object,
  TSortBy extends string = string,
> {
  /** Signal Form whose draft value is synchronized when URL state changes. */
  readonly form: UrlTableForm<TFormValue>;
  /** Produces a fresh default form value for initialization and reset. */
  readonly defaultFilters: () => TFormValue;
  /** URL codecs for every filter, including a search field when the form has one. */
  readonly filters: UrlParamSchema<TUrlFilters>;
  /** Converts form values into the URL filter shape. */
  readonly toUrlFilters: (value: TFormValue) => TUrlFilters;
  /** Rebuilds form values from decoded URL filters. */
  readonly fromUrlState: (filters: TUrlFilters) => TFormValue;
  /** Pagination and sorting defaults and accepted values. */
  readonly table: UrlTableOptions<TSortBy>;
}

/** Public API for a Signal Form and reusable table synchronized through the URL. */
export interface UrlTableFormStateStore<
  TFormValue extends object,
  TUrlFilters extends object,
  TSortBy extends string = string,
> {
  /** Complete typed state currently decoded from the URL. */
  readonly tableState: Signal<UrlTableState<TUrlFilters, TSortBy>>;
  /** Filters currently applied through the URL, distinct from the editable form draft. */
  readonly activeFilters: Signal<TFormValue>;
  /** Page-size choices shared with the table UI. */
  readonly pageSizeOptions: readonly number[];
  /** Applies the current form draft to the URL and returns to the first page. */
  applyFilters(): Promise<boolean>;
  /** Restores form and URL filters to their defaults and returns to the first page. */
  resetFilters(): Promise<boolean>;
  /** Synchronizes a pagination or sort action emitted by the table. */
  setTableState(change: DataTableStateChange<TSortBy>): Promise<boolean>;
}

/** Options for decoding a nullable numeric URL parameter. */
export interface NullableNumberUrlParamOptions {
  /** Lowest accepted numeric value. Defaults to zero. */
  readonly minimum?: number;
  /** Highest accepted numeric value. */
  readonly maximum?: number;
  /** Whether only integers are accepted. */
  readonly integer?: boolean;
}

/** Creates a codec for trimmed string query parameters. */
export function stringUrlParam(): UrlParamCodec<string> {
  return {
    parse: (value, fallback) => {
      const normalized = value?.trim();
      return normalized === undefined || normalized === '' ? fallback : normalized;
    },
    serialize: (value, defaultValue) => {
      const normalized = value.trim();
      return normalized === defaultValue.trim() ? null : normalized;
    },
  };
}

/** Creates a codec for optional finite numeric query parameters. */
export function nullableNumberUrlParam(
  options: NullableNumberUrlParamOptions = {},
): UrlParamCodec<number | null> {
  const minimum = options.minimum ?? 0;

  return {
    parse: (value, fallback) => {
      if (value === null || value.trim() === '') return fallback;
      const parsed = Number(value);
      const isValid =
        Number.isFinite(parsed) &&
        (!options.integer || Number.isInteger(parsed)) &&
        parsed >= minimum &&
        (options.maximum === undefined || parsed <= options.maximum);
      return isValid ? parsed : fallback;
    },
    serialize: (value, defaultValue) =>
      value === defaultValue || value === null ? null : String(value),
  };
}

/** Creates a codec for a finite set of typed values mapped to friendly URL values. */
export function mappedUrlParam<TValue>(
  mappings: readonly (readonly [TValue, string])[],
): UrlParamCodec<TValue> {
  return {
    parse: (value, fallback) =>
      mappings.find(([, urlValue]) => urlValue === value)?.[0] ?? fallback,
    serialize: (value, defaultValue) => {
      if (Object.is(value, defaultValue)) return null;
      return mappings.find(([mappedValue]) => Object.is(mappedValue, value))?.[1] ?? null;
    },
  };
}

/**
 * Creates a URL-backed state store for a Signal Form and a reusable data table.
 *
 * The form remains an editable draft; only `applyFilters()` makes its values active
 * by writing them to the URL. Browser navigation restores the draft and resets its
 * interaction state from the decoded URL values.
 */
export function createUrlTableFormState<
  TFormValue extends object,
  TUrlFilters extends object,
  TSortBy extends string = string,
>(
  config: CreateUrlTableFormStateConfig<TFormValue, TUrlFilters, TSortBy>,
): UrlTableFormStateStore<TFormValue, TUrlFilters, TSortBy> {
  if (!config.table.pageSizeOptions.includes(config.table.defaultPageSize)) {
    throw new Error('The default page size must be included in pageSizeOptions.');
  }

  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const queryParams = toSignal(route.queryParamMap, {
    initialValue: route.snapshot.queryParamMap,
  });
  const defaults = () => config.defaultFilters();
  const defaultUrlFilters = () => config.toUrlFilters(defaults());
  const urlFilters = computed(() => {
    const params = queryParams();
    const defaultValues = defaultUrlFilters();
    const filters = {} as TUrlFilters;

    for (const filterName of Object.keys(config.filters) as (keyof TUrlFilters)[]) {
      filters[filterName] = config.filters[filterName].parse(
        params.get(String(filterName)),
        defaultValues[filterName],
      );
    }

    return filters;
  });
  const tableState = computed<UrlTableState<TUrlFilters, TSortBy>>(() => {
    const params = queryParams();
    const currentFilters = urlFilters();
    const requestedPageSize = parsePositiveInteger(params.get('pageSize'));
    const pageSize = requestedPageSize ?? config.table.defaultPageSize;
    const requestedSortBy = params.get('sortBy');
    const requestedDirection = params.get('sortDirection');
    const baseState: BaseUrlTableState<TUrlFilters> = {
      page: parsePositiveInteger(params.get('page')) ?? 1,
      pageSize: config.table.pageSizeOptions.includes(pageSize)
        ? pageSize
        : config.table.defaultPageSize,
      filters: currentFilters,
    };

    if (!config.table.sortByOptions.includes(requestedSortBy as TSortBy)) {
      return { ...baseState, sortBy: null, sortDirection: null };
    }

    return {
      ...baseState,
      sortBy: requestedSortBy as TSortBy,
      sortDirection: requestedDirection === 'desc' ? 'desc' : 'asc',
    };
  });
  const activeFilters = computed(() => {
    return config.fromUrlState(urlFilters());
  });

  effect(() => {
    const appliedFilters = activeFilters();
    untracked(() => {
      config.form().reset(appliedFilters);
    });
  });

  const navigate = (changes: Params): Promise<boolean> =>
    router.navigate([], {
      relativeTo: route,
      queryParams: changes,
      queryParamsHandling: 'merge',
    });
  const serializeFilters = (value: TFormValue): Params => {
    const urlFilters = config.toUrlFilters(value);
    const defaultValues = defaultUrlFilters();
    const changes: Params = {};

    for (const filterName of Object.keys(config.filters) as (keyof TUrlFilters)[]) {
      changes[String(filterName)] = config.filters[filterName].serialize(
        urlFilters[filterName],
        defaultValues[filterName],
      );
    }

    return changes;
  };

  return {
    tableState,
    activeFilters,
    pageSizeOptions: config.table.pageSizeOptions,
    applyFilters: () =>
      navigate({
        ...serializeFilters(config.form().value()),
        page: null,
      }),
    resetFilters: () => {
      const defaultValue = defaults();
      config.form().reset(defaultValue);
      return navigate({ ...serializeFilters(defaultValue), page: null });
    },
    setTableState: (change) => {
      const current = tableState();

      if (change.kind === 'page') {
        return change.page > 0
          ? navigate({ page: change.page === 1 ? null : change.page })
          : Promise.resolve(false);
      }

      if (change.kind === 'pageSize') {
        return config.table.pageSizeOptions.includes(change.pageSize)
          ? navigate({
              pageSize: change.pageSize === config.table.defaultPageSize ? null : change.pageSize,
              page: null,
            })
          : Promise.resolve(false);
      }

      if (!config.table.sortByOptions.includes(change.sortBy)) {
        return Promise.resolve(false);
      }

      const sortBy = change.sortBy;
      const sortDirection =
        current.sortBy !== sortBy ? 'asc' : current.sortDirection === 'asc' ? 'desc' : null;
      return navigate({
        sortBy: sortDirection === null ? null : sortBy,
        sortDirection,
        page: null,
      });
    },
  };
}

/** Parses a positive integer URL value or reports its absence. */
function parsePositiveInteger(value: string | null): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
