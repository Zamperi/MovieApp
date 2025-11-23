# MovieApp TypeScript Uudelleenrakennus – Teknologiasuunnitelma ja Toteutussuunnitelma

## 1. Projektin yleiskuva

Tavoitteena on rakentaa MovieApp-sovellus uudelleen TypeScriptillä, käyttäen modernia ja ammattimaista full-stack-arkkitehtuuria. Projekti toimii sekä oppimis- että portfoliotason kokonaisuutena. Painopisteinä ovat ohjelmistoarkkitehtuuri, CI/CD-putki, testaus ja Azure-julkaisu.

---

## 2. Teknologiapino

### Frontend

* **Framework:** React 18 + TypeScript
* **Routing:** React Router DOM
* **State management:** Context API tai Redux Toolkit (laajennettavuuden mukaan)
* **UI-kirjasto:** MUI (Material UI)
* **Testaus:** Vitest + React Testing Library + MSW (mockaukseen)
* **E2E-testit:** Playwright
* **Rakennustyökalu:** Vite
* **API-kommunikaatio:** Axios
* **Tyylitys:** CSS Modules / Styled Components / MUI Theme

### Backend

* **Runtime:** Node.js 20+
* **Kieli:** TypeScript
* **Framework:** Express.js
* **Tietokanta:** PostgreSQL (Azure Database for PostgreSQL – Flexible Server)
* **ORM:** Prisma
* **Testaus:** Vitest + Supertest / Pactum
* **Dokumentointi:** Swagger (OpenAPI 3.1) + Redoc (luettava dokumentaatio)
* **Validaatio:** Zod (zod-to-openapi generointiin)
* **Autentikointi:** JWT + bcrypt (myöhemmin Azure AD B2C mahdollinen)

### CI/CD ja DevOps

* **Versionhallinta:** GitHub
* **CI/CD:** GitHub Actions
* **Deployment:**

  * Frontend → Azure Static Web Apps
  * Backend → Azure App Service (Node) tai Azure Container Apps
* **Secrets:** Azure Key Vault + OIDC-federointi
* **Observability:** Azure Application Insights + Azure Monitor
* **DB migraatiot:** Prisma Migrate (ajetaan CI/CD-putkessa ennen julkaisua)

### Kontitus (vaihe 2)

* **Containerit:** Docker (frontend, backend erikseen)
* **Registry:** Azure Container Registry (ACR)
* **Julkaisu:** Azure Container Apps tai Web App for Containers

---

## 3. Toteutusvaiheet

### Vaihe 1 – Perusrakenne (2–3 viikkoa)

* Luo monorepo tai kaksi erillistä repoja (frontend ja backend).
* Määritä TypeScript-konfiguraatiot (`tsconfig.json`) molempiin.
* Rakenna Express-backend: perusreitit, yhteys PostgreSQL:ään, Prisma ORM.
* Luo React-frontend: perusnäkymät, routing, API-kutsut, komponenttirakenne.
* Käynnistä molemmat lokaalisti ja varmista yhteys API ↔ frontend.

### Vaihe 2 – API ja tietokanta (2 viikkoa)

* Mallinna tietokanta (User, Movie, Review, Favorite jne.).
* Toteuta REST API CRUD-toiminnoilla.
* Lisää Swagger-dokumentaatio ja OpenAPI-validointi (Zod + tsoa).
* Lisää autentikointi ja JWT.
* Tee ensimmäiset yksikkö- ja integraatiotestit.

### Vaihe 3 – Frontend-logiikka ja testaus (2–3 viikkoa)

* Lisää hakutoiminnot, suosikit, kirjautuminen ja tilanhallinta.
* Tee komponenttitestit (Vitest + RTL).
* Lisää MSW ja Playwright E2E-testit.
* Paranna käyttöliittymää MUI:lla.

### Vaihe 4 – CI/CD ja julkaisu (2 viikkoa)

* Määritä GitHub Actions -workflowt:

  * Build → Test → Deploy → Azure
* Toteuta OIDC-yhteys GitHubin ja Azuren välille (salasanoja ei tarvita).
* Aja testit pipeline-vaiheessa ja migraatiot ennen julkaisua.
* Julkaise frontend Azure Static Web Appsiin ja backend App Serviceen.

### Vaihe 5 – (Valinnainen) Kontitus ja DevOps-syventäminen (2 viikkoa)

* Tee Dockerfilet backendille ja frontille.
* Julkaise kuvat Azure Container Registryyn.
* Deploy Azure Container Appsiin.
* Lisää monitorointi (Application Insights, Logs, Alerts).

---

## 4. Projektin laajennusmahdollisuudet

* AI-elokuvasuositusjärjestelmä (Azure Cognitive Services / OpenAI API)
* GraphQL-lisäys RESTin rinnalle.
* Role-based access control (RBAC).
* Monikäyttäjätila ja reaktiivinen data (WebSockets / SignalR).
* Docker Compose dev-ympäristölle.

---

## 5. Tavoiteltu lopputulos

Valmis, tyypitetty ja testattu full-stack-sovellus, jossa:

* CI/CD-julkaisu toimii Azuren kautta.
* Swagger-dokumentaatio generoi virallisen OpenAPI-spesifikaation.
* Testit (unit, integration, e2e) kattavat keskeiset toiminnot.
* Koodi on jaoteltu clean architecture -periaattein (controller/service/repository).

Tämä kokonaisuus toimii vahvana referenssinä ammattilaisportfolioon ja todistaa osaamisen modernin TypeScript-stackin, DevOpsin ja pilvijulkaisun hallinnassa.
