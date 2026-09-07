# Store Rating Platform

A full-stack store rating application built as part of a coding challenge.

The idea is simple: users can browse stores and submit ratings, store owners can see how their stores are performing, and administrators can manage users and stores from one dashboard.

## Features

### Normal User

* Sign up and log in
* View all stores
* Search stores by name or address
* View overall store ratings
* Submit a rating from 1–5
* Modify an existing rating
* Update password
* Logout

### Store Owner

* Log in
* View their stores
* View average ratings
* View total number of ratings
* See users who rated their stores
* Update password
* Logout

### Administrator

* Dashboard with total users, stores and ratings
* Create users
* Create stores
* View users
* Search users by name, email or address
* Filter users by role
* Sort users by name, email, address and role
* View store owners and their store information
* Search stores
* Sort stores by name, email, address and rating
* Update password
* Logout

## Tech Stack

**Frontend**

* React
* React Router
* Axios
* CSS

**Backend**

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt

## Project Structure

```text
store-rating-app/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── middleware/
│       │   └── auth.js
│       ├── routes/
│       │   ├── admin.js
│       │   ├── auth.js
│       │   ├── owner.js
│       │   └── stores.js
│       ├── app.js
│       └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Admin.jsx
        │   ├── Login.jsx
        │   ├── Owner.jsx
        │   ├── Password.jsx
        │   ├── Signup.jsx
        │   └── Stores.jsx
        ├── api.js
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Zaid737/store-rating-platform.git
cd store-rating-platform
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

Run the database migration:

```bash
npx prisma migrate dev
```

Seed the initial data:

```bash
node prisma/seed.js
```

Start the server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL provided by Vite, normally:

```text
http://localhost:5173
```

## Demo Accounts

The initial seed contains:

| Role        | Email                                         | Password     |
| ----------- | --------------------------------------------- | ------------ |
| Admin       | [admin@example.com](mailto:admin@example.com) | Password@123 |
| Store Owner | [owner@example.com](mailto:owner@example.com) | Password@123 |
| Normal User | [user@example.com](mailto:user@example.com)   | Password@123 |

Additional users and stores can be created from the Admin dashboard.

## Application Flow

There is one login system for all roles.

```text
                    Login
                      │
                      ▼
                 JWT Token
                      │
                 Role Check
             ┌────────┼────────┐
             ▼        ▼        ▼
           Admin    Owner     User
             │        │        │
             ▼        ▼        ▼
          Admin     Owner     Stores
        Dashboard  Dashboard  Page
```

## Ratings

A user can rate a store from **1 to 5**.

Each user can have only one rating for a particular store. If they submit another rating for the same store, the existing rating is updated.

The store's overall rating is calculated from all submitted ratings.

## Validation

The application validates:

* Name: 20–60 characters
* Address: maximum 400 characters
* Password: 8–16 characters
* Password must contain an uppercase letter
* Password must contain a special character
* Email format
* Rating: 1–5
* Store Owner ID must belong to a user with the `STORE_OWNER` role

## Authentication & Authorization

Passwords are hashed using bcrypt before being stored.

JWT is used for authentication. Protected API routes verify the token and role before allowing access.

For example:

```text
ADMIN
  └── Admin APIs

STORE_OWNER
  └── Owner APIs

USER
  └── Store & Rating APIs
```

This prevents users from accessing functionality belonging to other roles.

## Database

The application uses PostgreSQL with Prisma.

The main entities are:

```text
User
 ├── Stores
 └── Ratings

Store
 ├── Owner
 └── Ratings

Rating
 ├── User
 └── Store
```

A unique constraint on `(userId, storeId)` prevents duplicate ratings from the same user for the same store.

## Notes

I kept the implementation intentionally straightforward so the application is easy to understand and maintain.

For a larger production system, I would consider adding pagination, automated tests, caching, centralized error handling, logging, and deployment-specific configuration.

