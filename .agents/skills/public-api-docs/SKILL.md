---
name: public-api-docs
description: Document public Angular APIs when adding or changing reusable component inputs, outputs, models, exported types, or public service methods. Do not use for routine internal implementation details.
---

# Public API Documentation

Document APIs for their consumers, not their implementation.

## When to document

- Treat a reusable component's `input()`, `output()`, and `model()` members as public API.
- Document exported interfaces and type aliases, plus public methods that are consumed outside the service or feature that owns them.
- Do not add boilerplate to route-only components, private members, or obvious local code. Add an explanation only when behavior, intent, or a trade-off is not clear from the code.

## TSDoc content

Place TSDoc immediately above the member. State the observable contract:

- Inputs and models: meaning, whether required, default, accepted values, and units when applicable.
- Outputs: when the event emits and what its payload represents.
- Types: what the model represents and the meaning of non-obvious fields.
- Methods: outcome, side effects, `@param` descriptions, and `@returns` when a value is returned.

Use concise language. Do not repeat the identifier or TypeScript type without adding consumer value.

## Public API names

Use names that communicate the component domain. Avoid generic names that overlap with native HTML properties or events, such as `id`, `name`, `value`, `title`, `label`, `open`, `checked`, `disabled`, `change`, `input`, `submit`, `focus`, or `click`, unless the component deliberately exposes that native-element contract.

Prefer a domain-specific prefix or complete phrase, particularly for reusable components.

```ts
/** Shipping method initially shown as selected. Required. */
readonly selectedShippingMethod = input.required<ShippingMethod>();

/** Emits the selected shipping method after the customer confirms the choice. */
readonly shippingMethodConfirmed = output<ShippingMethod>();

/** Whether the order summary starts expanded. Defaults to `false`. */
readonly isOrderSummaryExpanded = model(false);
```

## Completion

Run `npm run lint` after changing documented API code. The repository lint configuration enforces TSDoc presence for signal-based component APIs and exported TypeScript types.
