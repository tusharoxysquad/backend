# Attendance Tracker — Backend

Production-level SaaS Attendance Tracker built with Node.js, Express, MongoDB, JWT, and RBAC.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit, bcryptjs
- **Logging**: Winston + Morgan
- **Scheduler**: node-cron

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Seed Super Admin
```bash
node src/scripts/seedSuperAdmin.js
```

### 4. Start server
```bash
# Development
npm run dev

# Production
npm start
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend base URL (e.g. `http://localhost:3000`) |
| `NODE_ENV` | `development` or `production` |

---

## Roles

| Role | Description |
|---|---|
| `SUPER_ADMIN` | Full system access |
| `ADMIN` | Manages assigned team |
| `EMPLOYEE` | Self-service attendance & leaves |

---

## API Reference

All endpoints are prefixed with `/api/v1`

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | All |
| GET | `/auth/me` | All |
| PATCH | `/auth/change-password` | All |

### Super Admin
| Method | Endpoint |
|---|---|
| POST | `/super-admin/create-admin` |
| POST | `/super-admin/create-employee` |
| GET | `/super-admin/admins` |
| GET | `/super-admin/employees` |
| GET | `/super-admin/user/:id` |
| PATCH | `/super-admin/user/:id` |
| DELETE | `/super-admin/user/:id` |
| PATCH | `/super-admin/user-status/:id` |
| PATCH | `/super-admin/reset-password/:id` |

### Admin
| Method | Endpoint |
|---|---|
| GET | `/admin/team-employees` |
| GET | `/admin/team-attendance` |
| GET | `/admin/employee-attendance/:employeeId` |
| GET | `/admin/pending-leaves` |
| PATCH | `/admin/approve-leave/:leaveId` |
| PATCH | `/admin/reject-leave/:leaveId` |

### Employee
| Method | Endpoint |
|---|---|
| GET | `/employee/profile` |
| PATCH | `/employee/profile` |

### Attendance
| Method | Endpoint | Access |
|---|---|---|
| POST | `/attendance/check-in` | All |
| POST | `/attendance/check-out` | All |
| GET | `/attendance/today` | All |
| GET | `/attendance/history` | All |
| GET | `/attendance/monthly` | All |
| GET | `/attendance/employee/:employeeId` | Admin+ |
| POST | `/attendance/mark-absent` | Super Admin |
| GET | `/attendance/pending-approvals` | Admin+ |
| PATCH | `/attendance/approve/:attendanceId` | Admin+ |
| PATCH | `/attendance/reject/:attendanceId` | Admin+ |

### Leave
| Method | Endpoint | Access |
|---|---|---|
| POST | `/leave/apply` | All |
| GET | `/leave/my-leaves` | All |
| GET | `/leave/all` | Admin+ |
| GET | `/leave/:leaveId` | All |
| PATCH | `/leave/cancel/:leaveId` | Employee |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/dashboard/super-admin` | Super Admin |
| GET | `/dashboard/admin` | Admin+ |
| GET | `/dashboard/employee` | All |

### Reports
| Method | Endpoint | Access |
|---|---|---|
| GET | `/reports/daily` | Admin+ |
| GET | `/reports/weekly` | Admin+ |
| GET | `/reports/monthly` | Admin+ |
| GET | `/reports/early-exits` | Admin+ |
| GET | `/reports/absent-employees` | Admin+ |

### Notifications
| Method | Endpoint |
|---|---|
| GET | `/notifications` |
| PATCH | `/notifications/:id` |

---

## API Response Format

**Success**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Paginated**
```json
{
  "success": true,
  "message": "Records fetched",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

## Attendance Approval Rules

| Employee Role | Who Approves |
|---|---|
| EMPLOYEE | ADMIN or SUPER_ADMIN |
| ADMIN | SUPER_ADMIN only |
| SUPER_ADMIN | Auto-approved |

---

## Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| Auto Absent | Daily 23:59 | Marks employees without check-in as ABSENT |

---

## Folder Structure

```
backend/
├── src/
│   ├── config/         # DB connection, JWT helpers
│   ├── constants/      # Enums and app-wide constants
│   ├── controllers/    # Thin request handlers
│   ├── cron/           # Scheduled jobs
│   ├── helpers/        # Reusable helpers (notifications)
│   ├── middleware/     # JWT, RBAC, error handler, rate limiter
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── scripts/        # One-time scripts (seed)
│   ├── services/       # Business logic layer
│   ├── utils/          # Logger, response, apiError, pagination
│   ├── validations/    # Joi schemas + validate middleware
│   └── app.js          # Express app setup
├── logs/
├── server.js           # Entry point
├── .env.example
├── .gitignore
└── package.json
```
