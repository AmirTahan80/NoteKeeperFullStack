# NoteKeeper

A web application for creating, organizing, and searching notes. This repository combines `NoteKeeperFront` and `NoteKeeperBack` while preserving the Git history of both projects.

[![CI](https://github.com/AmirTahan80/NoteKeeperFullStack/actions/workflows/ci.yml/badge.svg)](https://github.com/AmirTahan80/NoteKeeperFullStack/actions/workflows/ci.yml)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AmirTahan80/NoteKeeperFullStack)

## Features

- Registration and sign-in with JWT and standard ASP.NET Core password hashing
- Categories and notes with search, pagination, and file attachments
- Complete access isolation so users can only view their own notes and files
- Angular 22 and ASP.NET Core on .NET 10 in a single web service
- PostgreSQL with automatic EF Core migrations
- Docker, Docker Compose, Render Blueprint, and GitHub Actions

## Quick start with Docker

Prerequisite: Docker Desktop

```powershell
docker compose up --build
```

Then open [http://localhost:8080](http://localhost:8080). To stop the application:

```powershell
docker compose down
```

Data persists in the local `notekeeper-data` volume. To intentionally remove the local data, run `docker compose down -v`.

## Development

Start PostgreSQL first:

```powershell
docker compose up database -d
dotnet run --project NoteBookKeeper.Api
```

In a second terminal:

```powershell
cd ClientApp
npm ci
npm start
```

Angular runs at [http://localhost:4200](http://localhost:4200) and proxies `/api` requests to ASP.NET Core.

## Build and test

```powershell
dotnet build NoteBookKeeper.sln -c Release
cd ClientApp
npm ci
npm run build
npm test -- --browsers=ChromeHeadless
cd ..
./scripts/e2e.ps1
docker build -t notekeeper:local .
```

After starting the application, `/api/health` should return `Healthy`. Create a test account, sign in, create a category and a note with an image, and verify in another browser that the file cannot be downloaded without a token.

## Deploy to Render

The `render.yaml` file provisions a web service and PostgreSQL database. Select **Deploy to Render**, sign in to Render, and confirm the Blueprint. A secure JWT key is generated automatically.

> Render's free plan is suitable for demos, but its free database is not permanent. For a long-lived portfolio project, upgrade the database or connect `DATABASE_URL` to a persistent PostgreSQL instance.

## Project structure

```text
ClientApp/             Angular frontend
NoteBookKeeper.Api/    ASP.NET Core API and EF Core
Dockerfile             Production image for both apps
docker-compose.yml     Local web app + PostgreSQL
render.yaml            One-click cloud blueprint
```

## Security note

The original repositories contained sample configuration values in their history. The current version does not commit real secrets. If any historical value was used in a real environment, rotate it because removing it from the current files does not remove it from Git history.
