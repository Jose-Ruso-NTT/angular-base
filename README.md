# AngularBase

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Arquitectura

La estructura, los límites entre capas y el criterio para hacerla crecer están documentados en [docs/architecture.md](docs/architecture.md).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Git hooks (Husky)

Husky está situado en `.husky/` porque es configuración del frontend: ejecuta `lint-staged` antes de confirmar y valida el mensaje mediante `commitlint`.

En este repositorio didáctico, el frontend está en `angular-base/` y el backend es su carpeta hermana (`../backend`). Para no aplicar las comprobaciones frontend a commits que modifican únicamente el backend, los hooks se ejecutan solo si hay archivos preparados bajo `angular-base/`.

Tras clonar esta estructura conjunta, actívalos una vez desde la raíz del repositorio:

```bash
git config core.hooksPath angular-base/.husky/_
```

En el uso habitual, cuando este frontend vive solo en su propio repositorio, no hace falta esa configuración especial: `.husky/` está en la raíz Git y Husky usa el valor estándar `.husky/_`. Basta con instalar las dependencias en esta carpeta (`npm install`); el script `prepare` configura los hooks.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
