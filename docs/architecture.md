# Arquitectura frontend

La aplicación usa arquitectura por funcionalidades (vertical slices). Cada cambio tiene un dueño claro, las dependencias fluyen en una sola dirección y la estructura solo crece cuando la complejidad lo exige.

## Capas y dependencias

```text
features/  -> features/, shared/ y core/
shared/    -> core/ solo para infraestructura genérica
core/      -> no depende de features ni shared
```

### `features/`

Contiene casos de uso e interfaz de cada dominio. Una feature puede componer otra cuando representa un flujo real, por ejemplo un dashboard. Esa dependencia debe ser deliberada y superficial: importa su API pública, no detalles internos, y evita ciclos. Las pequeñas pueden tener sus archivos en la raíz; las que crecen siguen esta estructura:

```text
features/products/
  products.routes.ts
  pages/          # componentes asociados a una ruta
  ui/             # diálogos, pipes y componentes privados
  guards/         # guards que protegen rutas o capacidades de la feature
  data-access/    # solo cuando hay composición o adaptación de datos
  model/          # solo para tipos o estado propios no triviales
```

Una feature con varias rutas o configuración propia las expone desde `*.routes.ts` y `app.routes.ts` la monta con `loadChildren`. Una feature de una sola pantalla, como `demo`, puede cargarse directamente desde `app.routes.ts` con `loadComponent`; no se crea un archivo de rutas que solo reenvíe una ruta sin aportar configuración.

Los guards se colocan junto a las rutas que protegen: un guard de Productos vive en `features/products/guards/`; uno de autenticación o sesión reutilizable vive en `core/auth/guards/`. No se crea una carpeta global de guards sin una responsabilidad transversal.

### `shared/`

Incluye UI, formularios, utilidades y helpers reutilizables sin conocer dominios como `Product`, `Order` o `Customer`. Algo pasa a `shared/` después de tener dos consumidores reales o cuando forma parte deliberada del catálogo base y se mantiene como API pública documentada y probada. Fuera de esos casos permanece privado en la feature.

### `core/`

Contiene infraestructura singleton y transversal, nunca casos de uso o UI de dominio.

```text
core/
  api/
    generated/    # salida de Orval; nunca editar manualmente
    runtime/      # interceptores, políticas HTTP y cliente base
  auth/
    guards/       # guards transversales de sesión y autorización
  config/         # configuración por entorno y feature flags
```

`runtime`, `auth` y `config` están vacías intencionadamente. Sus `.gitkeep` hacen visible la frontera, no justifican crear servicios genéricos de forma preventiva.

## API y datos

`core/api/generated/` es el contrato técnico con el backend. Se regenera con `npm run generate:api`, no se edita a mano, y combina clientes Angular, recursos HTTP y esquemas Zod para validar respuestas en tiempo de ejecución.

Una feature consume la API generada directamente si el caso es una petición y su presentación. Se crea `features/<feature>/data-access/` solo para componer endpoints, mapear contratos API a un modelo propio, aplicar caché/permisos/reglas de la feature o compartir acceso entre varias de sus páginas. No se duplican tipos generados ni se crean facades por defecto.

## Estado y navegación

- Estado local: `signal`; valores derivados: `computed`.
- Lecturas remotas: recursos HTTP generados. Los listados usan `withPreviousValue` para no vaciarse durante una recarga.
- Mutaciones: cliente generado y recarga o invalidación del recurso propietario tras éxito.
- Estado compartible o recuperable al navegar: URL. Los listados filtrables usan `createUrlTableFormState`.
- Estado global: solo sesión, preferencias globales o notificaciones. No se introduce una librería global de estado sin un problema real de coordinación.

## Formularios, UI y calidad

Los formularios usan Signal Forms y controles de `shared/ui/form-controls`. Las pantallas con filtros, tabla y diálogo siguen el patrón `ui-table-filters-modal`: filtros aplicados desde el envío, URL para filtros/paginación/ordenación y diálogo privado de la feature.

Los pipes que convierten valores del dominio para mostrarlos —etiquetas, formatos o tonos visuales— son UI privada de la feature y viven en `ui/`. Un pipe puramente genérico, sin conocer el dominio, puede pertenecer a `shared/`; un mapeo que modele reglas de negocio, no destinado a renderizar, pertenece a `model/` o `data-access/` según su función.

Los componentes y helpers públicos de `shared/` documentan su contrato con TSDoc. CI ejecuta formato, lint, typecheck, tests con cobertura y build; ESLint evita que `core` o `shared` dependan de una feature.

## Checklist para una feature nueva

1. Cargar la feature de forma diferida: mediante `loadComponent` si solo tiene una pantalla o mediante `features/<nombre>/<nombre>.routes.ts` y `loadChildren` si posee varias rutas o configuración propia.
2. Situar las páginas en `pages/` y los elementos privados en `ui/`.
3. Usar API generada directamente hasta que exista un motivo concreto para `data-access/`.
4. Reutilizar `shared/` sin mover código privado preventivamente.
5. Añadir pruebas del flujo y helpers críticos antes de fijar umbrales globales de cobertura.
