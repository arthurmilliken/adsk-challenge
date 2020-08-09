// TODO: move to MovieTile.js

/**
 * render a single Movie Tile
 */
function MovieTile(props) {
  const updateAppState = props.updateAppState;
  const source = props.source;
  const movie = props.movie;
  let poster = movie.Poster;
  if (poster === 'N/A') {
    if (movie.Type === 'series') {
      poster = '/images/icon_series.jpg';
    } else if (movie.Type === 'episode') {
      poster = '/images/icon_episode.jpg';
    } else {
      poster = '/images/icon_movie.jpg';
    }
  }
  const newState = {
    screen: source === 'omdb' ? 'Search Detail' : 'My Movie Detail',
    imdbID: movie.imdbID,
  }
  const label = `${movie.Title} (${movie.Year}) [${movie.Type}]`;
  return (
    <li onClick={updateAppState(newState)}>
      <img title={label}
        src={poster} />
      <br/>{label}
    </li>
  );
}

/**
 * render a collection Movie Tiles
 */
function MovieTiles(props) {
  const source = props.source;
  const movies = props.movies;
  const updateAppState = props.updateAppState;
  if (movies !== null && movies.length === 0) {
    return <h2>no videos found, man!</h2>;
  }
  if (movies === null) {
    return null;
  }
  const movieTiles = movies.map((movie) =>
    <MovieTile
      key={movie.imdbID}
      source={source}
      imdbID={movie.imdbID}
      movie={movie}
      updateAppState={updateAppState}
    />
  );
  return (
    <ul className="movieTiles">{movieTiles}</ul>
  );
}

// TODO: move to MyMovies.js

/**
 * render the My Movies screen
 */
class MyMovies extends React.Component {
  constructor(props) {
    super(props);
    this.updateAppState = props.updateAppState;
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      sort: '',
      watched: false,
      rating: '',
      movies: null,
    }
  }

  handleChange = async (e) => {
    e.preventDefault();
    const target = e.target;
    const name = target.name;
    const value = name === 'watched' ? target.checked : target.value;
    this.setState({
      [name]: value
    });
    // TODO:
    alert('TODO: implement sort/filter myMovieList')
  }

  componentDidMount = async () => {
    const response = await axios.get('/api/myMovieList');
    console.log(response.data);
    this.setState({ movies: response.data });
  }

  render() {
    const state = this.state;
    const movies = state.movies;

    return (
      <div className="myMovies">
        <form>
          sort by:
          <select name="sort"
                  value={state.sort}
                  onChange={this.handleChange}>
            <option value=""></option>
            <option value="title asc">title asc</option>
            <option value="title desc">title desc</option>
            <option value="year asc">year asc</option>
            <option value="year desc">year desc</option>
          </select>&nbsp;&nbsp;
          watched:
          <input
            type="checkbox"
            name="watched"
            checked={state.watched}
            onChange={this.handleChange}
          />&nbsp;&nbsp;
          rating:
          <select name="rating"
                  value={state.rating}
                  onChange={this.handleChange}>
            <option value=""></option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>&nbsp;
        </form>
        <MovieTiles source="myMovieList" movies={movies} updateAppState={this.updateAppState}/>
      </div>
    )
  }
}

// TODO: move to Search.js

