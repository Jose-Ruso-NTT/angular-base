import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, type ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { createUrlTableFormState, stringUrlParam, type UrlTableForm } from './url-table-form-state';

interface Filters {
  search: string;
}

const defaults = (): Filters => ({ search: '' });

describe('createUrlTableFormState', () => {
  let queryParams: BehaviorSubject<ParamMap>;
  let form: UrlTableForm<Filters>;

  beforeEach(() => {
    queryParams = new BehaviorSubject(convertToParamMap({}));
    const value = signal(defaults());
    form = () => ({
      value,
      reset: (nextValue = defaults()) => {
        value.set(nextValue);
      },
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams.asObservable(),
            snapshot: { queryParamMap: queryParams.value },
          },
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    });
  });

  it('preserves an unapplied draft while the page changes', () => {
    const state = TestBed.runInInjectionContext(() => createState(form));
    TestBed.tick();
    form().value.set({ search: 'draft' });

    queryParams.next(convertToParamMap({ page: '2' }));
    TestBed.tick();

    expect(state.tableState().page).toBe(2);
    expect(form().value()).toEqual({ search: 'draft' });
  });

  it('restores the draft when applied filters change through navigation', () => {
    TestBed.runInInjectionContext(() => createState(form));
    TestBed.tick();
    form().value.set({ search: 'draft' });

    queryParams.next(convertToParamMap({ search: 'applied' }));
    TestBed.tick();

    expect(form().value()).toEqual({ search: 'applied' });
  });
});

function createState(form: UrlTableForm<Filters>) {
  return createUrlTableFormState<Filters, Filters, 'name'>({
    form,
    defaultFilters: defaults,
    filters: { search: stringUrlParam() },
    toUrlFilters: (value) => value,
    fromUrlState: (value) => value,
    table: {
      pageSizeOptions: [10],
      defaultPageSize: 10,
      sortByOptions: ['name'],
    },
  });
}
