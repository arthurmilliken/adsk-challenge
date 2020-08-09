# adsk-challenge
Autodesk Code Challenge

How to install/run:

- install NodeJS v12 and npm v6
- `git clone https://github.com/arthurmilliken/adsk-challenge.git`
- `cd adsk-challenge`
- update .env.example with the appropriate values and save as .env
- `npm install`
- `npm start`

---

ROUTES:

- /api/omdb -- OMDB search
- /api/omdb/:imdbID -- OMDB find by ID
- /api/myMovieList -- myMovieList
  - GET: get all movies (plus fitering/sort)
  - POST: add movie to list { imdbID }
- /api/myMovieList/:imdbID -- myMovieList
  - GET: find by ID
  - PATCH: { imdbID, watched, rating, comments }

- / -- home page (React.js Application)

---
