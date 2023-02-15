const movieGallery = document.querySelector('.gallery__box');
const searchBox = document.querySelector('.search-form__input');
const searchForm = document.querySelector('.search-form');
import Notiflix from 'notiflix';
import { APIKEY, fetchFilms, getFilmDetails, trendingFilms, createfilmGalery, createButtons } from './trendingFilms';
var _ = require('lodash');
const paginationList = document.querySelector('.pagination');
let page = 1;
let totalPages;
let filmsOnPage;

function fetchMovies() {
  let query = searchBox.value;
  if (query == '') {
    trendingFilms();
    return;
  }
  return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&query=${query}&page=${page}`).then(
    response => response.json()
  );
}

function renderGallery(results) {
  if (results.length < 1) {
    Notiflix.Notify.failure('Sorry, no movies found.', { position: 'center-top', cssAnimationStyle: 'zoom' });
    trendingFilms();
    searchBox.value = ' ';
  }

  results.forEach(result => {
    fetch(`https://api.themoviedb.org/3/movie/${result.id}?api_key=${APIKEY}`)
      .then(result => result.json())
      .then(result => {
        genres = result.genres.map(genre => genre.name);
        if (result.genres.length > 2) {
          genres = genres.slice(0, 2).join(', ') + ', Other';
        } else if (result.genres.length < 1) {
          genres = 'Sorry. No genre added yet.';
        } else {
          genres = genres.join(', ');
        }
        let releaseDate = result.release_date.slice(0, 4) || 'Sorry. No release date yet.';
        let title = result.original_title;
        if (title.length > 35) {
          const lastSpaceIndex = title.lastIndexOf(' ', 32);
          title = title.slice(0, lastSpaceIndex) + '...';
        }
        let poster = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
        if (result.poster_path == null) {
          poster =
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png';
        }
        let markup = `<figure class="card" data-id="${result.id}">
<img class="card__image" src="${poster}" alt="${title} movie poster" />
<figcaption class="card__caption">
  <p class="card__title">${title}</p>
  <p class="card__description">${genres} | ${releaseDate}</p>
</figcaption>
</figure>`;
        movieGallery.insertAdjacentHTML('beforeend', markup);
      });
  });
}

function getFilms() {
  movieGallery.innerHTML = ' ';
  fetchMovies()
    .then(json => {
      totalPages = json.total_pages;
      filmsOnPage = json.results;
      createButtons(totalPages, page);
      return json.results;
    })
    .then(results => {
      renderGallery(results);
    });
}

// Listeners

searchForm.addEventListener('submit', event => {
  event.preventDefault();
});

searchBox.addEventListener(
  'input',
  _.debounce(() => {
    getFilms();
  }, 700)
);

// Pagination

const checkBttnSearch = e => {
  const prev = document.querySelector('.pagination__button--arrow-left');
  const next = document.querySelector('.pagination__button--arrow-right');

  if (e.target === prev) {
    page--;
    getFilms();
  }
  if (e.target === next) {
    page++;
    getFilms();
  }
  if (e.target.type === 'button') {
    page = Number(e.target.dataset.page);
    getFilms();
  }
};
paginationList.addEventListener('click', checkBttnSearch);
