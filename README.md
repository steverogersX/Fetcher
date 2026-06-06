# Fetcher

A REST API that fetches public GitHub profile data by username, stores it in MySQL, and serves it back. Built with Express 5, Drizzle ORM, and TypeScript.

**Live API:** `https://fetcher-production-da21.up.railway.app`

---

## Table of Contents

- [Requirements](#requirements)
- [Setup — Development](#setup--development)
  - [1. Clone and install](#1-clone-and-install)
  - [2. Environment variables](#2-environment-variables)
  - [3. Start MySQL](#3-start-mysql)
  - [4. Run migrations](#4-run-migrations)
  - [5. Start the server](#5-start-the-server)
- [Deployment — Railway (Production)](#deployment--railway-production)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [GET /profiles](#get-profiles)
  - [GET /profiles/:username](#get-profilesusername)
- [Error Responses](#error-responses)

---

## Requirements

- Node.js 18+
- Docker (for the bundled MySQL container) — or an existing MySQL 8 instance

---

## Setup — Development

### 1. Clone and install

```bash
git clone https://github.com/steverogersX/fetcher.git
cd fetcher
npm install
```

### 2. Environment variables

Copy the example below into a `.env` file at the project root and fill in your values.

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# GitHub — optional but strongly recommended to avoid the 60 req/hr unauthenticated limit
# Create one at https://github.com/settings/tokens (no scopes needed for public data)
GITHUB_TOKEN=ghp_your_token_here

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=fetcher
DB_PASSWORD=fetcher
DB_NAME=fetcher

# Rate limiting (optional — defaults shown)
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=100

# CORS (optional — defaults to *)
CORS_ORIGINS=*

# Logging: fatal | error | warn | info | debug | trace
LOG_LEVEL=info
```

> All DB variables default to the values above, which match the Docker Compose setup exactly. You only need to change them if you're connecting to your own MySQL instance.

### 3. Start MySQL

```bash
docker compose up -d
```

This starts a MySQL 8.4 container named `fetcher_mysql` on port 3306 with a persistent volume. The database, user, and password are all created automatically using the values from your `.env`.

To stop it later:

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop, delete data
```

### 4. Run migrations

Migrations run automatically every time the server starts. You can also run them manually:

```bash
npm run db:migrate
```

Other Drizzle commands:

```bash
npm run db:generate   # generate a new migration after changing schema.ts
npm run db:studio     # open Drizzle Studio (browser GUI for the database)
```

### 5. Start the server

```bash
# Development — live reload
npm run dev

# Production
npm run build
npm start
```

The server listens on `http://localhost:3000` by default.

---

## Deployment — Railway (Production)

Railway provides a managed MySQL service and injects a `MYSQL_URL` connection string automatically. When `MYSQL_URL` is set the app ignores all individual `DB_*` variables.

### Steps

**1. Create a new Railway project**

Go to [railway.app](https://railway.app), create a project, and add a **MySQL** service from the service catalogue.

**2. Deploy the API**

Add a second service in the same project using **Deploy from GitHub repo** and point it at this repository.

**3. Link the database**

In your API service → **Variables**, add a variable reference that Railway resolves at deploy time:

| Variable | Value |
|---|---|
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` |
| `GITHUB_TOKEN` | your GitHub PAT |
| `NODE_ENV` | `production` |

Railway fills in `${{MySQL.MYSQL_URL}}` with the real connection string from your MySQL service. No other database variables are needed.

**4. Set the start command**

In your API service → **Settings → Deploy**, set the start command to:

```
npm run build && npm start
```

Migrations run automatically when the server starts (`runMigrations()` is called inside `bootstrap()`), so no manual migration step is needed.

**5. Done**

Railway assigns a public URL to your service (e.g. `https://fetcher-production.up.railway.app`). All endpoints work the same as in development.

---

### Environment variable reference

| Variable | Dev default | Production |
|---|---|---|
| `MYSQL_URL` | _(not set — uses individual DB\_\* vars)_ | `${{MySQL.MYSQL_URL}}` |
| `DB_HOST` | `localhost` | ignored when `MYSQL_URL` is set |
| `DB_PORT` | `3306` | ignored when `MYSQL_URL` is set |
| `DB_USER` | `fetcher` | ignored when `MYSQL_URL` is set |
| `DB_PASSWORD` | `fetcher` | ignored when `MYSQL_URL` is set |
| `DB_NAME` | `fetcher` | ignored when `MYSQL_URL` is set |
| `GITHUB_TOKEN` | optional | strongly recommended |
| `NODE_ENV` | `development` | `production` |
| `PORT` | `3000` | set by Railway automatically |

---

## Database Schema

A single table `github_profiles` stores every profile that has been fetched. Re-fetching a username updates the existing row in-place (`fetched_at` refreshes every time).

```sql
CREATE TABLE `github_profiles` (
  `github_id`         int          NOT NULL,
  `login`             varchar(39)  NOT NULL,
  `avatar_url`        varchar(500) NOT NULL,
  `html_url`          varchar(500) NOT NULL,
  `name`              varchar(255),
  `company`           varchar(255),
  `blog`              varchar(500),
  `location`          varchar(255),
  `bio`               text,
  `email`             varchar(254),
  `public_repos`      int          NOT NULL DEFAULT 0,
  `public_gists`      int          NOT NULL DEFAULT 0,
  `followers`         int          NOT NULL DEFAULT 0,
  `following`         int          NOT NULL DEFAULT 0,
  `github_created_at` timestamp    NOT NULL,
  `github_updated_at` timestamp    NOT NULL,
  `fetched_at`        timestamp    NOT NULL DEFAULT (now()),

  CONSTRAINT `github_profiles_github_id` PRIMARY KEY (`github_id`),
  CONSTRAINT `github_profiles_login_unique` UNIQUE (`login`)
);
```

| Column | Type | Description |
|---|---|---|
| `github_id` | int PK | GitHub's internal numeric user ID |
| `login` | varchar(39) UNIQUE | GitHub username (e.g. `torvalds`) |
| `avatar_url` | varchar(500) | Profile picture URL |
| `html_url` | varchar(500) | Public profile URL on github.com |
| `name` | varchar(255) \| NULL | Display name |
| `company` | varchar(255) \| NULL | Company field from profile |
| `blog` | varchar(500) \| NULL | Website / blog URL |
| `location` | varchar(255) \| NULL | Self-reported location |
| `bio` | text \| NULL | Bio text |
| `email` | varchar(254) \| NULL | Publicly visible email |
| `public_repos` | int | Number of public repositories |
| `public_gists` | int | Number of public gists |
| `followers` | int | Follower count |
| `following` | int | Following count |
| `github_created_at` | timestamp | When the GitHub account was created |
| `github_updated_at` | timestamp | When the GitHub profile was last updated |
| `fetched_at` | timestamp | When this row was last synced by Fetcher |

---

## API Reference

All responses share the same envelope:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "message": "...", "code": "..." } }
```

---

### GET /profiles

Returns every profile that has previously been fetched and stored.

#### Request

No parameters, no body.

```
GET /profiles
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "githubId": 1024025,
      "login": "torvalds",
      "avatarUrl": "https://avatars.githubusercontent.com/u/1024025?v=4",
      "htmlUrl": "https://github.com/torvalds",
      "name": "Linus Torvalds",
      "company": "Linux Foundation",
      "blog": "",
      "location": "Portland, OR",
      "bio": null,
      "email": null,
      "publicRepos": 8,
      "publicGists": 0,
      "followers": 246000,
      "following": 0,
      "githubCreatedAt": "2011-09-03T15:26:22.000Z",
      "githubUpdatedAt": "2024-11-08T17:07:39.000Z",
      "fetchedAt": "2026-06-06T10:22:01.000Z"
    },
    {
      "githubId": 9919,
      "login": "sindresorhus",
      "avatarUrl": "https://avatars.githubusercontent.com/u/9919?v=4",
      "htmlUrl": "https://github.com/sindresorhus",
      "name": "Sindre Sorhus",
      "company": null,
      "blog": "https://sindresorhus.com",
      "location": "Thailand",
      "bio": "Full-Time Open-Sourcerer",
      "email": "sindresorhus@gmail.com",
      "publicRepos": 1100,
      "publicGists": 98,
      "followers": 68000,
      "following": 0,
      "githubCreatedAt": "2008-05-10T20:43:10.000Z",
      "githubUpdatedAt": "2024-11-20T12:00:00.000Z",
      "fetchedAt": "2026-06-06T10:25:44.000Z"
    }
  ]
}
```

Returns an empty array `[]` when no profiles have been fetched yet.

---

### GET /profiles/:username

Fetches the latest data for a GitHub user **live from the GitHub API**, persists it (insert or update), and returns the result. Use this to add a new profile or refresh an existing one.

#### Request

| Part | Name | Type | Required | Rules |
|---|---|---|---|---|
| Path param | `username` | string | yes | 1–39 chars, alphanumeric and hyphens only, cannot start or end with a hyphen |

```
GET /profiles/torvalds
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "login": "torvalds",
    "id": 1024025,
    "avatarUrl": "https://avatars.githubusercontent.com/u/1024025?v=4",
    "htmlUrl": "https://github.com/torvalds",
    "name": "Linus Torvalds",
    "company": "Linux Foundation",
    "blog": "",
    "location": "Portland, OR",
    "bio": null,
    "email": null,
    "publicRepos": 8,
    "publicGists": 0,
    "followers": 246000,
    "following": 0,
    "createdAt": "2011-09-03T15:26:22Z",
    "updatedAt": "2024-11-08T17:07:39Z"
  }
}
```

> The single-profile response reflects the live GitHub API shape. The list endpoint (`GET /profiles`) returns the stored DB shape, which additionally includes `githubId`, `githubCreatedAt`, `githubUpdatedAt`, and `fetchedAt` in their camelCase Drizzle forms.

#### Response — 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "GitHub user 'doesnotexist99999' not found",
    "code": "GITHUB_USER_NOT_FOUND"
  }
}
```

#### Response — 422 Unprocessable Entity

Returned when the username fails format validation before any network call is made.

```
GET /profiles/--bad-username--
```

```json
{
  "success": false,
  "error": {
    "message": "id: Invalid GitHub username format",
    "code": "VALIDATION_ERROR"
  }
}
```

---

## Error Responses

| HTTP Status | Code | When |
|---|---|---|
| 404 | `GITHUB_USER_NOT_FOUND` | Username does not exist on GitHub |
| 404 | `NOT_FOUND` | Route does not exist |
| 422 | `VALIDATION_ERROR` | Username fails format rules |
| 429 | `GITHUB_RATE_LIMIT` | GitHub API rate limit hit (includes reset time in message) |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `GITHUB_AUTH_ERROR` | `GITHUB_TOKEN` is invalid or expired |
| 502 | `GITHUB_UNAVAILABLE` | GitHub API returned a 5xx |
| 502 | `GITHUB_API_ERROR` | Other GitHub API error |
| 503 | `DB_READ_ERROR` | Failed to read from the database |
| 503 | `DB_WRITE_ERROR` | Failed to write to the database |
