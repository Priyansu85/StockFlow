# StockFlow — Inventory Management System

A full-stack inventory management application designed to simplify product tracking, supplier management, purchasing, sales, and inventory operations.

## Overview

StockFlow helps businesses manage their inventory efficiently through a centralized dashboard. It provides role-based access, real-time stock updates, transaction tracking, and business analytics.

## Features

- **Authentication:** Secure JWT-based login and registration.
- **Dashboard Analytics:** Overview of products, sales, purchases, and low-stock items.
- **Product Management:** Add, view, update, and manage products and categories.
- **Supplier Management:** Maintain supplier information.
- **Purchase Management:** Create purchase orders and receive stock.
- **Sales Management:** Create sales and complete transactions.
- **Inventory Tracking:** Monitor stock levels and inventory transactions.
- **Low-Stock Alerts:** Identify products that need restocking.
- **Reports:** Generate sales and purchase reports with date filters.
- **Role-Based Access Control:** Separate permissions for Admin, Manager, and Staff.
- **User Management:** Admin can create, update, and delete user accounts.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT |
| API Communication | Axios |
| Charts | Recharts |
| Routing | React Router |
| Version Control | Git and GitHub |

## User Roles

| Role | Permissions |
|---|---|
| Admin | Full system access and user management |
| Manager | Manage operational records and inventory workflows |
| Staff | View operational records with read-only access |

## Project Structure

```text
StockFlow/
├── backend/
│   ├── accounts/
│   ├── products/
│   ├── suppliers/
│   ├── inventory/
│   ├── purchases/
│   ├── sales/
│   ├── reports/
│   └── config/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       └── services/
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd StockFlow
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in the backend directory and configure your environment variables:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DB_NAME=stockflow_db
DB_USER=your_postgresql_username
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5432
```

Create the PostgreSQL database named `stockflow_db` and configure Django to use it.

Run migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend URL: `http://localhost:5173/`

## API Endpoints

| Module | Endpoint |
|---|---|
| Authentication | `/api/auth/login/` |
| User Profile | `/api/auth/me/` |
| User Management | `/api/auth/users/` |
| Products | `/api/products/` |
| Categories | `/api/categories/` |
| Suppliers | `/api/suppliers/` |
| Purchases | `/api/purchases/` |
| Sales | `/api/sales/` |
| Inventory | `/api/inventory/` |
| Dashboard Reports | `/api/reports/dashboard/` |
| Sales Reports | `/api/reports/sales/` |
| Purchase Reports | `/api/reports/purchases/` |

## Security

- JWT-based authentication.
- Role-based authorization.
- Protected frontend routes.
- Backend permission enforcement.
- Environment variables for sensitive configuration.
- Password hashing through Django authentication.

## Future Enhancements

- Automated low-stock notifications.
- Advanced inventory forecasting.
- Barcode scanning.
- Cloud deployment.
- Enhanced analytics and reporting.

## Author

Developed as a full-stack software engineering project using React, Django, and PostgreSQL.
