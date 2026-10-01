# Controles de formulario

Los formularios usan elementos HTML nativos con Signal Forms. `AppField` aporta etiqueta, ayuda y errores; `appControl` aplica el estilo visual compartido. Solo `AppMultiselect` es un control compuesto, porque no hay un equivalente nativo para selección múltiple con combobox.

```html
<app-field label="Importe" hint="Acepta decimales.">
  <input appControl id="order-amount" type="number" [formField]="form.amount" step="0.01" />
</app-field>
```

- El elemento proyectado debe tener `[formField]` e `id`; el `id` conecta la etiqueta y los mensajes accesibles.
- Usa los tipos nativos que espera Signal Forms: `number | null` para `number`, `Date | null` para `date`, `string` para texto, `time` y `select`, y `boolean` para checkbox.
- Las reglas viven en el esquema Signal Forms. No declares atributos `min`, `max`, `required` o `disabled` manualmente junto a `[formField]`.
- Para opciones de radio usa `layout="radio"` y enlaza cada `input[type=radio]` al mismo campo. Para checkbox usa `layout="checkbox"`.
