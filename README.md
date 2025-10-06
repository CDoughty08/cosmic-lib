# @cosmic

A modern TypeScript library monorepo for Redis-based utilities and tools.

## Packages

### @cosmic/redis-lock

Distributed Redis locks using the Redlock algorithm for reliable distributed locking across multiple Redis instances.

**Features:**

- Redlock algorithm implementation
- Configurable retry and timeout options
- Lock extension capabilities
- TypeScript support

### @cosmic/redis-es

Entity System for mapping classes to Redis, providing an ORM-like experience for Redis data storage.

**Features:**

- Class-to-Redis mapping
- Query capabilities
- Indexing support
- Serialization options
- TypeScript decorators support

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Format code
pnpm run format
```

### Development

```bash
# Start development mode (watch mode)
pnpm run dev

# Clean build artifacts
pnpm run clean
```

## Project Structure

```
cosmic-redis/
├── packages/
│   ├── redis-lock/          # Distributed Redis locks
│   └── redis-es/            # Entity System for Redis
├── package.json             # Root package configuration
├── turbo.json              # Turborepo configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
└── README.md               # This file
```

## Scripts

- `pnpm run build` - Build all packages
- `pnpm run test` - Run all tests
- `pnpm run lint` - Lint all packages
- `pnpm run format` - Format all code
- `pnpm run dev` - Start development mode
- `pnpm run clean` - Clean build artifacts

## Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## License

MIT
