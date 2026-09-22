import {
  linkedSignal,
  resourceFromSnapshots,
  type Resource,
  type ResourceSnapshot,
} from '@angular/core';

/** Keeps the previous resource value visible while a new request is loading. */
export function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snapshot, previous) => {
      if (snapshot.status === 'loading' && previous && previous.value.status !== 'error') {
        return { status: 'loading' as const, value: previous.value.value };
      }

      return snapshot;
    },
  });

  return resourceFromSnapshots(derived);
}
