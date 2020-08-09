const axios = require('axios').default;
const express = require('express');
const logger = require('../logger');

const router = express.Router();
const omdbUrl = 'https://www.omdbapi.com/';
const apiKey = process.env.OMDB_API_KEY;

function logResponse(response) {
  logger.debug(`${response.request.path}: ${response.status} ${response.statusText}`);
}

// TODO: separate omdb and myMovieList apis into different files.

/* Search OMDB for titles */
router.get('/omdb', async (req, res) => {
  try {
    // Pass through query string parameters to OMDB
    const params = {...req.query};
    params['apiKey'] = apiKey;
    if (!params.s) {
      throw("'s' is a required parameter");
    }
    const response = await axios.get(omdbUrl, { params });
    logResponse(response);
    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).json(err.toString());
  }
});

// TODO: move this to models/Movie.js
/* helper function for fetching movie from OMDB */
async function getMovie(imdbID) {
  const params = { apiKey, i: imdbID, plot: 'full' };
  // logger.debug(params);
  const response = await axios.get(omdbUrl, { params });
  logResponse(response);
  return response.data;
}

/* Fetch title from OMDB */
router.get('/omdb/:imdbID', async (req, res) => {
  try {
    res.json(await getMovie(req.params.imdbID));
  } catch (err) {
    logger.error(err);
    res.status(500).json(err.toString());
  }
});

/**
 * Data operations on myMovieList
 * methods: GET, POST
 */
router.route('/myMovieList')
.get((req, res) => {
  const movies = Array.from(res.app.locals.myMovieList.values());
  // TODO: add watched filter
  // TODO: add rating filter
  // TODO: add sort
  res.json(movies);
})
.post(async (req, res) => {
  const myMovieList = res.app.locals.myMovieList;
  const imdbID = req.body.imdbID;
  if (myMovieList.has(imdbID)) {
    return res.sendStatus(204);
  } else {
    // TODO: make MyMovie class
    const myMovie = await getMovie(imdbID);
    myMovie.Watched = false;
    myMovie.Comments = [];
    myMovieList.set(imdbID, myMovie);
    return res.json(myMovie);
  }
});

/**
 * Data operations on myMovieList detail
 * Methods: GET, PUT
 */
router.route('/myMovieList/:imdbID')
.get(async (req, res) => {
  try {
    const myMovieList = res.app.locals.myMovieList;
    const imdbID = req.params.imdbID;
    if (myMovieList.has(imdbID)) {
      res.json(myMovieList.get(imdbID));
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json(err.toString());
  }
})
.patch((req, res) => {
  const imdbID = req.params.imdbID;
  const myMovieList = res.app.locals.myMovieList;
  if (myMovieList.has(imdbID)) {
    const myMovie = myMovieList.get(imdbID);
    const myRating = {
      Source: "MYSELF",
      Value: req.body.Rating
    };
    let setRating = false;
    for (let i = 0; i < myMovie.Ratings.length; i++) {
      const rating = myMovie.Ratings[i];
      if (rating.Source === myRating.Source) {
        myMovie.Ratings[i] = myRating;
        setRating = true;
      }
    }
    if (!setRating) {
      myMovie.Ratings.push(myRating);
    }
    myMovie.Watched = req.body.Watched;
    myMovie.Comments = req.body.Comments;
    myMovieList.set(imdbID, myMovie);
    res.json(myMovie);
  } else {
    res.sendStatus(404);
  }
});

// TODO: write API for adding individual comment.

module.exports = router;
