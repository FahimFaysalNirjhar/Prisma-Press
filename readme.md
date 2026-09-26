# Prisma Press — Backend

A REST API for a role-based news/blog platform with subscriptions, comments, and an author-application workflow, built with Express, TypeScript, and Prisma/PostgreSQL.

## Links

- **Frontend (Live)**: https://nextjs-press-frontend-five.vercel.app/
- **Frontend Repo**: https://github.com/FahimFaysalNirjhar/Nextjs-Press-Fronend

## Author

- **Fahim Faysal Nirjhar** — Full Stack Developer
- GitHub: https://github.com/FahimFaysalNirjhar
- Email: fahimfaysal1995@gmail.com

## Tech Stack

- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens, stored in HTTP-only cookies)
- **Password hashing**: bcryptjs
- **Payments**: Stripe (subscriptions)
- **Image hosting**: imgbb (avatar uploads)

## Features

- **Auth**: register, login, JWT-based session via cookies, role-aware redirects
- **Roles**: `USER`, `AUTHOR`, `ADMIN` with route-level guards
- **Posts**: CRUD, featured/premium flags, view counts, tags, draft/published/archived status
- **Comments**: create, edit, delete, moderation (approve/reject) by admins
- **Author requests**: users can apply to become an author; admins review and approve/reject
- **Subscriptions**: Stripe-backed premium subscription with webhook handling
- **Admin dashboard API**: platform-wide stats (posts, comments, views), full user/post listings

## Project Structure

```
src/
├── app/
│   └── modules/
│       ├── user/
│       │   ├── user.route.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── user.interface.ts
│       ├── post/
│       │   ├── post.route.ts
│       │   ├── post.controller.ts
│       │   └── post.service.ts
│       ├── comment/
│       │   ├── comment.route.ts
│       │   ├── comment.controller.ts
│       │   └── comment.service.ts
│       └── middlewares/
│           └── auth.ts
├── lib/
│   └── prisma.ts
├── utils/
│   ├── catchAsync.ts
│   └── sendResponse.ts
├── config/
│   └── index.ts
prisma/
└── schema.prisma
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/prisma_press"
PORT=5000

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

IMAGE_HOST_KEY="your-imgbb-api-key"
```

## Getting Started

```bash
# install dependencies
npm install

# generate Prisma client
npx prisma generate

# run migrations
npx prisma migrate dev

# start dev server
npm run dev
```

## Database Migrations

Whenever `schema.prisma` changes:

```bash
npx prisma migrate dev --name <migration_name>
```

For production:

```bash
npx prisma migrate deploy
```

## API Overview

Base path conventions: each resource is mounted under `/api/<resource>`.

### Auth (`/api/auth`)

| Method | Path     | Access | Description          |
| ------ | -------- | ------ | -------------------- |
| POST   | `/login` | Public | Log in, sets cookies |

### Users (`/api/users`)

| Method | Path                   | Access        | Description                   |
| ------ | ---------------------- | ------------- | ----------------------------- |
| POST   | `/register`            | Public        | Register a new account        |
| GET    | `/me`                  | Authenticated | Get own profile               |
| PUT    | `/my-profile`          | Authenticated | Update own profile            |
| POST   | `/author-requests`     | USER          | Submit an author application  |
| GET    | `/author-requests/me`  | USER          | Check own application status  |
| GET    | `/author-requests`     | ADMIN         | List all author applications  |
| PATCH  | `/author-requests/:id` | ADMIN         | Approve/reject an application |
| GET    | `/`                    | ADMIN         | List all users                |

### Posts (`/api/posts`)

| Method | Path         | Access              | Description                       |
| ------ | ------------ | ------------------- | --------------------------------- |
| POST   | `/`          | USER, AUTHOR, ADMIN | Create a post                     |
| GET    | `/`          | Public              | List posts (excludes premium)     |
| GET    | `/my-posts`  | USER, AUTHOR, ADMIN | List own posts                    |
| GET    | `/admin/all` | ADMIN               | List all posts, including premium |
| GET    | `/stats`     | ADMIN               | Dashboard statistics              |
| GET    | `/:postId`   | Public              | Get a single post                 |
| PATCH  | `/:postId`   | USER, AUTHOR, ADMIN | Update a post                     |
| DELETE | `/:postId`   | USER, AUTHOR, ADMIN | Delete a post                     |

### Comments (`/api/comments`)

| Method | Path                   | Access        | Description                   |
| ------ | ---------------------- | ------------- | ----------------------------- |
| POST   | `/`                    | Authenticated | Create a comment on a post    |
| GET    | `/my-comments`         | Authenticated | Own comments                  |
| GET    | `/:postId`             | Public        | Comments on a post            |
| GET    | `/author/:authorId`    | Authenticated | Comments on an author's posts |
| GET    | `/`                    | ADMIN         | All comments (filterable)     |
| PATCH  | `/:commentId`          | Authenticated | Edit own comment              |
| PATCH  | `/:commentId/moderate` | ADMIN         | Approve/reject a comment      |
| DELETE | `/:commentId`          | Owner/Admin   | Delete a comment              |

### Subscription (`/api/subscription`)

| Method | Path       | Access        | Description                     |
| ------ | ---------- | ------------- | ------------------------------- |
| GET    | `/status`  | Authenticated | Get current subscription status |
| POST   | `/webhook` | Stripe        | Stripe webhook handler          |
| GET    | `/premium` | Subscriber    | Premium content access check    |

## Response Shape

All endpoints return a consistent envelope via `sendResponse`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 }
}
```

## Scripts

```bash
npm run dev      # start dev server with hot reload
npm run build    # compile TypeScript
npm start        # run compiled build
npx prisma studio  # visual database browser
```

## Known Issues / TODO

- Stripe webhook handling needs verification (flagged as not fully working)
- Query param validation (status enums, role enums) should use runtime validation instead of type casts
- Pagination not yet added to `/api/posts/admin/all` and `/api/users`
