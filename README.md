# oPersonel - Multi-Tenant HR Management System

Modern, scalable and feature-rich Human Resources Management System built with Node.js, React and PostgreSQL.

## Features

### Current Features (MVP)
- ✅ Multi-tenant architecture (single domain with session-based tenant isolation)
- ✅ Flexible tenant management (ready for subdomain and custom domain in the future)
- ✅ JWT-based authentication with tenant context
- ✅ Role-based access control (RBAC)
- ✅ Employee & Organization Management (basic)
- ✅ Department Management
- ✅ Dashboard with statistics
- ✅ Responsive UI with TailwindCSS

### Upcoming Features
- 🔄 Leave Management System
- 🔄 Payroll System
- 🔄 Performance Management
- 🔄 Recruitment & Onboarding
- 🔄 Employee Self-Service Portal
- 🔄 Advanced Reporting & Analytics
- 🔄 Subdomain support for premium tenants
- 🔄 Custom domain support for enterprise tenants

## Tech Stack

### Backend
- Node.js 20+ with TypeScript
- Express.js (REST API)
- Prisma ORM
- PostgreSQL 15+
- JWT Authentication
- Bcrypt (password hashing)

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router v6
- Axios (HTTP client)
- Zustand (state management)
- Lucide React (icons)

### DevOps
- Docker & Docker Compose
- PostgreSQL container
- Redis container (for caching)

## Project Structure

```
opersonel/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── middleware/       # Express middlewares (auth, tenant, error)
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── tenant/       # Tenant management
│   │   │   ├── employee/     # Employee management
│   │   │   ├── organization/ # Organization structure
│   │   │   └── user/         # User management
│   │   ├── common/           # Shared utilities
│   │   ├── database/         # Prisma client
│   │   └── server.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── layouts/      # Layout components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── employees/    # Employee pages
│   │   │   └── departments/  # Department pages
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Getting Started

### Method 1: Using Docker (Recommended)

1. Clone the repository
```bash
git clone <repository-url>
cd opersonel
```

2. Start PostgreSQL and Redis using Docker Compose
```bash
docker-compose up -d
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Generate Prisma client and run migrations
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # Load demo data
```

5. Start backend server
```bash
npm run dev
```

6. In a new terminal, install frontend dependencies
```bash
cd frontend
npm install
```

7. Start frontend development server
```bash
npm run dev
```

### Method 2: Manual Setup

#### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

#### Installation

1. Clone and setup database
```bash
git clone <repository-url>
cd opersonel

# Create PostgreSQL database
createdb opersonel
```

2. Backend setup
```bash
cd backend
npm install

# Update .env with your database URL
# DATABASE_URL="postgresql://username:password@localhost:5432/opersonel"

npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

### Demo Credentials

**Company Code:** `demo-company`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@democompany.com | password123 |
| Manager | fatma.kaya@democompany.com | password123 |
| Employee | ali.celik@democompany.com | password123 |

## Multi-Tenant Architecture

### Current Implementation
The system uses **session-based tenant isolation** where:
- Tenant is selected during login
- Tenant ID is stored in cookies and localStorage
- All API requests include tenant context
- Database queries are filtered by tenant ID

### Future Roadmap
1. **Subdomain Support** (Premium Feature)
   - `company.opersonel.com`
   - Automatic tenant detection from subdomain
   - DNS automation

2. **Custom Domain Support** (Enterprise Feature)
   - `hr.company.com` → oPersonel
   - SSL certificate provisioning
   - Whitelabel solution

## Database Schema

Key entities:
- **Tenants:** Multi-tenant organizations
- **Users:** System users with roles
- **Employees:** HR employee records
- **Departments:** Organizational structure
- **Positions:** Job positions/titles
- **Leave Types & Requests:** Leave management
- (More entities to be added)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Tenants
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/current` - Get current tenant info
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants/slug/:slug` - Get tenant by slug

(More endpoints to be documented)

## Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://opersonel:opersonel123@localhost:5432/opersonel"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

**Built with ❤️ for modern HR teams**
