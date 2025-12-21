# MovieApp
This project is under development.
Learning project – Fullstack
Link to application: *upcoming"

Web application for movie enthusiasts. 
Users can browse movies, write reviews, join groups, search showtimes and add favorites.
Utilisizes The Movie Database (TMDB).

### Goal of the project
To develop my thinking skills with hands on learning.
Project utilizes TypeScript, Vitest, Zod and Mermaid documentation.

## Documentation

### Architecture
- [Architecture](docs/architecture/00-overview.md)
- [Backend Components](docs/architecture/10-backend-components.md)
- [Auth Lifecycle](docs/architecture/20-auth-lifecycle.md)

### Data flows

#### Authentication
- [Login Happy Path Flow](docs/flows/authentication/login.data-flow.md)
- [Login Error Flow](docs/flows/authentication/login.error-flow.md)
- [Logout Happy Path Flow](docs/flows/authentication/logout.data-flow.md)
- [Logout Error Flow](docs/flows/authentication/logout.error-flow.md)
- [Register Happy Path Flow](docs/flows/authentication/register.data-flow.md)
- [Register Error Flow](docs/flows/authentication/register.error-flow.md)
- [Refresh Token Happy Path Flow](docs/flows/authentication/refresh.data-flow.md)
- [Refresh Token Error Flow](docs/flows/authentication/register.error-flow.md)

#### The Movie Database
- [Single Movie Fetch Data Flow](docs/flows/tmdb/movie-fetch.data-flow.md)
- [Single Movie Error Flow](docs/flows/tmdb/movie-fetch.error-flow.md)
- [Movie Lists Data Flow](docs/flows/tmdb/movie-lists.data-flow.md)
- [Movie Lists Error Flow](docs/flows/tmdb/movie-lists.error-flow.md)
- [People Data Flow](docs/flows/tmdb/people-single.fetch.md)
- [People Error Flow](docs/flows/tmdb/people-single.fetch-errors.md)
- [Trending People Data Flow](docs/flows/tmdb/people-trending.fetch.md)
- [Trending People Error Flow](docs/flows/tmdb/people-trending.fetch-errors.md)


### API documentation


### Database


### UI

## Technologies
#### Frontend:
<ol>
   <li>React (Vite)</li>
   <li>React Router DOM</li>
   <li></li>
</ol>

#### Backend
<ol>
   <li>Node.js</li>
   <li>Express</li>
   <li>cors</li>
   <li>bcrypt</li>
   <li>jsonwebtoken</li>
   <li>cookie-parser</li>
   <li>cross-env</li>
   <li>dotenv</li>
   <li>nodemon</li>
</ol>

### Documentation and Version Control
- Documentation: OpenAPI (Swagger), dbdiagram.io
- Version Control: GitHub

## Project structure
```
MovieApp/
  client/            # React frontend
  server/            # Node/Express backend
  docs/              # data-flows, architectures
  .gitignore
  README.md
```