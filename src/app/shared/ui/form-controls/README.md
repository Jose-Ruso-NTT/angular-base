# Controles de formulario

Esta guía define cómo consumir los controles de formulario de `shared/ui`. Los wrappers de etiqueta, ayuda y error (`AppFieldShell`, `AppFieldMessages`) son infraestructura interna: consume los controles de esta lista, no los compongas manualmente.

## Contrato común

- En formularios nuevos usa Signal Forms y `[formField]="form.campo"`. Para estado local aislado usa `[(value)]`; en checkbox, `[(checked)]`.
- Todos los controles requieren `label`, `controlId` y `testId`. `controlId` es único por pantalla y `testId` es estable y prefijado por funcionalidad.
- `hint` se muestra hasta que el campo se toca y tiene un error; después se muestra el mensaje de validación. `required`, `disabled` y `readonly` del Signal Form se propagan al control.
- No uses `ngModel`. Los controles implementan el contrato de Signal Forms y exponen `focus()` para enfocar el control asociado cuando falla el envío.

## Elegir el control

| Componente       | Valor                | Uso                                                                                                              |
| ---------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `AppInput`       | `string`             | Texto, email, búsqueda, teléfono, URL y contraseña. `type`: `text`, `email`, `password`, `search`, `tel`, `url`. |
| `AppNumber`      | `number \| null`     | Valores numéricos. Vacío equivale a `null`; admite `min`, `max`, `step`.                                         |
| `AppDate`        | `YYYY-MM-DD \| null` | Fecha civil nativa sin zona horaria. `min` y `max` usan el mismo formato.                                        |
| `AppTime`        | `string` (`HH:mm`)   | Hora nativa. `min`/`max` usan `HH:mm`; `step` va en segundos.                                                    |
| `AppTextarea`    | `string`             | Texto en varias líneas. `rows` predeterminado: 3.                                                                |
| `AppSelect`      | `string \| number`   | Una opción de lista corta: `{ value, label, disabled? }`.                                                        |
| `AppMultiselect` | `T[]`                | Varias opciones, también con valores objeto: `{ value, label, disabled? }`.                                      |
| `AppCheckbox`    | `boolean`            | Decisión independiente sí/no; usa `[(checked)]` si no hay Signal Form.                                           |
| `AppRadioGroup`  | `string \| number`   | Una opción de un grupo pequeño visible. `orientation`: `vertical` u `horizontal`.                                |

```html
<app-input
  label="Buscar"
  controlId="order-search"
  [formField]="form.search"
  testId="order-search"
/>
<app-number
  label="Importe mínimo"
  controlId="order-min-price"
  [formField]="form.price"
  [min]="0"
  testId="order-min-price"
/>
```