/**
 * render the Search screen
 */
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.updateAppState = props.updateAppState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      search: '',
      type: '',
      year: '',
      movies: null,
    }
  }

  handleChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.search.trim() === '') {
      return alert('please enter search criteria');
    }

    const state = this.state;
    console.log('Search.submit():', state);

    const url = '/api/omdb';
    const params = {
      s: this.state.search,
      type: this.state.type,
      y: this.state.year,
    };
    const response = await axios.get(url, { params });
    console.log(response.data);
    const movies = response.data.Response !== 'False' ? response.data.Search : [];
    this.setState({ movies });
  }

  render() {
    const state = this.state;
    const movies = state.movies;

    return (
      <div className="search">
        <form>
          search:
          <input
            type="text"
            name="search"
            value={state.search}
            onChange={this.handleChange}
          />&nbsp;
          type:
          <select
            name="type"
            value={state.type}
            onChange={this.handleChange}
          >
            <option value=""></option>
            <option value="movie">movie</option>
            <option value="series">series</option>
            <option value="episode">episode</option>
          </select>&nbsp;
          year:
          <input
            type="text"
            name="year"
            value={state.year}
            onChange={this.handleChange}
          />&nbsp;&nbsp;
          <a href="#" className="button" onClick={this.handleSubmit}>
            search OMDB &gt;
          </a>
        </form>
        <MovieTiles source="omdb" movies={movies} updateAppState={this.updateAppState}/>
      </div>
    )
  }
}

// TODO: move to MovieDetail.js

/**
 * Render MovieDetail screen
 */
class MovieDetail extends React.Component {
  constructor(props) {
    super(props);
    this.addToMyMovies = this.addToMyMovies.bind(this);
    this.removeFromMyMovies = this.removeFromMyMovies.bind(this);
    this.watchedChanged = this.watchedChanged.bind(this);
    this.addComment = this.addComment.bind(this);
    this.state = {
      source: props.source, // 'omdb' or 'myMovieList'
      imdbID: props.imdbID,
      movie: null,
    }
  }

  componentDidMount = async () => {
    const source = this.state.source;
    const imdbID = this.state.imdbID;
    let url;
    if (source === 'omdb') {
      url = `/api/omdb/${imdbID}`;
    } else {
      url = `/api/myMovieList/${imdbID}`;
    }
    const response = await axios.get(url);
    console.log(response.data);
    this.setState({
      movie: response.data,
    })
  }

  addToMyMovies = async (e) => {
    e.preventDefault();
    console.log('MovieDetail.addToMyMovies()', e.target);
    const imdbID = this.state.imdbID;
    const response = await axios.post('/api/myMovieList', { imdbID });
    // TODO: handle errors.
    this.setState({
      imdbID,
      source: 'myMovieList',
      movie: response.data,
    });
  }

  removeFromMyMovies = async (e) => {
    e.preventDefault();
    console.log('MovieDetail.removeFromMyMovies()', e.target);
    alert('TODO: implement removeFromMyMovies');
  }

  watchedChanged = async (e) => {
    e.preventDefault();
    console.log('MovieDetail.watchedChanged()', e.target);
    alert('TODO: implement watchedChanged');
  }

  addComment = async (e) => {
    e.preventDefault();
    console.log('MovieDetail.addComment()', e.target);
    alert('TODO: implement addComment');
  }

