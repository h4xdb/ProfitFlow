# Masjid ERP System

## Overview

This is a comprehensive Masjid ERP web application designed to manage income and expenses for Islamic organizations. The system implements role-based access control with three distinct user roles: Admin, Manager, and Cash Collector. It handles task management, receipt book creation and assignment, receipt entry, expense tracking, and financial reporting with public transparency features.

The application follows a full-stack architecture with a React frontend and Express.js backend, using PostgreSQL for data persistence and implementing JWT-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.
Currency: Indian Rupees (₹) - Updated throughout all financial displays
UI: Logout button relocated to appear near manager sections for better UX

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom Islamic-themed color palette

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT token-based authentication with bcrypt password hashing
- **Middleware**: Custom authentication and role-based authorization middleware
- **API Structure**: RESTful API with role-based endpoint protection
- **Error Handling**: Centralized error handling with structured error responses

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Design**: 
  - Users table with role-based permissions (admin, manager, cash_collector)
  - Tasks for categorizing income streams
  - Receipt Books for organizing and assigning receipt collections
  - Receipts for individual income entries
  - Expense Types and Expenses for expenditure tracking
  - Published Reports for public financial transparency

### Role-Based Access Control
- **Admin**: Full system access including user management, all manager and cash collector permissions
- **Manager**: Task creation, receipt book management, expense management, report publishing, and data backup
- **Cash Collector**: Limited access to assigned receipt books and receipt entry within assigned ranges

### Key Features
- **Task Management**: Categorized income tracking (Construction, Charity, etc.)
- **Receipt Book System**: Controlled receipt numbering with assignment to collectors, managers can set custom starting/ending numbers
- **Financial Reporting**: Automated calculation of income, expenses, and balance in Indian Rupees (₹)
- **Public Transparency**: Published reports accessible without authentication
- **Data Backup**: SQL and JSON export capabilities for data preservation
- **Audit Trail**: Comprehensive tracking of all financial transactions with user attribution
- **Docker Ready**: Complete containerization setup for easy deployment
- **Default Users**: Automatic seeding of admin, manager, and cash collector accounts

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for API server
- **bcrypt**: Password hashing for security
- **jsonwebtoken**: JWT authentication tokens

### Frontend UI Dependencies
- **@radix-ui/***: Complete suite of accessible UI components
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolver for Zod schemas
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-driven component styling
- **clsx**: Conditional CSS class composition

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **zod**: Runtime type validation and schema definition
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

### Validation and Type Safety
- **drizzle-zod**: Database schema to Zod validation conversion
- **zod**: Runtime validation for forms and API endpoints
- **TypeScript**: Compile-time type safety across the entire stack

### Default System Credentials
After first deployment, the system creates these default accounts:
- **Admin**: username=`admin`, password=`admin123` (Full system access)
- **Manager**: username=`manager1`, password=`manager123` (Financial management)
- **Cash Collector 1**: username=`collector1`, password=`collector123` (Receipt entry)
- **Cash Collector 2**: username=`collector2`, password=`collector456` (Receipt entry)

⚠️ **Security Note**: Change these default passwords immediately after first login.

### Docker Deployment
The application is fully containerized with:
- Docker Compose setup with PostgreSQL database
- Automatic database seeding on startup
- Production-ready configuration
- Persistent data volumes
- Health checks and restart policies

### Recent Updates (August 2025)
- ✅ Currency changed from USD ($) to Indian Rupees (₹) across all displays
- ✅ Logout button repositioned near manager section in sidebar
- ✅ Docker containerization completed with production setup
- ✅ Enhanced receipt book management - managers can now set custom starting/ending receipt numbers
- ✅ Automatic database seeding with default users and categories
- ✅ Comprehensive documentation and deployment guide added