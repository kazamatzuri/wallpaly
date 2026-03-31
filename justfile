# Run both frontend and backend in parallel
dev:
    #!/usr/bin/env bash
    trap 'kill 0' EXIT
    just dev-backend &
    just dev-frontend &
    wait

# Run frontend dev server
dev-frontend:
    npm start

# Run backend dev server
dev-backend:
    cd backend && npm run dev

# Install all dependencies
install:
    npm install --legacy-peer-deps
    cd backend && npm install

# Run database migrations
db-migrate:
    cd backend && npx prisma migrate dev

# Generate Prisma client
db-generate:
    cd backend && npx prisma generate

# Push schema to database without migrations
db-push:
    cd backend && npx prisma db push

# Open Prisma Studio
db-studio:
    cd backend && npx prisma studio

# Build frontend
build-frontend:
    npm run build

# Build backend
build-backend:
    cd backend && npm run build

# Build everything
build: build-frontend build-backend

# Type-check both projects
check:
    #!/usr/bin/env bash
    set -e
    echo "Checking backend..."
    cd backend && npx tsc --noEmit
    echo "Checking frontend..."
    cd .. && npx tsc --noEmit
    echo "All checks passed."

# Clean build artifacts
clean:
    rm -rf build/
    rm -rf backend/dist/
