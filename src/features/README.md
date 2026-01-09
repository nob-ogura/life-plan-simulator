# Features

Organize code by module and slice:

- Module groups related slices (e.g. auth, inputs, simulation).
- Slice represents a single use case or endpoint.
- Each slice keeps REPR (request/endpoint/response) together to reduce context switching.
- One endpoint equals one class. If you add another endpoint, create another slice.
