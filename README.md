# Asva Labs Assessment - Project Management Platform

A multi-tenant project management platform.

## 📍 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+
- npm

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbhishekJadhav2002/asva-labs-assessment.git
   cd asva-labs-assessment
   ```

2. **Start development environment**

   ```bash
   chmod +x scripts/*.sh
   npm run dev
   ```

   This will:
   - Start all infrastructure services (PostgreSQL, Redis, Kafka)
   - Install dependencies
   - Run database migrations
   - Seed demo data
   - Start API and Frontend servers

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

### Demo Credentials

- **Admin**: admin@demo.com / demo123 / tenant: demo
- **User**: user@demo.com / demo123 / tenant: demo

## 📍 Scripts

- `npm run dev` - Start development environment
- `npm run build` - Build for production
- `npm run prod` - Start production environment
- `npm test` - Run tests
- `npm run clean` - Clean up containers, images and build files

## 📍 Configuration

### Environment Variables

Create `.env` file using `.example.env` in the root directory:

```bash
cp .example.env .env
```

## 📍 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Project Endpoints

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Endpoints

- `GET /api/tasks/project/:projectId` - List project tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 📍 Testing

Run the test suite:

```bash
npm test
```

Tests include:

- Unit tests for services
- Integration tests for API endpoints
- Authentication flow tests

## 📍 Deployment

### Production Deployment

```bash
npm run prod
```

### Manual Docker Deployment

```bash
docker compose -f docker-compose.yml up -d
```
