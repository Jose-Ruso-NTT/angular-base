import { Injectable, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

/** State for a paginated and sortable collection, read from URL query parameters. */
export interface UrlPageState {
  /** One-based page number. */
  readonly page: number;
  /** Maximum items requested per page. */
  readonly pageSize: number;
  /** Active server-side sort field. */
  readonly sortBy: string;
  /** Sort order sent to the server. */
  readonly sortDirection: 'asc' | 'desc';
}

/**
 * Keeps collection navigation state in query parameters.
 *
 * Features can also use it to synchronize their own filters while retaining
 * pagination and sorting parameters.
 */
@Injectable({ providedIn: 'root' })
export class UrlPaginationService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  /** Current query parameters, kept in sync with browser navigation. */
  readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  /** Reactive, normalized URL state with safe defaults. */
  readonly state = computed<UrlPageState>(() => {
    const params = this.queryParams();
    return {
      page: this.toPositiveInteger(params.get('page'), 1),
      pageSize: Math.min(this.toPositiveInteger(params.get('pageSize'), 10), 100),
      sortBy: params.get('sortBy') ?? 'createdAt',
      sortDirection: params.get('sortDirection') === 'asc' ? 'asc' : 'desc',
    };
  });

  /** Updates state in the URL. Changing a filter or page size returns to page one. */
  update(change: Partial<UrlPageState>, resetPage = false): Promise<boolean> {
    const current = this.state();
    const next = { ...current, ...change };
    const page = resetPage ? 1 : next.page;

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...next, page },
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Merges feature-specific query parameters into the URL.
   *
   * Null or undefined values remove the corresponding parameter. When filters
   * change, the requested page is reset to one by default.
   */
  updateQueryParams(
    change: Record<string, string | number | boolean | null | undefined>,
    resetPage = false,
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...change, page: resetPage ? 1 : this.state().page },
      queryParamsHandling: 'merge',
    });
  }

  /** Switches sorting for a field, reversing direction when it is already active. */
  toggleSort(sortBy: string): Promise<boolean> {
    const current = this.state();
    return this.update(
      {
        sortBy,
        sortDirection:
          current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc',
      },
      true,
    );
  }

  private toPositiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }
}
