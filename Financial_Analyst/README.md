# TransitOps - Transport Operations Management Platform

TransitOps is a MERN-stack Transport Operations Management Platform tailored for **Financial Analysts** with a premium dark SaaS ERP theme. 

## Features

- **JWT Authentication & RBAC**: Dedicated secure login with role permissions.
- **Executive Dashboard**: Large KPIs with custom sparklines, AI-generated insights, and Recharts line/bar metrics.
- **Fuel Logs & Expense Logs Modules**: Complete interactive CRUD, paginated tables, filtering, sorting, and summaries.
- **ROI & Profitability Analytics**: Automated mathematical ledger computation for Return On Investment and Margins.
- **Auditing Reports**: Create logs and export/simulate CSV, Excel, or PDF report formats.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) installed
- [MongoDB](https://www.mongodb.com/) running locally (port `27017`) or Atlas URI.

### Step 1: Database Seeding & Backend setup
1. Open a terminal, go to the server directory:
   ```bash
   cd server
   ```
2. Run database seed to inject mock analyst accounts and ledger history:
   ```bash
   npm run seed
   ```
3. Start Express server:
   ```bash
   npm run dev
   ```
   *The server runs on port `5000`.*

### Step 2: Frontend client setup
1. Open a new terminal, go to the client directory:
   ```bash
   cd client
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client runs on port `3000` (automatically proxies API requests to server).*

---

## Test Evaluation Credentials

You can sign in using these default seeded accounts:

- **Role: Financial Analyst**
  - **Email**: `analyst@transitops.com`
  - **Password**: `password123`

- **Role: System Admin**
  - **Email**: `admin@transitops.com`
  - **Password**: `password123`
