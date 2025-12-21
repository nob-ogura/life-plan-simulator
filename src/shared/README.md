# Shared

`src/shared` holds cross-cutting concerns and shared domain models.

- `domain/`: core business rules shared across modules (e.g. simulation engine).
- `cross-cutting/`: logging, auth helpers, date utilities, and other infrastructure concerns.

Do not place feature-specific DTOs here. Keep them inside the slice.
