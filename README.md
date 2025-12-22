## MovieApp

**This project is under active development.**  
Learning project – Fullstack  
Link to application: *upcoming*

<img src="docs/images/landing-page.png" alt="Landing page" width="800" />

Web application for movie enthusiasts.  
Users can browse movies, write reviews, join groups, search showtimes, and manage favorites.  
The application integrates with **The Movie Database (TMDB)** API.

The project emphasizes **contract-driven and test-driven development**, with a strong focus on data modeling and explicit system behavior.

---

## Project Goal

The primary goal of this project is to develop my system design and software engineering skills through hands-on, production-oriented learning.

Rather than focusing on rapid feature delivery, the emphasis is on:
- clear API contracts
- explicit data and error flows
- predictable and testable behavior
- maintainable backend architecture

---

## Key Learnings

The most significant shift during this project was moving from *implementation-first* thinking to a **data-first and contract-first approach**.

Core principles applied:
- Design behavior before implementation
- Treat APIs as explicit contracts
- Use tests to enforce specifications
- Separate happy paths and error paths explicitly

### Development Process

The project follows this workflow consistently:

1. Design **data flows** and **error flows** using Mermaid and Markdown  
2. Define **Data Objects (DTOs)**  
3. Document decisions using **OpenAPI / Swagger**  
4. Define schemas with **Prisma** and **Zod**  
5. Write **spec-aligned tests**  
6. Implement the designed feature  

---

## Documentation

### Architecture
- [Overview](docs/architecture/00-overview.md)
- [Backend Components](docs/architecture/10-backend-components.md)
- [Auth Lifecycle](docs/architecture/20-auth-lifecycle.md)

### Data Flows

#### Authentication
- [Login – Happy Path](docs/flows/authentication/login.data-flow.md)
- [Login – Error Flow](docs/flows/authentication/login.error-flow.md)
- [Logout – Happy Path](docs/flows/authentication/logout.data-flow.md)
- [Logout – Error Flow](docs/flows/authentication/logout.error-flow.md)
- [Register – Happy Path](docs/flows/authentication/register.data-flow.md)
- [Register – Error Flow](docs/flows/authentication/register.error-flow.md)
- [Refresh Token – Happy Path](docs/flows/authentication/refresh.data-flow.md)
- [Refresh Token – Error Flow](docs/flows/authentication/refresh.error-flow.md)

#### The Movie Database (TMDB)
- [Search – Data Flow](docs/flows/tmdb/search.data-flow.md)
- [Search – Error Flow](docs/flows/tmdb/search.error-flow.md)
- [Single Movie Fetch – Data Flow](docs/flows/tmdb/movie-fetch.data-flow.md)
- [Single Movie Fetch – Error Flow](docs/flows/tmdb/movie-fetch.error-flow.md)
- [Movie Lists – Data Flow](docs/flows/tmdb/movie-lists.data-flow.md)
- [Movie Lists – Error Flow](docs/flows/tmdb/movie-lists.error-flow.md)
- [People – Data Flow](docs/flows/tmdb/people-single.fetch.md)
- [People – Error Flow](docs/flows/tmdb/people-single.fetch-errors.md)
- [Trending People – Data Flow](docs/flows/tmdb/people-trending.fetch.md)
- [Trending People – Error Flow](docs/flows/tmdb/people-trending.fetch-errors.md)

#### Database (PostgreSQL)
Documentation is being added incrementally.

---

## API Documentation

OpenAPI / Swagger documentation is used as the primary contract for the backend API.  
Documentation is updated alongside feature development.

---

## Database

Database schema and relationships are defined using Prisma.  
Entity relationships and constraints are documented separately.

---

## Technologies

### Frontend
- React (Vite)
- React Router DOM
- TypeScript

### Backend
- Node.js
- Express
- Prisma
- Zod
- Vitest
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv
- nodemon

### Documentation & Tooling
- OpenAPI / Swagger
- Mermaid (data and error flows)
- dbdiagram.io
- GitHub

---

## Project Structure



## Project structure
```
MovieApp/
  client/            # React frontend
  server/            # Node/Express backend
  docs/              # data-flows, architectures
  .gitignore
  README.md
```