# Commands to Run Locally

These commands require local execution with wrangler authenticated.

## Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create D1 database
wrangler d1 create cellar

# 3. Update wrangler.toml with the database_id from the output above
# Look for: database_id = "your-database-id-here"

# 4. Run database migrations
wrangler d1 execute cellar --file=./worker/migrations/schema.sql

# 5. Create R2 bucket
wrangler r2 bucket create grove-storage

# 6. Update wrangler.toml with R2 bucket name if different
```

## Development

```bash
# Run SvelteKit dev server
pnpm dev

# Run worker in dev mode
pnpm worker:dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Deployment

```bash
# Build SvelteKit for Cloudflare Pages
pnpm build

# Deploy worker
pnpm worker:deploy

# Deploy to Cloudflare Pages (if using)
wrangler pages deploy .svelte-kit/cloudflare
```

## Database Management

```bash
# Run migrations on remote D1
wrangler d1 execute cellar --file=./worker/migrations/schema.sql --remote

# Query database locally
wrangler d1 execute cellar --command="SELECT * FROM user_storage LIMIT 10"

# Query remote database
wrangler d1 execute cellar --remote --command="SELECT * FROM user_storage LIMIT 10"
```

## R2 Operations

```bash
# List R2 objects
wrangler r2 object list grove-storage

# Upload a test file
wrangler r2 object put grove-storage/test/sample.txt --file=./test-file.txt
```

## Environment Variables

Create a `.dev.vars` file in the worker directory for local development:

```bash
# worker/.dev.vars
HEARTWOOD_API_KEY=your-heartwood-key
STRIPE_SECRET_KEY=your-stripe-key
```

For production, set secrets:

```bash
wrangler secret put HEARTWOOD_API_KEY
wrangler secret put STRIPE_SECRET_KEY
```
