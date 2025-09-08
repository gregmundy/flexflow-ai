# Docker Setup for FlexFlow

This guide covers setting up the FlexFlow AI workout generation system with Docker Compose for local development.

## Overview

Our Docker Compose setup includes:
- **PostgreSQL 16** - Primary database with optimal development configuration
- **pgAdmin 4** - Web-based database administration (optional)
- **Data persistence** - Survives container restarts and updates
- **Health checks** - Ensures services are ready before dependent services start

## Quick Start

### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### 2. Environment Setup

Copy the example environment file and update it:

```bash
cp .env.example .env
```

The default configuration works with Docker Compose out of the box:

```env
DATABASE_URL="postgresql://flexflow_user:flexflow_password@localhost:5432/flexflow_dev"
```

### 3. Start Services

Start PostgreSQL and pgAdmin:

```bash
# Start all services in the background
docker-compose up -d

# View logs (optional)
docker-compose logs -f postgres
```

### 4. Verify Setup

Check that services are running:

```bash
docker-compose ps
```

You should see:
- `flexflow-postgres` - PostgreSQL database (port 5432)
- `flexflow-pgadmin` - pgAdmin web interface (port 8080)

### 5. Run Database Migrations

With the database running, run Drizzle migrations:

```bash
# Install dependencies (if not already done)
yarn install

# Generate and run migrations
yarn db:generate  # Generate migration files
yarn db:migrate   # Apply migrations to database
```

### 6. Access Services

- **Database**: Connect to `localhost:5432` with your application
- **pgAdmin**: Open [http://localhost:8080](http://localhost:8080)
  - Email: `admin@flexflow.local`
  - Password: `admin_password`

## Detailed Configuration

### Database Configuration

The PostgreSQL service is configured with:

- **Database**: `flexflow_dev`
- **User**: `flexflow_user`
- **Password**: `flexflow_password`
- **Port**: `5432` (exposed to host)

### Performance Optimizations

The PostgreSQL configuration (`docker/postgres/postgresql.conf`) includes:

- **Memory**: Optimized for development (128MB shared_buffers)
- **Logging**: All statements logged for debugging
- **Auto-vacuum**: Enabled for AI workout data management
- **Extensions**: UUID, pgcrypto, full-text search, JSON indexing

### Data Persistence

Data is persisted in Docker named volumes:

- `flexflow_postgres_data` - Database files
- `flexflow_pgadmin_data` - pgAdmin settings

Data survives container restarts and updates.

## Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart postgres

# View service logs
docker-compose logs postgres
docker-compose logs pgadmin

# Follow logs in real-time
docker-compose logs -f postgres
```

### Database Operations

```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U flexflow_user -d flexflow_dev

# Run a SQL file
docker-compose exec -T postgres psql -U flexflow_user -d flexflow_dev < your-script.sql

# Create a database backup
docker-compose exec postgres pg_dump -U flexflow_user flexflow_dev > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U flexflow_user -d flexflow_dev < backup.sql
```

### Drizzle ORM Commands

```bash
# Generate migration files from schema changes
yarn db:generate

# Apply pending migrations
yarn db:migrate

# Drop all tables and re-run migrations (development only)
yarn db:reset

# View database with Drizzle Studio (if available)
yarn db:studio
```

## Development Workflow

### Typical Development Cycle

1. Start Docker services: `docker-compose up -d`
2. Make schema changes in `src/db/schema.ts`
3. Generate migration: `yarn db:generate`
4. Apply migration: `yarn db:migrate`
5. Start Next.js dev server: `yarn dev`

### Making Schema Changes

1. Edit `src/db/schema.ts` with your changes
2. Generate a new migration:
   ```bash
   yarn db:generate
   ```
3. Review the generated migration in `src/db/migrations/`
4. Apply the migration:
   ```bash
   yarn db:migrate
   ```

## pgAdmin Usage

### First-Time Setup

1. Open [http://localhost:8080](http://localhost:8080)
2. Login with:
   - Email: `admin@flexflow.local`
   - Password: `admin_password`
3. The FlexFlow database should appear automatically in the server list

### Common pgAdmin Tasks

- **Browse Data**: Servers → FlexFlow Development Database → Databases → flexflow_dev → Schemas → public → Tables
- **Run Queries**: Right-click on flexflow_dev → Query Tool
- **View Logs**: Dashboard tab shows server activity

## Troubleshooting

### Services Won't Start

Check Docker and Docker Compose versions:
```bash
docker --version
docker-compose --version
```

View detailed error logs:
```bash
docker-compose logs postgres
```

### Database Connection Issues

1. Ensure services are running:
   ```bash
   docker-compose ps
   ```

2. Check if PostgreSQL is accepting connections:
   ```bash
   docker-compose exec postgres pg_isready -U flexflow_user
   ```

3. Verify environment variables in `.env` file

### Port Conflicts

If ports 5432 or 8080 are already in use, modify `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "15432:5432"  # Use port 15432 instead

  pgadmin:
    ports:
      - "18080:80"    # Use port 18080 instead
```

Update your `DATABASE_URL` accordingly.

### Data Reset

To completely reset the database (⚠️ **destroys all data**):

```bash
# Stop services
docker-compose down

# Remove volumes
docker volume rm flexflow_postgres_data flexflow_pgadmin_data

# Restart services (will recreate database)
docker-compose up -d

# Re-run migrations
yarn db:migrate
```

## Production Considerations

This Docker setup is optimized for **development only**. For production:

1. **Use managed PostgreSQL** (AWS RDS, Google Cloud SQL, etc.)
2. **Update passwords** and use secrets management
3. **Remove pgAdmin** from production
4. **Adjust PostgreSQL configuration** for production workloads
5. **Enable SSL/TLS** for database connections
6. **Set up proper backups** and monitoring

## Team Collaboration

### Sharing Database Changes

1. **Always use migrations**: Never manually modify the database schema
2. **Commit migration files**: Include generated migrations in version control
3. **Test locally**: Run migrations locally before pushing
4. **Document changes**: Add meaningful messages to migrations

### Onboarding New Team Members

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose up -d`
4. Run `yarn db:migrate`
5. Start development: `yarn dev`

---

## Support

For Docker-related issues:
- Check the [Docker documentation](https://docs.docker.com/)
- Review `docker-compose logs` for error details
- Ensure Docker Desktop is running and up to date

For database issues:
- Check Drizzle ORM documentation
- Review PostgreSQL logs: `docker-compose logs postgres`
- Use pgAdmin to inspect database state