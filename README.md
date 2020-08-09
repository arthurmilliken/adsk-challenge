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
- /api/myMovieList -- retrieve movie list
- /api/myMovieList/:imdbID -- movie additional details
  - PUT: { imdbID, watched, rating, comments }

- / -- home page (my movie list: REACT)

---

MODELS:

savedMovie: {
  imdbID, Title, Year, Type, Poster,
  UserWatched, UserRating, UserComments
}
