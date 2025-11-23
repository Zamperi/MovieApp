# MovieApp

MovieApp is a website for movie lovers!

## Projct structure

server/
  src/
    index.ts    // vastaa HTTP-tason käynnistyksestä
    routes/     //määrittää API-rajapinnat
      movies.routes.ts
    controllers/    //hoitaa HTTP-tason I/O:n
      movies.controller.ts
    services/       //sisältää liiketoimintalogiikan
      movies.service.ts
    repositories/       //hoitaa tietokantakyselyt (Prisma)
      movie.repo.ts
    schemas/            //tekee validoinnin (Zod)
      movie.schema.ts
    middlewares/    //tarjoaa toistettavat logiikat (validointi, virheenkäsittely, auth)
      validate.ts
      error.ts
    lib/
      prisma.ts            //Prisma instance
    types/               //Typescript types
      express.d.ts     
  prisma/
    schema.prisma       //database schemas