  render() {
    console.log('MovieDetail.render():', this.state);
    const source = this.state.source;
    const imdbID = this.state.imdbID;
    const movie = this.state.movie;
    if (!movie) {
      return (
        <h1>Loading {source}: {imdbID}...</h1>
      );
    } else {
      let poster = movie.Poster;
      if (poster === 'N/A') {
        if (movie.Type === 'series') {
          poster = '/images/icon_series.jpg';
        } else if (movie.Type === 'episode') {
          poster = '/images/icon_episode.jpg';
        } else {
          poster = '/images/icon_movie.jpg';
        }
      }
      const ratings = movie.Ratings.map(r =>
        <li key={r.Source}>{r.Value} ({r.Source})</li>
      );
      const rows = [
        { name: 'Title', value: movie.Title },
        { name: 'Year', value: movie.Year },
        { name: 'Rated', value: movie.Rated },
        { name: 'Released', value: movie.Released },
        { name: 'Runtime', value: movie.Runtime },
        { name: 'Genre', value: movie.Genre },
        { name: 'Director', value: movie.Director },
        { name: 'Writer', value: movie.Writer },
        { name: 'Actors', value: movie.Actors },
        { name: 'Plot', value: movie.Plot },
        { name: 'Language', value: movie.Language },
        { name: 'Country', value: movie.Country },
        { name: 'Awards', value: movie.Awards },
        { name: 'Poster', value: movie.Poster },
        { name: 'Ratings', value: <ul>{ratings}</ul> },
        { name: 'Metascore', value: movie.Metascore },
        { name: 'imdbRating', value: movie.imdbRating },
        { name: 'imdbVotes', value: movie.imdbVotes },
        { name: 'imdbID', value: movie.imdbID },
        { name: 'Type', value: movie.Type },
        { name: 'DVD', value: movie.DVD },
        { name: 'BoxOffice', value: movie.BoxOffice },
        { name: 'Production', value: movie.Production },
        { name: 'Website', value: movie.Website },
      ];
      if (source === 'myMovieList') {
        // movie.Watched
        const watched = (
          <input
            name="watched"
            type="checkbox"
            checked={movie.Watched}
            onChange={this.watchedChanged}
          />
        );
        rows.push({
          name: 'Watched',
          value: watched,
        });
        // movie.Comments
        const comments = movie.Comments.map(c =>
          <li key={c.TimeStamp}>({c.TimeStamp}): {c.Text}</li>
        )
        rows.push({
          name: 'Comments',
          value: (
            <ul>
              {comments}
              <li>
                <input type="text" />&nbsp;&nbsp;
                <a href="#"
                  className="button"
                  onClick={this.addComment}
                >Add Comment</a>
              </li>
            </ul>
          )
        });
      }
      let button;
      if (source === 'omdb') {
        button = (
          <a href="#" className="button" onClick={this.addToMyMovies}>
            Add to My Movies!
          </a>
        );
      } else {
        button = (
          <a href="#" className="buttonRed" onClick={this.removeFromMyMovies}>
            Remove from My Movies!
          </a>
        );
      }
      return (
        <div className="movieDetail">
          <div><img src={poster} /></div>
          <table className="paleBlueRows">
          <tbody>{rows.map(r =>
            <tr key={r.name}>
              <th>{r.name}</th>
              <td>{r.value}</td>
            </tr>
          )}
          </tbody>
          </table>
          {button}
        </div>
      );
    }
  }
}

/**
 * render a single navigation tab.
 */
function AppTab(props) {
  const className = props.active ? 'active': '';
  return <li className={className} onClick={props.onClick}>{props.name}</li>;
}

/**
 * render the main React application.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateState = this.updateState.bind(this);
    this.state = {
      screen: 'Search',
      imdbID: null,
    };
  }

  updateState(newState) {
    return () => this.setState(newState);
  }

  render() {
    const screen = this.state.screen;
    let content;
    if (screen === 'Search') {
      content = <Search updateAppState={this.updateState}/>;
    } else if (screen === 'My Movies') {
      content = <MyMovies updateAppState={this.updateState}/>;
    } else if (screen === 'Search Detail') {
      const imdbID = this.state.imdbID;
      console.log('App.screen:Search Detail:imdbID:', imdbID);
      content = <MovieDetail source="omdb" imdbID={imdbID} />;
    } else if (screen === 'My Movie Detail') {
      const imdbID = this.state.imdbID;
      console.log('App.screen:My Movie Detail:imdbID:', imdbID);
      content = <MovieDetail source="myMovieList" imdbID={imdbID} />;
    } else {
      content = <p>Unknown Screen: {screen}</p>;
    }
    return (
      <div className="App">
        <h1>
          <img className="logo" src="/images/Autodesk_logo_193x32.png" />
          &nbsp;Code Challenge
        </h1>
        <div className="tabbed round">
          <ul>
            <AppTab name="My Movies"
              active={screen === "My Movies"}
              onClick={this.updateState({screen: "My Movies"})} />
            <AppTab name="Search"
              active={screen === "Search"}
              onClick={this.updateState({screen: "Search"})} />
          </ul>
        </div>
        {content}
      </div>
    );
  }
}

const element = <App />;
ReactDOM.render(element, document.getElementById('root'));
