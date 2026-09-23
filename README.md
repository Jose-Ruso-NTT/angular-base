# Angular Base

Base frontend en Angular para construir aplicaciones por funcionalidades. Incluye un catálogo de productos como referencia de una pantalla con filtros, tabla, paginación, ordenación, diálogos y consumo tipado de API.

## Requisitos

- Node.js compatible con Angular 22
- npm 11.6.3 (definido en `package.json`)
- El backend disponible en `http://127.0.0.1:3000` para usar la aplicación completa

## Puesta en marcha

```bash
npm install
npm start
```

Abre `http://localhost:4200`. Durante el desarrollo, las solicitudes a `/api/**` se redirigen al backend mediante `src/proxy.conf.json`.

## Comandos habituales

```bash
npm start                 # Servidor de desarrollo
npm run build             # Build de producción
npm test                  # Tests en modo interactivo
npm run test:ci           # Tests para CI
npm run test:coverage     # Tests con cobertura
npm run lint              # Lint
npm run typecheck         # Comprobación de tipos
npm run format:check      # Verifica el formato
npm run format            # Aplica Prettier
npm run generate:api      # Regenera el cliente desde swagger/api.yaml
```

## Arquitectura

La aplicación se organiza por funcionalidades (`features/`). Cada feature posee sus rutas, páginas y UI privada; `shared/` contiene elementos reutilizables y agnósticos de dominio; `core/` aloja infraestructura transversal.

Las reglas de dependencia, estado, API y criterios para hacer crecer la estructura están en [docs/architecture.md](docs/architecture.md).

El código de `src/app/core/api/generated/` es generado por Orval a partir de `swagger/api.yaml`: no debe editarse manualmente. Tras cambiar el contrato, ejecuta `npm run generate:api` y versiona el resultado generado.

## Convenciones de desarrollo

- Usa `signal` para el estado local y la URL para el estado recuperable de filtros, paginación y ordenación.
- Mantén los tipos y helpers locales junto a su único consumidor. Crea `model/` o `data-access/` dentro de una feature solo cuando exista una responsabilidad o reutilización real.
- No importes una feature desde otra. Los componentes de `shared/` no conocen dominios como productos o pedidos.

## Hooks de Git

Husky ejecuta `lint-staged` antes de confirmar y valida los mensajes con Commitlint.

En este repositorio didáctico, el frontend está en `angular-base/` y el backend es su carpeta hermana (`../backend`). Para no ejecutar las comprobaciones del frontend en commits que afectan solo al backend, activa los hooks una vez desde la raíz Git:

```bash
git config core.hooksPath angular-base/.husky/_
```

Si el frontend vive en su propio repositorio, basta con instalar dependencias: el script `prepare` configura los hooks en la ruta estándar.
