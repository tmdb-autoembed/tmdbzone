// app.js

/*
 * This script powers the Tmovie clone.  It centralizes all API calls to
 * The Movie Database (TMDB) and implements small helpers to render
 * interactive pages such as the home page, movies page, TV shows page,
 * anime page, filter page, watchlist, detail pages, and watch pages.  The
 * goal is to replicate the look and feel of the original Tmovie site in
 * pure HTML, Tailwind CSS and vanilla JavaScript without copying any
 * proprietary assets.  All data comes from the official TMDB API.
 */

// -----------------------------------------------------------------------------
// Configuration constants
// -----------------------------------------------------------------------------
// User‑provided TMDB API key.  If you intend to publish this project you
// should proxy requests through a backend to avoid exposing your key.
const API_KEY = 'fed86956458f19fb45cdd382b6e6de83';
const API_BASE = 'https://api.themoviedb.org/3';
// Base paths for images.  Original gives the highest resolution and w500 a
// reasonable size for posters.
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';

// -----------------------------------------------------------------------------
// Streaming servers
//
// A curated list of third‑party streaming servers.  Each server entry defines
// separate URLs for movies and TV shows.  The placeholders {tmdb_id},
// {imdb_id}, {season} and {episode} will be replaced at runtime in
// initWatchPage based on the content type and query parameters.  Servers of
// type "tmdb" accept a TMDB ID, whereas servers of type "imdb" require an
// IMDb ID.  If the required identifier is unavailable for a given title,
// that server is omitted from the list of playable sources.
const SERVERS = [
  {
    name: 'Vidify',
    type: 'tmdb',
    url: 'https://vidify.top/embed/movie/{tmdb_id}',
    url_tv: 'https://vidify.top/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidJoy',
    type: 'tmdb',
    url: 'https://vidjoy.pro/embed/movie/{tmdb_id}',
    url_tv: 'https://vidjoy.pro/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'Change Server If Not Playing',
    type: 'tmdb',
    url: 'https://autoembed.co/movie/tmdb/{tmdb_id}',
    url_tv: 'https://autoembed.co/tv/tmdb/{tmdb_id}-{season}-{episode}',
  },
  {
    name: '1xbet',
    type: 'imdb',
    url: 'https://dezzu370xol.com/play/{imdb_id}',
    url_tv: 'https://dezzu370xol.com/play/{imdb_id}',
  },
  {
    name: 'vid vip',
    type: 'imdb',
    url: 'https://vidrock.net/movie/{imdb_id}',
    url_tv: 'https://vidrock.net/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'MoviesAPI',
    type: 'tmdb',
    url: 'https://moviesapi.club/movie/{tmdb_id}',
    url_tv: 'https://moviesapi.club/tv/{tmdb_id}-{season}-{episode}',
  },
  // Added VidSrc and BunnyDDL servers as per user request
  {
    name: 'VidSrc',
    type: 'tmdb',
    url: 'https://dl.vidsrc.vip/movie/{tmdb_id}',
    url_tv: 'https://dl.vidsrc.vip/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'BunnyDDL',
    type: 'tmdb',
    url: 'https://bunnyddl.termsandconditionshere.workers.dev/movie/{tmdb_id}',
    url_tv: 'https://bunnyddl.termsandconditionshere.workers.dev/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidSrcVIP',
    type: 'tmdb',
    url: 'https://vidsrc.vip/embed/movie/{tmdb_id}',
    url_tv: 'https://vidsrc.vip/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: '2Embed',
    type: 'tmdb',
    url: 'https://www.2embed.cc/embed/{tmdb_id}',
    url_tv: 'https://www.2embed.cc/embedtv/{tmdb_id}&s={season}&e={episode}',
  },
  {
    name: 'All in one 🔥with download + 4k size',
    type: 'tmdb',
    url: 'https://iframe.pstream.mov/media/tmdb-movie-{tmdb_id}',
    url_tv: 'https://iframe.pstream.mov/media/tmdb-tv-{tmdb_id}-{season}-{episode}',
  },
  {
    name: 'beta',
    type: 'imdb',
    url: 'https://vidsrc.icu/embed/movie/{imdb_id}',
    url_tv: 'https://vidsrc.icu/embed/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'gama',
    type: 'imdb',
    url: 'https://vidsrc.cc/v2/embed/movie/{imdb_id}',
    url_tv: 'https://vidsrc.cc/v2/embed/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'vidme',
    type: 'imdb',
    url: 'https://vidsrc.me/embed/movie/{imdb_id}',
    url_tv: 'https://vidsrc.me/embed/tv/{imdb_id}/{season}/{episode}',
  },
  // Additional direct download servers requested by the user.  These use
  // TMDB identifiers and embed the same streams used for downloads.  They
  // appear in the player dropdown on the watch page.
  {
    name: 'VidSrcDL',
    type: 'tmdb',
    url: 'https://dl.vidsrc.vip/movie/{tmdb_id}',
    url_tv: 'https://dl.vidsrc.vip/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'BunnyDDL',
    type: 'tmdb',
    url: 'https://bunnyddl.termsandconditionshere.workers.dev/movie/{tmdb_id}',
    url_tv: 'https://bunnyddl.termsandconditionshere.workers.dev/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'autoemded pro',
    type: 'imdb',
    url: 'https://autoembed.pro/embed/movie/{imdb_id}',
    url_tv: 'https://autoembed.pro/embed/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'vifast',
    type: 'imdb',
    url: 'https://vidfast.pro/movie/{imdb_id}',
    url_tv: 'https://vidfast.pro/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'High HD',
    type: 'imdb',
    url: 'https://hyhd.org/embed/{imdb_id}',
    url_tv: 'https://hyhd.org/embed/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: '11 movies',
    type: 'imdb',
    url: 'https://111movies.com/movie/{imdb_id}',
    url_tv: 'https://111movies.com/tv/{imdb_id}/{season}/{episode}',
  },
  {
    name: 'MultiEmbed',
    type: 'tmdb',
    url: 'https://multiembed.mov/?video_id={tmdb_id}&tmdb=1',
    url_tv: 'https://multiembed.mov/?video_id={tmdb_id}&tmdb=1&s={season}&e={episode}',
  },
  {
    name: 'EmbedSU',
    type: 'tmdb',
    url: 'https://embed.su/embed/movie/{tmdb_id}',
    url_tv: 'https://embed.su/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'Hexa',
    type: 'tmdb',
    url: 'https://hexa.watch/watch/movie/{tmdb_id}',
    url_tv: 'https://hexa.watch/watch/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidLink',
    type: 'tmdb',
    url: 'https://vidlink.pro/movie/{tmdb_id}',
    url_tv: 'https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidSrcXyz',
    type: 'tmdb',
    url: 'https://vidsrc.xyz/embed/movie/{tmdb_id}',
    url_tv: 'https://vidsrc.xyz/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidSrcSU',
    type: 'tmdb',
    url: 'https://vidsrc.su/embed/movie/{tmdb_id}',
    url_tv: 'https://vidsrc.su/embed/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: '123Embed',
    type: 'tmdb',
    url: 'https://play2.123embed.net/movie/{tmdb_id}',
    url_tv: 'https://play2.123embed.net/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'RiveStream',
    type: 'tmdb',
    url: 'https://rivestream.org/embed?type=movie&id={tmdb_id}',
    url_tv: 'https://rivestream.org/embed?type=tv&id={tmdb_id}&season={season}&episode={episode}',
  },
  {
    name: 'Vidora',
    type: 'tmdb',
    url: 'https://vidora.su/movie/{tmdb_id}',
    url_tv: 'https://vidora.su/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'StreamFlix',
    type: 'tmdb',
    url: 'https://watch.streamflix.one/movie/{tmdb_id}/watch?server=1',
    url_tv: 'https://watch.streamflix.one/tv/{tmdb_id}/watch?server=1&season={season}&episode={episode}',
  },
  {
    name: 'UEmbed (premium)',
    type: 'tmdb',
    url: 'https://uembed.site/?id={tmdb_id}&apikey=thisisforsurenotapremiumkey_right?',
    url_tv: 'https://uembed.site/?id={tmdb_id}&season={season}&episode={episode}&apikey=thisisforsurenotapremiumkey_right?',
  },

  // Added additional servers for direct downloads/streams.  These endpoints
  // support both movies and TV episodes.  If a server only supports one
  // content type it will be skipped when constructing the sources list.
  {
    name: 'BunnyDDL',
    type: 'tmdb',
    // BunnyDDL exposes endpoints for movies and TV via a Cloudflare worker.
    url: 'https://bunnyddl.termsandconditionshere.workers.dev/movie/{tmdb_id}',
    url_tv: 'https://bunnyddl.termsandconditionshere.workers.dev/tv/{tmdb_id}/{season}/{episode}',
  },
  {
    name: 'VidSrcDL',
    type: 'tmdb',
    // VidSrc provides downloadable streams for both movies and TV.  The
    // endpoints mirror the embed servers but point to dl subdomain.
    url: 'https://dl.vidsrc.vip/movie/{tmdb_id}',
    url_tv: 'https://dl.vidsrc.vip/tv/{tmdb_id}/{season}/{episode}',
  },
];

// -----------------------------------------------------------------------------
// List of streaming platforms (for browsing by platform)
// -----------------------------------------------------------------------------
// These are well‑known streaming services displayed on the home page.  We
// include only the name for each platform; a logo could be added later.

// -----------------------------------------------------------------------------
// Helper functions for API requests

// Retrieve the user selected language from localStorage.  Defaults to 'en-US'
function getLanguage() {
  try {
    return localStorage.getItem('tmdbLang') || 'hi';
  } catch {
    return 'en-US';
  }
}
// -----------------------------------------------------------------------------

/**
 * Simple JSON fetch wrapper that handles HTTP errors.
 *
 * @param {string} url The absolute URL to request.
 * @returns {Promise<any>} Parsed JSON from the response.
 */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch trending content from TMDB.
 *
 * @param {string} type 'movie' or 'tv'
 * @param {string} timeWindow 'day' or 'week'
 */
async function getTrending(type = 'movie', timeWindow = 'week') {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/trending/${type}/${timeWindow}?api_key=${API_KEY}&language=${lang}`
  ).then((data) => data.results || []);
}

/**
 * Fetch popular content from TMDB.
 *
 * @param {string} type 'movie' or 'tv'
 */
async function getPopular(type = 'movie', page = 1) {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/${type}/popular?api_key=${API_KEY}&language=${lang}&page=${page}`
  ).then((data) => data.results || []);
}

/**
 * Fetch top rated content from TMDB.
 *
 * @param {string} type 'movie' or 'tv'
 */
async function getTopRated(type = 'movie', page = 1) {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/${type}/top_rated?api_key=${API_KEY}&language=${lang}&page=${page}`
  ).then((data) => data.results || []);
}

/**
 * Fetch a list of genres for a specific content type.  Note that TMDB
 * separates movie and TV genres.
 *
 * @param {string} type 'movie' or 'tv'
 */
async function getGenres(type = 'movie') {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/genre/${type}/list?api_key=${API_KEY}&language=${lang}`
  ).then((data) => data.genres || []);
}

/**
 * Discover content based on arbitrary query parameters.  This function
 * constructs the query string from an object of parameters.
 *
 * @param {string} type 'movie' or 'tv'
 * @param {Object} params Key/value pairs to include in the query string.
 */
async function discoverContent(type = 'movie', params = {}, page = 1) {
  const lang = getLanguage();
  // Merge the page parameter with any provided params
  const query = new URLSearchParams({ api_key: API_KEY, language: lang, page, ...params });
  return fetchJSON(`${API_BASE}/discover/${type}?${query}`)
    .then((data) => data.results || []);
}

/**
 * Search across movies and TV shows.  Returns a mixed array of results with
 * varying media types.  TMDB’s search/multi endpoint can return movies,
 * TV shows and persons; we filter out persons for this demo.
 *
 * @param {string} query Search keyword
 */
async function searchMulti(query) {
  const q = encodeURIComponent(query);
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/search/multi?api_key=${API_KEY}&language=${lang}&query=${q}&page=1&include_adult=false`
  ).then((data) => (data.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv'));
}

/**
 * Fetch detailed information for a movie or TV show.  The function can also
 * append videos and similar results to the response.
 *
 * @param {string} type 'movie' or 'tv'
 * @param {number|string} id The TMDB ID of the content
 */
async function getDetails(type, id) {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/${type}/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=videos,images,external_ids,credits`
  );
}

/**
 * Fetch videos (trailers, clips, teasers) for a given movie or TV show.
 *
 * @param {string} type 'movie' or 'tv'
 * @param {number|string} id The TMDB ID of the content
 */
async function getVideos(type, id) {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/${type}/${id}/videos?api_key=${API_KEY}&language=${lang}`
  ).then((data) => data.results || []);
}

/**
 * Fetch a list of episodes for a specific TV season.  TMDB exposes
 * season details via `/tv/{series_id}/season/{season_number}`.  This
 * helper returns the parsed JSON containing an `episodes` array.  The
 * language is derived from the current selection.
 *
 * @param {number|string} tvId The TMDB ID of the TV show
 * @param {number|string} seasonNumber The season number (1‑based)
 * @returns {Promise<any>} Season detail with episodes
 */
async function getSeasonEpisodes(tvId, seasonNumber) {
  const lang = getLanguage();
  return fetchJSON(
    `${API_BASE}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=${lang}`
  );
}

/**
 * Render season tabs and episode cards for the watch page.  For a given
 * TV show ID, this function fetches the show details (to determine
 * available seasons) and the selected season's episodes.  It then
 * populates the season tabs container and the episode grid.  When a
 * season or episode is clicked the page reloads with updated query
 * parameters.
 *
 * @param {HTMLElement} tabsContainer Element to contain season buttons
 * @param {HTMLElement} episodesContainer Element to contain episodes grid
 * @param {number|string} tvId TMDB ID of the TV show
 * @param {number|string} currentSeason Currently selected season number
 */
async function renderSeasonEpisodeGrid(tabsContainer, episodesContainer, tvId, currentSeason = '1') {
  try {
    // Fetch details to obtain list of seasons
    const details = await getDetails('tv', tvId);
    const seasons = details.seasons || [];
    tabsContainer.innerHTML = '';
    // Build season buttons
    seasons.forEach((season) => {
      const btn = document.createElement('button');
      btn.textContent = season.name || `Season ${season.season_number}`;
      btn.className = 'px-3 py-1 rounded-full border border-gray-600 text-sm whitespace-nowrap';
      // Highlight the active season
      if (String(season.season_number) === String(currentSeason)) {
        btn.classList.add('bg-red-600', 'text-white');
      } else {
        btn.classList.add('bg-gray-800', 'text-gray-300', 'hover:bg-gray-700');
      }
      btn.onclick = () => {
        // Reload page with selected season (default to episode 1)
        window.location.href = `watch.html?type=tv&id=${tvId}&season=${season.season_number}&episode=1`;
      };
      tabsContainer.appendChild(btn);
    });
    // Fetch episodes for the current season
    const seasonNum = currentSeason || seasons[0]?.season_number || 1;
    const seasonData = await getSeasonEpisodes(tvId, seasonNum);
    const episodes = seasonData.episodes || [];
    episodesContainer.innerHTML = '';
    // Determine currently selected episode from URL
    const queryParams = new URLSearchParams(window.location.search);
    const currentEpisode = queryParams.get('episode') || '1';
    episodes.forEach((ep) => {
      const isActive = String(ep.episode_number) === String(currentEpisode);
      const card = createElement(`
        <div class="cursor-pointer group relative ${isActive ? 'border-2 border-red-600 rounded-lg' : ''}">
          <div class="h-32 bg-gray-800 rounded-lg overflow-hidden">
            ${ep.still_path
              ? `<img src="${IMG_W500 + ep.still_path}" alt="${ep.name}" class="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />`
              : '<div class="w-full h-full bg-gray-700"></div>'}
          </div>
          <p class="mt-1 text-xs truncate ${isActive ? 'text-red-400' : 'text-gray-200'}">${ep.episode_number}. ${ep.name}</p>
        </div>
      `);
      card.onclick = () => {
        window.location.href = `watch.html?type=tv&id=${tvId}&season=${seasonNum}&episode=${ep.episode_number}`;
      };
      episodesContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------------------------------------------------------
// Watchlist management using localStorage
// -----------------------------------------------------------------------------

/**
 * Retrieve the watchlist array from localStorage.  If no watchlist exists
 * returns an empty array.
 *
 * @returns {Array} Array of watchlist entries {id, type, title, poster}
 */
function getWatchlist() {
  try {
    const raw = localStorage.getItem('watchlist');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse watchlist', err);
    return [];
  }
}

/**
 * Persist the watchlist array to localStorage.
 *
 * @param {Array} list Array of watchlist entries
 */
function setWatchlist(list) {
  localStorage.setItem('watchlist', JSON.stringify(list));
}

/**
 * Add a new entry to the watchlist.  Duplicate entries are ignored based
 * on ID and type.
 *
 * @param {Object} item Item to add {id, type, title, poster}
 */
function addToWatchlist(item) {
  const list = getWatchlist();
  const exists = list.some((entry) => entry.id === item.id && entry.type === item.type);
  if (!exists) {
    list.push(item);
    setWatchlist(list);
  }
}

/**
 * Remove an entry from the watchlist by ID and type.
 *
 * @param {number|string} id
 * @param {string} type
 */
function removeFromWatchlist(id, type) {
  const list = getWatchlist().filter((entry) => !(entry.id == id && entry.type === type));
  setWatchlist(list);
}

/**
 * Determine if an item is in the watchlist.
 *
 * @param {number|string} id
 * @param {string} type
 */
function isInWatchlist(id, type) {
  return getWatchlist().some((entry) => entry.id == id && entry.type === type);
}

// -----------------------------------------------------------------------------
// Theme toggling
// -----------------------------------------------------------------------------

/**
 * Enable dark/light theme switching.  The dark theme is default.  Toggling
 * swaps background and text colors on the body and updates the theme icon.
 */
function setupThemeToggle() {
  const themeToggleButton = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  if (!themeToggleButton || !themeIcon) return;
  themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('bg-black');
    document.body.classList.toggle('text-white');
    document.body.classList.toggle('bg-white');
    document.body.classList.toggle('text-black');
    const isDark = document.body.classList.contains('bg-black');
    if (isDark) {
      // Show sun icon
      themeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.657-9.657h-1M4.343 12.343h-1m12.02 5.657l-.707-.707M6.343 6.343l-.707-.707m12.02 12.02l-.707-.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      `;
    } else {
      // Show moon icon
      themeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
      `;
    }
  });
}

/**
 * Initialize the language selector.  Reads the saved language from
 * localStorage and updates the select element.  When the user changes
 * language, the value is stored and the page reloads to fetch new
 * localized data.
 */
function setupLanguageSelector() {
  const select = document.getElementById('langSelect');
  if (!select) return;
  const saved = getLanguage();
  // Set current value
  if ([...select.options].some((opt) => opt.value === saved)) {
    select.value = saved;
  }
  select.onchange = () => {
    const value = select.value;
    try {
      localStorage.setItem('tmdbLang', value);
    } catch {}
    // Reload the page to apply language changes
    location.reload();
  };
}

/**
 * Initialize the mobile navigation menu.  On small screens the main nav
 * links are hidden and a hamburger button is shown instead.  Clicking the
 * button toggles the visibility of the mobile menu.  Selecting any link
 * within the mobile menu collapses it.
 */
function setupMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
  // Hide menu when a navigation link inside it is clicked
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });

  // Sync mobile theme toggle with main theme toggle.  When the user
  // taps the mobile theme button it triggers the primary theme button to
  // ensure consistent behaviour and icon updates.
  const mobileThemeBtn = document.getElementById('mobileThemeToggle');
  const mainThemeBtn = document.getElementById('themeToggle');
  if (mobileThemeBtn && mainThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
      mainThemeBtn.click();
    });
  }
}

/**
 * Highlight the active link in the mobile bottom navigation bar.  Uses the
 * data-page attribute on the body and compares it to the data-page
 * attribute on each nav link.  Applies a red text colour to the active
 * page and removes it from others.
 */
function setupBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const page = document.body.dataset.page;
  nav.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('text-red-500');
    } else {
      link.classList.remove('text-red-500');
    }
  });
}

// -----------------------------------------------------------------------------
// Utility functions for rendering HTML
// -----------------------------------------------------------------------------

/**
 * Create an element from an HTML string.  This helper makes it convenient
 * to build markup within template literals.
 *
 * @param {string} htmlString
 * @returns {HTMLElement}
 */
function createElement(htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild;
}

/**
 * Render a card representing a movie or TV show.  Each card exposes a
 * watchlist button and a click handler to navigate to the details page.
 *
 * @param {Object} item The movie/TV object from TMDB
 * @param {string} type 'movie' or 'tv'
 * @returns {HTMLElement}
 */
function renderCard(item, type) {
  const id = item.id;
  const title = item.title || item.name || 'Unknown';
  const year = item.release_date
    ? item.release_date.slice(0, 4)
    : item.first_air_date
    ? item.first_air_date.slice(0, 4)
    : '';
  const posterPath = item.poster_path || item.backdrop_path;
  const imgSrc = posterPath ? IMG_W500 + posterPath : '';
  // Compute vote average for rating badge
  const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : null;

  // Determine if this item is already in the watchlist
  const inList = isInWatchlist(id, type);

  // Determine runtime to display.  Similar to horizontal cards, movies may
  // expose a `runtime` property and TV shows may include an array of
  // episode run times.  We pick the first available value when present.
  const runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]);
  const runtimeMarkup = runtime
    ? `<div class="flex items-center space-x-1 text-xs text-gray-300 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg><span>${runtime}m</span></div>`
    : '';

  // Build card markup.  The card now includes a circular rating ring and improved styling
  const el = createElement(`
    <div class="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-105 bg-gray-900">
      <img src="${imgSrc}" alt="${title}" class="w-full h-72 object-cover rounded-lg" />
      ${voteAvg ? renderRatingRing(voteAvg) : ''}
      <button class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-2 flex items-center justify-center watchlist-btn"
        title="${inList ? 'Remove' : 'Add '}"
        data-id="${id}" data-type="${type}" data-title="${title}" data-poster="${posterPath || ''}">
        ${inList
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c0 0 0 0 -0.76 -1c-0.88 -1.16 -2.18 -2 -3.74 -2c-2.49 0 -4.5 2.01 -4.5 4.5c0 0.93 0.28 1.79 0.76 2.5c0.81 1.21 8.24 9 8.24 9M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0"/></path></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>'}
      </button>
      <div class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 class="text-base font-semibold mb-1 text-white truncate">${title}</h3>
        <p class="text-sm text-gray-300">${year}</p>
        ${runtimeMarkup}
      </div>
    </div>
  `);

  // Navigate to details page when clicking the card (excluding watchlist button)
  el.addEventListener('click', (e) => {
    if (e.target.closest('.watchlist-btn')) return; // ignore clicks on watchlist button
    window.location.href = `details.html?type=${type}&id=${id}`;
  });

  return el;
}

/**
 * Render a grid of cards into a specified container.  Clears any existing
 * children before appending new cards.
 *
 * @param {HTMLElement} container
 * @param {Array} items List of movie/TV objects
 * @param {string} type 'movie' or 'tv'
 */
function renderGrid(container, items, type) {
  container.innerHTML = '';
  items.forEach((item) => {
    const card = renderCard(item, type);
    container.appendChild(card);
  });
  // After cards are added, attach watchlist event handlers
  attachWatchlistHandlers(container);
}

/**
 * Render a horizontal card for use in slider/row layouts.  These cards are
 * wider and shorter than the standard grid cards and include a rating badge
 * and watchlist button.  Clicking the card navigates to the details page.
 *
 * @param {Object} item The movie/TV object from TMDB
 * @param {string} type 'movie' or 'tv'
 * @returns {HTMLElement}
 */
function renderHorizontalCard(item, type) {
  const id = item.id;
  const title = item.title || item.name || 'Unknown';
  const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : null;
  const posterPath = item.backdrop_path || item.poster_path;
  const imgSrc = posterPath ? IMG_W500 + posterPath : '';
  const inList = isInWatchlist(id, type);
  // Determine runtime and build markup for it.  Movies may expose a
  // `runtime` property, while TV shows can include an array of
  // episode runtimes.  We take the first entry when available.
  const runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]);
  const runtimeMarkup = runtime
    ? `<div class="flex items-center space-x-1 text-xs text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg><span>${runtime}m</span></div>`
    : '';
  const el = createElement(`
    <div class="relative flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 cursor-pointer group">
      <img src="${imgSrc}" alt="${title}" class="w-full h-40 sm:h-44 md:h-48 lg:h-52 object-cover rounded-lg" />
      ${voteAvg ? renderRatingRing(voteAvg) : ''}
      <button class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-2 flex items-center justify-center watchlist-btn"
        title="${inList ? 'Remove' : 'Add'}"
        data-id="${id}" data-type="${type}" data-title="${title}" data-poster="${posterPath || ''}">
        ${inList
          ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4.75C3 3.784 3.784 3 4.75 3h10.5C16.216 3 17 3.784 17 4.75v10.5c0 .966-.784 1.75-1.75 1.75H4.75A1.75 1.75 0 013 15.25V4.75zm4.47 3.22a.75.75 0 011.06 0L10 9.439l1.47-1.47a.75.75 0 111.06 1.061L11.061 10.5l1.47 1.47a.75.75 0 11-1.061 1.06L10 11.561l-1.47 1.47a.75.75 0 11-1.061-1.06l1.47-1.47-1.47-1.47a.75.75 0 010-1.061z" clip-rule="evenodd" /></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>'}
      </button>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <div class="flex flex-col space-y-1 pr-2">
          <span class="text-white text-sm font-semibold truncate">${title}</span>
          ${runtimeMarkup}
        </div>
      </div>
    </div>
  `);
  // Navigate to details on click (except watchlist button)
  el.addEventListener('click', (e) => {
    if (e.target.closest('.watchlist-btn')) return;
    window.location.href = `details.html?type=${type}&id=${id}`;
  });
  return el;
}

/**
 * Render a horizontal row of cards into a container.  Clears existing
 * children and appends each horizontal card.  Also attaches watchlist
 * handlers afterwards.
 *
 * @param {HTMLElement} container
 * @param {Array} items Array of movie/TV items
 * @param {string} type 'movie' or 'tv'
 */
function renderHorizontalRow(container, items, type) {
  container.innerHTML = '';
  items.forEach((item) => {
    const card = renderHorizontalCard(item, type);
    container.appendChild(card);
  });
  attachWatchlistHandlers(container);
}

/**
 * Render a horizontal slider of streaming platforms.  Each platform is
 * displayed as a simple card with its name.  The container should have
 * overflow-x-auto styling to enable horizontal scrolling.
 *
 * @param {HTMLElement} container
 */
function renderPlatformSlider(container) {
  if (!container) return;
  container.innerHTML = '';

  PLATFORMS.forEach(platform => {
    const card = document.createElement('div'); // div hi rakho
    card.className =
      'flex-shrink-0 w-36 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-sm font-semibold mr-4 cursor-pointer hover:bg-gray-700 transition';

    card.textContent = platform.name; // ✅ Sirf name show hoga

    card.onclick = () => {
      location.href =
        `platform.html?provider=${platform.id}&name=${encodeURIComponent(platform.name)}`;
    };

    container.appendChild(card);
  });
}
/**
 * Append additional cards to an existing grid container without clearing
 * previous content.  Useful for infinite scrolling where new pages of
 * results should be appended to existing ones.
 *
 * @param {HTMLElement} container
 * @param {Array} items Array of movie/TV items
 * @param {string} type 'movie' or 'tv'
 */
function appendGrid(container, items, type) {
  items.forEach((item) => {
    const card = renderCard(item, type);
    container.appendChild(card);
  });
  attachWatchlistHandlers(container);
}

/**
 * Show skeleton placeholders inside a container.  Depending on orientation,
 * skeletons are rendered horizontally or vertically.  Use Tailwind's
 * animate-pulse for shimmer effect.
 *
 * @param {HTMLElement} container
 * @param {number} count Number of skeleton placeholders
 * @param {string} orientation 'horizontal' or 'vertical'
 */
function showSkeletons(container, count, orientation = 'vertical') {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    if (orientation === 'horizontal') {
      skeleton.className = 'flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 h-40 sm:h-44 md:h-48 lg:h-52 bg-gray-800 animate-pulse rounded-lg mr-4';
    } else {
      skeleton.className = 'w-full h-72 bg-gray-800 animate-pulse rounded-lg mb-4';
    }
    container.appendChild(skeleton);
  }
}

/**
 * Render a cast slider for the details page.  Displays actor profile
 * pictures, names and characters in a horizontal scrollable row.  Each
 * actor links to a dedicated person page.
 *
 * @param {HTMLElement} container The container element to fill
 * @param {Array} cast Array of cast objects with id, name, character, profile_path
 */
function renderCastSlider(container, cast) {
  if (!container) return;
  container.innerHTML = '';
  // Limit to first 20 cast members for performance
  cast.slice(0, 20).forEach((actor) => {
    const id = actor.id;
    const name = actor.name;
    const character = actor.character;
    const imgSrc = actor.profile_path ? IMG_W500 + actor.profile_path : '';
    const card = createElement(`
      <a href="person.html?id=${id}" class="flex-shrink-0 w-24 mr-4 text-center">
        <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-700 mb-1">
          ${imgSrc ? `<img src="${imgSrc}" alt="${name}" class="w-full h-full object-cover" />` : '<div class="w-full h-full bg-gray-600"></div>'}
        </div>
        <span class="block text-xs font-medium truncate">${name}</span>
        <span class="block text-xs text-gray-400 truncate">${character || ''}</span>
      </a>
    `);
    container.appendChild(card);
  });
}

/**
 * Show loading skeleton for the details page.  Displays placeholder
 * elements for the title, info, description, cast and recommendations.
 */
function showDetailsSkeleton() {
  const titleEl = document.getElementById('details-title');
  const infoEl = document.getElementById('details-info');
  const descEl = document.getElementById('details-description');
  const genresEl = document.getElementById('details-genres');
  const recContainer = document.getElementById('details-recommendations');
  const castContainer = document.getElementById('details-cast');
  if (titleEl) {
    titleEl.innerHTML = '<div class="h-8 bg-gray-800 animate-pulse rounded w-2/3"></div>';
  }
  if (infoEl) {
    infoEl.innerHTML = '<div class="h-4 bg-gray-800 animate-pulse rounded w-1/3"></div>';
  }
  if (descEl) {
    descEl.innerHTML = '<div class="space-y-2">' +
      '<div class="h-3 bg-gray-800 animate-pulse rounded w-full"></div>' +
      '<div class="h-3 bg-gray-800 animate-pulse rounded w-5/6"></div>' +
      '<div class="h-3 bg-gray-800 animate-pulse rounded w-4/6"></div>' +
      '</div>';
  }
  if (genresEl) {
    genresEl.innerHTML = '<div class="h-6 bg-gray-800 animate-pulse rounded w-40 mb-2"></div>';
  }
  if (recContainer) {
    showSkeletons(recContainer, 6);
  }
  if (castContainer) {
    // show 6 circular skeletons
    castContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'flex-shrink-0 w-24 mr-4 text-center';
      skeleton.innerHTML = '<div class="w-24 h-24 rounded-full bg-gray-800 animate-pulse mb-1"></div>' +
        '<div class="h-3 bg-gray-800 animate-pulse rounded w-20 mx-auto mb-1"></div>' +
        '<div class="h-3 bg-gray-800 animate-pulse rounded w-16 mx-auto"></div>';
      castContainer.appendChild(skeleton);
    }
  }
}

/**
 * Determine a color for the rating ring based on the vote average.  Higher
 * ratings are green, moderate are yellow/orange, low are red.
 *
 * @param {number|string} voteAvg Rating between 0 and 10
 * @returns {string} Tailwind color class or CSS color string
 */
function getRatingColor(voteAvg) {
  const v = parseFloat(voteAvg);
  if (isNaN(v)) return '#4ade80'; // default green
  if (v >= 8) return '#22c55e'; // green
  if (v >= 7) return '#a3e635'; // lime
  if (v >= 5) return '#eab308'; // yellow
  return '#ef4444'; // red
}

/**
 * Render a circular rating ring.  Uses a conic gradient to indicate the
 * rating percentage.  The inner span displays the numeric rating.
 *
 * @param {string} voteAvg Rating string (e.g. '7.5')
 * @returns {string} HTML markup for the ring
 */
function renderRatingRing(voteAvg) {
  const v = parseFloat(voteAvg);
  const deg = Math.min(Math.max(v / 10, 0), 1) * 360;
  const color = getRatingColor(voteAvg);
  // Render a larger rating ring that sits in the top left corner of the card.
  // The ring uses a conic‑gradient to indicate the percentage of the rating
  // and the numeric value is centered within the circle.  We enlarge the
  // circle (12×12) and bump the font size up to improve legibility on
  // mobile, mirroring the design shown in the provided screenshots.
  return `
    <div class="absolute top-2 left-2 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
      style="border: 2px solid ${color}; color: ${color};">
      <span>${voteAvg}</span>
    </div>
  `;
}

/**
 * Attach click handlers on watchlist buttons within a given parent element.
 * This function uses event delegation so that it can be called after cards
 * are rendered.
 *
 * @param {HTMLElement} parent
 */
function attachWatchlistHandlers(parent) {
  parent.querySelectorAll('.watchlist-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      const title = btn.dataset.title;
      const poster = btn.dataset.poster;
      const item = { id, type, title, poster };
      if (isInWatchlist(id, type)) {
        removeFromWatchlist(id, type);
        // Switch icon to plus
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>';
        btn.title = 'Add';
      } else {
        addToWatchlist(item);
        // Switch icon to remove (X)
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4.75C3 3.784 3.784 3 4.75 3h10.5C16.216 3 17 3.784 17 4.75v10.5c0 .966-.784 1.75-1.75 1.75H4.75A1.75 1.75 0 013 15.25V4.75zm4.47 3.22a.75.75 0 011.06 0L10 9.439l1.47-1.47a.75.75 0 111.06 1.061L11.061 10.5l1.47 1.47a.75.75 0 11-1.061 1.06L10 11.561l-1.47 1.47a.75.75 0 11-1.061-1.06l1.47-1.47-1.47-1.47a.75.75 0 010-1.061z" clip-rule="evenodd" /></svg>';
        btn.title = 'Remove';
      }
    });
  });
}

/**
 * Populate the hero section of a page.  Accepts a container element and a
 * single movie/TV item.  Adds watchlist functionality to the hero as well.
 *
 * @param {HTMLElement} hero Elment containing hero markup
 * @param {Object} item Movie/TV item
 * @param {string} type 'movie' or 'tv'
 */
function renderHero(hero, item, type) {
  const title = item.title || item.name || 'Unknown';
  const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const year = item.release_date
    ? item.release_date.slice(0, 4)
    : item.first_air_date
    ? item.first_air_date.slice(0, 4)
    : '';
  const backdropPath = item.backdrop_path || item.poster_path;
  const backdropUrl = backdropPath ? IMG_ORIGINAL + backdropPath : '';
  const inList = isInWatchlist(item.id, type);

  hero.style.backgroundImage = `url(${backdropUrl})`;
  hero.querySelector('.hero-title').textContent = title;
  hero.querySelector('.hero-info').innerHTML = `
    <span class="inline-flex items-center">
      <svg class="h-4 w-4 mr-1 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.951a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.951c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.785.57-1.84-.197-1.54-1.118l1.286-3.951a1 1 0 00-.364-1.118L2.074 9.378c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.951z" />
      </svg>
      ${voteAvg}
    </span>
    <span>${year}</span>
    <span class="text-green-400">85% match</span>
  `;
  // Add event listeners to watch, info and add buttons
  const watchBtn = hero.querySelector('.hero-watch-btn');
  const infoBtn = hero.querySelector('.hero-info-btn');
  const addBtn = hero.querySelector('.hero-add-btn');
  // Set watch now link
  watchBtn.onclick = () => {
    // Navigate to watch page
    window.location.href = `watch.html?type=${type}&id=${item.id}`;
  };
  // Info button navigates to details page
  if (infoBtn) {
    infoBtn.onclick = () => {
      window.location.href = `details.html?type=${type}&id=${item.id}`;
    };
  }
  // Configure add/remove watchlist button state
  addBtn.innerHTML = inList
    ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg><span>Remove</span>'
    : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg><span>Add</span>';
  addBtn.onclick = () => {
    const itemData = {
      id: item.id,
      type,
      title,
      poster: item.poster_path || '',
    };
    if (isInWatchlist(item.id, type)) {
      removeFromWatchlist(item.id, type);
      addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg><span>Add</span>';
    } else {
      addToWatchlist(itemData);
      addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg><span>Remove</span>';
    }
  };
}

// -----------------------------------------------------------------------------
// Page initializers
// -----------------------------------------------------------------------------

/**
 * Initialize the home page: load a slider for trending movies and trending tv,
 * plus additional sections for trending movies and TV shows.  A simple
 * carousel indicator is rendered beneath the hero.
 */
async function initHomePage() {
  // Hero slider container and indicator
  const hero = document.getElementById('hero');
  const indicator = document.getElementById('hero-indicator');
  const movieGrid = document.getElementById('home-trending-movies');
  const tvGrid = document.getElementById('home-trending-tv');

  // Show skeletons for trending rows while loading
  showSkeletons(movieGrid, 5, 'horizontal');
  showSkeletons(tvGrid, 5, 'horizontal');
  // Fetch trending movies and TV shows
  const [movies, tvShows] = await Promise.all([
    getTrending('movie'),
    getTrending('tv'),
  ]);

  // Set up hero slider: we'll display first 5 movies and rotate every 6s
  const slides = movies.slice(0, 5);
  let currentSlide = 0;
  function renderSlide(index) {
    const item = slides[index];
    renderHero(hero, item, 'movie');
    // update indicator
    indicator.querySelectorAll('span').forEach((dot, idx) => {
      dot.classList.toggle('bg-gray-300', idx === index);
      dot.classList.toggle('bg-gray-600', idx !== index);
    });
  }
  // Build indicator dots
  indicator.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.className = 'h-2 w-2 rounded-full mx-1 bg-gray-600 inline-block cursor-pointer';
    dot.onclick = () => {
      currentSlide = idx;
      renderSlide(currentSlide);
    };
    indicator.appendChild(dot);
  });
  // Initial render
  renderSlide(0);
  // Auto rotate
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide(currentSlide);
  }, 6000);

  // Render trending movie and TV rows (horizontal)
  renderHorizontalRow(movieGrid, movies.slice(0, 10), 'movie');
  renderHorizontalRow(tvGrid, tvShows.slice(0, 10), 'tv');

  // Render platform slider if the container exists
  const platformContainer = document.getElementById('home-platforms');
  if (platformContainer) {
    renderPlatformSlider(platformContainer);
  }
  // Initialize discover section with filters and infinite scroll if present
  const discoverResults = document.getElementById('home-discover-results');
  if (discoverResults) {
    initHomeDiscover();
  }
}

/**
 * Initialize the discover section on the home page.  Populates filter
 * dropdowns for year, genre, language and sort.  Handles infinite
 * scrolling to fetch additional pages from the TMDB discover endpoint.
 */
async function initHomeDiscover() {
  const yearSelect = document.getElementById('discover-year');
  const genreSelect = document.getElementById('discover-genre');
  const langSelect = document.getElementById('discover-language');
  const sortSelect = document.getElementById('discover-sort');
  const resultsContainer = document.getElementById('home-discover-results');
  if (!yearSelect || !genreSelect || !langSelect || !sortSelect || !resultsContainer) {
    return;
  }
  // Populate years (current year down to 1980)
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '<option value="">Year</option>';
  for (let y = currentYear; y >= 1980; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  // Populate genres
  const movieGenres = await getGenres('movie');
  genreSelect.innerHTML = '<option value="">Genre</option>';
  movieGenres.forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    genreSelect.appendChild(opt);
  });
  // Populate languages (ISO codes).  This list covers a few common languages.
  const languages = [
    { code: '', name: 'Language' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ja', name: 'Japanese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'de', name: 'German' },
  ];
  langSelect.innerHTML = '';
  languages.forEach((lang) => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.name;
    langSelect.appendChild(opt);
  });
  // Populate sort options
  const sorts = [
    { value: '', name: 'Sort' },
    { value: 'popularity.desc', name: 'Popularity' },
    { value: 'vote_average.desc', name: 'Rating' },
    { value: 'primary_release_date.desc', name: 'Release Date' },
  ];
  sortSelect.innerHTML = '';
  sorts.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.name;
    sortSelect.appendChild(opt);
  });
  // State for infinite scroll
  let page = 1;
  let loading = false;
  let noMore = false;
  let params = {};
  // Helper to construct params from selects
  function updateParams() {
    params = {};
    const year = yearSelect.value;
    const genre = genreSelect.value;
    const lang = langSelect.value;
    const sort = sortSelect.value;
    if (year) {
      // Use primary_release_year to filter movies by release year
      params.primary_release_year = year;
    }
    if (genre) params.with_genres = genre;
    if (lang) params.with_original_language = lang;
    if (sort) params.sort_by = sort;
  }
  // Load the next page of results
  async function loadNext() {
    if (loading || noMore) return;
    loading = true;
    try {
      // Show skeletons only when loading the first page
      if (page === 1) {
        showSkeletons(resultsContainer, 8);
      }
      const lang = getLanguage();
      const query = new URLSearchParams({ api_key: API_KEY, language: lang, page, ...params });
      const data = await fetchJSON(`${API_BASE}/discover/movie?${query}`);
      const results = data.results || [];
      if (page === 1) {
        resultsContainer.innerHTML = '';
      }
      appendGrid(resultsContainer, results, 'movie');
      // Determine if there are more pages
      if (data.total_pages && page >= data.total_pages) {
        noMore = true;
      } else {
        page++;
      }
    } catch (err) {
      console.error(err);
    }
    loading = false;
  }
  // Event handler for filter changes
  function onFilterChange() {
    updateParams();
    page = 1;
    noMore = false;
    loadNext();
  }
  yearSelect.onchange = onFilterChange;
  genreSelect.onchange = onFilterChange;
  langSelect.onchange = onFilterChange;
  sortSelect.onchange = onFilterChange;
  // Initial params and load
  updateParams();
  loadNext();
  // Infinite scroll handler
  window.addEventListener('scroll', () => {
    if (loading || noMore) return;
    const scrollPos = window.scrollY + window.innerHeight;
    const threshold = document.body.scrollHeight - 600;
    if (scrollPos >= threshold) {
      loadNext();
    }
  });
}

/**
 * Initialize the movies page: show popular and top rated movies.
 */
async function initMoviesPage() {
  // Containers for hero and genre rows
  const hero = document.getElementById('hero');
  const actionRow = document.getElementById('movies-action');
  const comedyRow = document.getElementById('movies-comedy');
  const dramaRow = document.getElementById('movies-drama');
  const sciFiRow = document.getElementById('movies-sci-fi');

  // Show skeletons while fetching data
  if (actionRow) showSkeletons(actionRow, 5, 'horizontal');
  if (comedyRow) showSkeletons(comedyRow, 5, 'horizontal');
  if (dramaRow) showSkeletons(dramaRow, 5, 'horizontal');
  if (sciFiRow) showSkeletons(sciFiRow, 5, 'horizontal');

  try {
    // Fetch a list of popular movies to pick a hero slide
    const popularMovies = await getPopular('movie');
    if (popularMovies && popularMovies.length) {
      renderHero(hero, popularMovies[0], 'movie');
    }
    // Fetch movies for each genre using TMDB genre IDs
    // Action (28), Comedy (35), Drama (18), Sci‑Fi (878)
    const [actionMovies, comedyMovies, dramaMovies, sciFiMovies] = await Promise.all([
      discoverContent('movie', { with_genres: 28 }),
      discoverContent('movie', { with_genres: 35 }),
      discoverContent('movie', { with_genres: 18 }),
      discoverContent('movie', { with_genres: 878 }),
    ]);
    // Render horizontal rows with the first few items of each category
    if (actionRow) renderHorizontalRow(actionRow, actionMovies.slice(0, 10), 'movie');
    if (comedyRow) renderHorizontalRow(comedyRow, comedyMovies.slice(0, 10), 'movie');
    if (dramaRow) renderHorizontalRow(dramaRow, dramaMovies.slice(0, 10), 'movie');
    if (sciFiRow) renderHorizontalRow(sciFiRow, sciFiMovies.slice(0, 10), 'movie');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the TV shows page: show popular and top rated TV shows.
 */
async function initTvPage() {
  const hero = document.getElementById('hero');
  const popularRow = document.getElementById('tv-popular');
  const topRow = document.getElementById('tv-top-rated');

  // Show skeleton placeholders for horizontal rows
  if (popularRow) showSkeletons(popularRow, 5, 'horizontal');
  if (topRow) showSkeletons(topRow, 5, 'horizontal');

  try {
    const [popularShows, topShows] = await Promise.all([
      getPopular('tv'),
      getTopRated('tv'),
    ]);
    // Set hero to the first popular show
    if (popularShows && popularShows.length) {
      renderHero(hero, popularShows[0], 'tv');
    }
    // Render horizontal rows
    if (popularRow) renderHorizontalRow(popularRow, popularShows.slice(0, 10), 'tv');
    if (topRow) renderHorizontalRow(topRow, topShows.slice(0, 10), 'tv');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the anime page.  Since TMDB doesn’t have a dedicated anime
 * endpoint, we approximate by filtering popular TV shows that belong to
 * the animation genre (ID 16) and originate from Japan.  We also display
 * top rated animation shows.
 */
async function initAnimePage() {
  const hero = document.getElementById('hero');
  const popularRow = document.getElementById('anime-popular');
  const topRow = document.getElementById('anime-top-rated');
  // Show horizontal skeletons
  if (popularRow) showSkeletons(popularRow, 5, 'horizontal');
  if (topRow) showSkeletons(topRow, 5, 'horizontal');
  try {
    const popularShows = await getPopular('tv');
    // Filter anime by origin country or animation genre (16)
    const animePopular = popularShows.filter((show) => {
      return (
        (show.origin_country && show.origin_country.includes('JP')) ||
        (show.genre_ids && show.genre_ids.includes(16))
      );
    });
    const topRatedShows = await getTopRated('tv');
    const animeTop = topRatedShows.filter((show) => {
      return (
        (show.origin_country && show.origin_country.includes('JP')) ||
        (show.genre_ids && show.genre_ids.includes(16))
      );
    });
    if (animePopular && animePopular.length) {
      renderHero(hero, animePopular[0], 'tv');
    }
    if (popularRow) renderHorizontalRow(popularRow, animePopular.slice(0, 10), 'tv');
    if (topRow) renderHorizontalRow(topRow, animeTop.slice(0, 10), 'tv');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the filter page.  Loads genre lists for movies and TV shows
 * and hooks up filter controls to call discoverContent.  The results
 * container will re‑render whenever filters change.
 */
async function initFilterPage() {
  const typeSelect = document.getElementById('filter-type');
  const genreSelect = document.getElementById('filter-genre');
  const languageSelect = document.getElementById('filter-language');
  const sortSelect = document.getElementById('filter-sort');
  const eraButtons = document.querySelectorAll('.era-btn');
  const resultsContainer = document.getElementById('filter-results');
  const clearAllBtn = document.getElementById('filter-clear');

  // Populate genre select based on type
  async function populateGenres(type) {
    const genres = await getGenres(type);
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      genreSelect.appendChild(opt);
    });
  }
  // Initialize with movie genres
  await populateGenres('movie');
  // Change genres when type changes
  typeSelect.onchange = async () => {
    await populateGenres(typeSelect.value);
    applyFilters();
  };

  // When any filter changes, update the results
  genreSelect.onchange = applyFilters;
  languageSelect.onchange = applyFilters;
  sortSelect.onchange = applyFilters;
  eraButtons.forEach((btn) => {
    btn.onclick = () => {
      eraButtons.forEach((b) => b.classList.remove('bg-green-600', 'text-white'));
      btn.classList.add('bg-green-600', 'text-white');
      applyFilters();
    };
  });
  clearAllBtn.onclick = () => {
    genreSelect.value = '';
    languageSelect.value = '';
    sortSelect.value = '';
    eraButtons.forEach((b) => b.classList.remove('bg-green-600', 'text-white'));
    applyFilters();
  };

  // Infinite scroll: load next page when approaching bottom of page
  window.addEventListener('scroll', () => {
    if (filterState.loading || filterState.noMore) return;
    const scrollPos = window.scrollY + window.innerHeight;
    const threshold = document.body.scrollHeight - 600;
    if (scrollPos >= threshold) {
      loadNextFilterPage();
    }
  });

  // State for infinite scrolling
  const filterState = {
    page: 1,
    loading: false,
    noMore: false,
    type: typeSelect.value,
    params: {},
  };

  // Build params from current form selections (genre, language, sort, era)
  function buildParams() {
    const genre = genreSelect.value;
    const lang = languageSelect.value;
    const sort = sortSelect.value;
    // Determine era (decade) year range
    let eraStart = '';
    let eraEnd = '';
    eraButtons.forEach((btn) => {
      if (btn.classList.contains('bg-green-600')) {
        const era = btn.dataset.era;
        switch (era) {
          case '80s':
            eraStart = '1980-01-01';
            eraEnd = '1989-12-31';
            break;
          case '90s':
            eraStart = '1990-01-01';
            eraEnd = '1999-12-31';
            break;
          case '00s':
            eraStart = '2000-01-01';
            eraEnd = '2009-12-31';
            break;
          case '10s':
            eraStart = '2010-01-01';
            eraEnd = '2019-12-31';
            break;
          case '20s':
            eraStart = '2020-01-01';
            eraEnd = '2029-12-31';
            break;
        }
      }
    });
    const p = {};
    if (genre) p.with_genres = genre;
    if (lang) p.with_original_language = lang;
    if (sort) p.sort_by = sort;
    if (eraStart) {
      p['primary_release_date.gte'] = eraStart;
      p['primary_release_date.lte'] = eraEnd;
    }
    return p;
  }

  // Load next page of filter results
  async function loadNextFilterPage() {
    if (filterState.loading || filterState.noMore) return;
    filterState.loading = true;
    try {
      const lang = getLanguage();
      const query = new URLSearchParams({ api_key: API_KEY, language: lang, page: filterState.page, ...filterState.params });
      const url = `${API_BASE}/discover/${filterState.type}?${query}`;
      const data = await fetchJSON(url);
      const results = data.results || [];
      if (filterState.page === 1) {
        resultsContainer.innerHTML = '';
      }
      appendGrid(resultsContainer, results, filterState.type);
      // Determine if more pages exist
      if (data.total_pages && filterState.page >= data.total_pages) {
        filterState.noMore = true;
      } else {
        filterState.page += 1;
      }
      if (!data.total_pages && results.length === 0) {
        filterState.noMore = true;
      }
    } catch (err) {
      console.error(err);
    }
    filterState.loading = false;
  }

  async function applyFilters() {
    filterState.type = typeSelect.value;
    filterState.params = buildParams();
    filterState.page = 1;
    filterState.noMore = false;
    await loadNextFilterPage();
  }
  // Initial render
  applyFilters();
}

/**
 * Initialize the watchlist page by reading entries from localStorage and
 * rendering them as cards.  Also handles removal directly from this page.
 */
function initWatchlistPage() {
  const container = document.getElementById('watchlist-container');
  const emptyMessage = document.getElementById('watchlist-empty');
  function renderList() {
    const list = getWatchlist();
    if (list.length === 0) {
      emptyMessage.classList.remove('hidden');
      container.innerHTML = '';
      return;
    }
    emptyMessage.classList.add('hidden');
    container.innerHTML = '';
    list.forEach((entry) => {
      const { id, type, title, poster } = entry;
      const imgSrc = poster ? IMG_W500 + poster : '';
      const card = createElement(`
        <div class="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-105">
          <img src="${imgSrc}" alt="${title}" class="w-full h-72 object-cover" />
          <button class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 remove-btn" data-id="${id}" data-type="${type}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4.75C3 3.784 3.784 3 4.75 3h10.5C16.216 3 17 3.784 17 4.75v10.5c0 .966-.784 1.75-1.75 1.75H4.75A1.75 1.75 0 013 15.25V4.75zm4.47 3.22a.75.75 0 011.06 0L10 9.439l1.47-1.47a.75.75 0 111.06 1.061L11.061 10.5l1.47 1.47a.75.75 0 11-1.061 1.06L10 11.561l-1.47 1.47a.75.75 0 11-1.061-1.06l1.47-1.47-1.47-1.47a.75.75 0 010-1.061z" clip-rule="evenodd" /></svg>
          </button>
          <div class="absolute inset-0 flex flex-col justify-end p-4 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 class="text-base font-semibold mb-1">${title}</h3>
          </div>
        </div>
      `);
      card.addEventListener('click', (e) => {
        if (e.target.closest('.remove-btn')) return;
        window.location.href = `details.html?type=${type}&id=${id}`;
      });
      container.appendChild(card);
    });
    // Attach removal handlers
    container.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        removeFromWatchlist(id, type);
        renderList();
      });
    });
  }
  renderList();
}

/**
 * Initialize the details page.  Expects query parameters `type` and `id`.
 * Shows a large banner image, description, genre tags, rating, year and
 * buttons to watch, download and add/remove watchlist.  Also shows a
 * recommendations section using similar content (not implemented due to
 * API quota) but trending content is used instead.
 */
async function initDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  if (!type || !id) return;
  const titleEl = document.getElementById('details-title');
  const infoEl = document.getElementById('details-info');
  const descEl = document.getElementById('details-description');
  const genresEl = document.getElementById('details-genres');
  const backdropEl = document.getElementById('details-backdrop');
  const watchBtn = document.getElementById('details-watch-btn');
  const downloadBtn = document.getElementById('details-download-btn');
  const addBtn = document.getElementById('details-add-btn');
    const torrentBtn = document.getElementById('details-torrent-btn');
  const recContainer = document.getElementById('details-recommendations');
  try {
    const details = await getDetails(type, id);
    // Populate basics
    const title = details.title || details.name || 'Unknown';
    const year = details.release_date
      ? details.release_date.slice(0, 4)
      : details.first_air_date
      ? details.first_air_date.slice(0, 4)
      : '';
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
    const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : '');
    titleEl.textContent = title;
    infoEl.textContent = `${rating} • ${year}${runtime ? ' • ' + runtime + 'm' : ''}`;
    descEl.textContent = details.overview || 'No description available.';
    backdropEl.style.backgroundImage = `url(${IMG_ORIGINAL + details.backdrop_path})`;
    // Genres
    genresEl.innerHTML = '';
    (details.genres || []).forEach((g) => {
      const span = document.createElement('span');
      span.className = 'inline-block bg-gray-800 px-3 py-1 mr-2 mb-2 rounded-full text-sm';
      span.textContent = g.name;
      genresEl.appendChild(span);
    });
    // Watch button navigates to watch page
    watchBtn.onclick = () => {
      window.location.href = `watch.html?type=${type}&id=${id}`;
    };
    // Download button triggers pop‑up to choose quality
    // Configure download button to show server selection like watch page
    downloadBtn.onclick = () => {
      const popup = document.getElementById('download-popup');
      popup.classList.remove('hidden');
      const list = document.getElementById('download-list');
      list.innerHTML = '';
      // Build servers: torrent new tab; DL and Worker in iframe
      const servers = [];
      let imdbForTorrent = null;
      if (type === 'movie') {
        imdbForTorrent = details.imdb_id || (details.external_ids && details.external_ids.imdb_id);
      } else {
        imdbForTorrent = details.external_ids && details.external_ids.imdb_id;
      }
      if (imdbForTorrent) {
        servers.push({ name: 'Torrent', type: 'torrent', url: `https://torrentgalaxy.one/get-posts/keywords:${imdbForTorrent}` });
      }
      if (type === 'movie') {
        servers.push({ name: 'BunnyDDL', type: 'iframe', url: `https://bunnyddl.termsandconditionshere.workers.dev/movie/${id}` });
        servers.push({ name: 'VidSrcDL', type: 'iframe', url: `https://dl.vidsrc.vip/movie/${id}` });
      } else {
        servers.push({ name: 'BunnyDDL', type: 'iframe', url: `https://bunnyddl.termsandconditionshere.workers.dev/tv/${id}/1/1` });
        servers.push({ name: 'VidSrcDL', type: 'iframe', url: `https://dl.vidsrc.vip/tv/${id}/1/1` });
      }
      servers.forEach((srv) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-2 hover:bg-gray-700 rounded';
        btn.textContent = `Download via ${srv.name}`;
        btn.onclick = () => {
          popup.classList.add('hidden');
          if (srv.type === 'torrent') {
            window.open(srv.url, '_blank');
          } else {
            const framePopup = document.getElementById('download-iframe-popup');
            const frameContainer = document.getElementById('download-iframe-container');
            frameContainer.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="${srv.url}" frameborder="0" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"></iframe>`;
            framePopup.classList.remove('hidden');
          }
        };
        list.appendChild(btn);
      });
    };

    // Torrent button navigates to torrent page using TMDB ID
    if (torrentBtn) {
      torrentBtn.onclick = () => {
        window.location.href = `torrent.html?type=${type}&id=${id}`;
      };
    }
    // Close download pop‑up
    const popupClose = document.getElementById('download-close');
    popupClose.onclick = () => {
      document.getElementById('download-popup').classList.add('hidden');
    };
    // Close download iframe popup
    const iframeCloseBtn = document.getElementById('download-iframe-close');
    if (iframeCloseBtn) {
      iframeCloseBtn.onclick = () => {
        const framePopup = document.getElementById('download-iframe-popup');
        const frameContainer = document.getElementById('download-iframe-container');
        frameContainer.innerHTML = '';
        framePopup.classList.add('hidden');
      };
    }
    // Watchlist toggle button
    function updateAddBtn() {
      const inList = isInWatchlist(id, type);
      addBtn.innerHTML = inList
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg><span>Remove</span>'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg><span>Add</span>';
    }
    updateAddBtn();
    addBtn.onclick = () => {
      const item = {
        id,
        type,
        title,
        poster: details.poster_path || '',
      };
      if (isInWatchlist(id, type)) {
        removeFromWatchlist(id, type);
      } else {
        addToWatchlist(item);
      }
      updateAddBtn();
    };
    // Cast slider
    const castContainer = document.getElementById('details-cast');
    if (details.credits && details.credits.cast) {
      renderCastSlider(castContainer, details.credits.cast);
    }

    // Trailers & More: display video thumbnails (YouTube trailers)
    const videosContainer = document.getElementById('details-videos');
    if (videosContainer) {
      try {
        const vids = await getVideos(type, id);
        const trailers = vids.filter((v) => v.site === 'YouTube');
        videosContainer.innerHTML = '';
        if (trailers.length) {
          trailers.slice(0, 8).forEach((vid) => {
            const thumbUrl = `https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`;
            const card = document.createElement('div');
            card.className = 'relative cursor-pointer';
            card.innerHTML = `
              <div class="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <img src="${thumbUrl}" alt="${vid.name}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <i class="fa-solid fa-play text-3xl text-white"></i>
                </div>
              </div>
              <p class="mt-1 text-xs truncate text-gray-200">${vid.name}</p>
            `;
            card.onclick = () => {
              // Open YouTube video in new tab
              window.open(`https://www.youtube.com/watch?v=${vid.key}`, '_blank');
            };
            videosContainer.appendChild(card);
          });
        } else {
          videosContainer.innerHTML = '<p class="text-gray-400">No trailers available.</p>';
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Providers/Logos: display network or production company logos
    const providersContainer = document.getElementById('details-providers');
    if (providersContainer) {
      providersContainer.innerHTML = '';
      const logos = [];
      // networks for TV or production companies for movies
      if (details.networks && details.networks.length) {
        details.networks.forEach((n) => {
          if (n.logo_path) logos.push(IMG_W500 + n.logo_path);
        });
      }
      if (logos.length === 0 && details.production_companies) {
        details.production_companies.forEach((c) => {
          if (c.logo_path) logos.push(IMG_W500 + c.logo_path);
        });
      }
      if (logos.length) {
        logos.forEach((url) => {
          const img = document.createElement('img');
          img.src = url;
          img.alt = 'logo';
          img.className = 'h-10 object-contain';
          providersContainer.appendChild(img);
        });
      } else {
        providersContainer.innerHTML = '<p class="text-gray-400">No provider logos available.</p>';
      }
    }
    // Recommendations: reuse trending list as placeholder
    const recItems = await getTrending(type);
    renderGrid(recContainer, recItems.slice(0, 12), type);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the watch page.  Expects query parameters `type` and `id`.
 * Embeds the first available trailer from TMDB if available, otherwise
 * displays a placeholder message.  Also includes a download pop‑up similar
 * to the details page.
 */
async function initWatchPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  if (!type || !id) return;
  const season = params.get('season') || '1';
  const episode = params.get('episode') || '1';
  const titleEl = document.getElementById('watch-title');
  const player = document.getElementById('watch-player');
  const downloadBtn = document.getElementById('watch-download-btn');
  try {
    const details = await getDetails(type, id);
    const title = details.title || details.name || 'Unknown';
    titleEl.textContent = title;
    // Compute streaming sources based on available identifiers
    const sources = [];
    SERVERS.forEach((srv) => {
      let url = '';
      if (type === 'movie') {
        if (srv.type === 'tmdb') {
          url = srv.url.replace('{tmdb_id}', id);
        } else if (srv.type === 'imdb' && details.imdb_id) {
          url = srv.url.replace('{imdb_id}', details.imdb_id);
        }
      } else if (type === 'tv') {
        if (srv.type === 'tmdb') {
          url = srv.url_tv
            .replace('{tmdb_id}', id)
            .replace('{season}', season)
            .replace('{episode}', episode);
        } else if (
          srv.type === 'imdb' &&
          details.external_ids &&
          details.external_ids.imdb_id
        ) {
          url = srv.url_tv
            .replace('{imdb_id}', details.external_ids.imdb_id)
            .replace('{season}', season)
            .replace('{episode}', episode);
        }
      }
      if (url) {
        sources.push({ name: srv.name, url });
      }
    });
    // Render server selection as a dropdown with sandbox toggle support
    const selectEl = document.getElementById('serverSelect');
    const sandboxToggle = document.getElementById('sandboxToggle');
    const sandboxLabel = document.getElementById('sandboxToggleLabel');
    // Helper to render the player iframe based on selected URL and sandbox setting
    const updatePlayer = (url) => {
      const sandboxAttr = sandboxToggle && sandboxToggle.checked
        ? ' sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"'
        : '';
      // Embed the iframe as absolutely positioned to fill the 16:9 container
      player.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="${url}" frameborder="0" allowfullscreen${sandboxAttr}></iframe>`;
    };
    if (selectEl) {
      selectEl.innerHTML = '';
      if (sources.length > 0) {
        sources.forEach((src) => {
          const option = document.createElement('option');
          option.value = src.url;
          option.textContent = src.name;
          selectEl.appendChild(option);
        });
        // Auto select first option and render
        selectEl.selectedIndex = 0;
        updatePlayer(sources[0].url);
        // When selection changes, update the iframe
        selectEl.onchange = () => {
          updatePlayer(selectEl.value);
        };
        // When sandbox toggle changes, re-render current selection and update icon
        if (sandboxToggle) {
          const updateSandboxIcon = () => {
            if (sandboxLabel) {
              sandboxLabel.innerHTML = sandboxToggle.checked
                ? '<i class="fa-solid fa-shield-alt"></i>'
                : '<i class="fa-regular fa-square"></i>';
            }
          };
          sandboxToggle.onchange = () => {
            updatePlayer(selectEl.value);
            updateSandboxIcon();
          };
          // initialise icon on first render
          updateSandboxIcon();
        }
      } else {
        // If no servers available, disable dropdown and show fallback
        const opt = document.createElement('option');
        opt.textContent = 'No playable server';
        opt.disabled = true;
        opt.selected = true;
        selectEl.appendChild(opt);
        // Fallback to YouTube trailer if available
        const videos = await getVideos(type, id);
        const trailer = videos.find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer) {
          updatePlayer(`https://www.youtube.com/embed/${trailer.key}`);
        } else {
          player.innerHTML = '<div class="text-center p-8">No playable server or trailer available.</div>';
        }
      }
    }
    // Configure download pop‑up handlers.  When the user opens the download
    // menu we dynamically generate links to direct download servers based
    // on the content type and identifier.  Two servers (BunnyDDL and
    // VidSrcDL) are provided.  Links open in a new tab.
    // Configure download button to open a server selection menu and subsequently embed downloads
    downloadBtn.onclick = () => {
      const popup = document.getElementById('download-popup');
      popup.classList.remove('hidden');
      const list = document.getElementById('download-list');
      list.innerHTML = '';
      // Build a list of servers: Torrent opens in new tab; DL and Worker open in iframe pop‑up
      const servers = [];
      // Determine IMDb ID for torrent server
      let imdbForTorrent = null;
      if (type === 'movie') {
        imdbForTorrent = details.imdb_id || (details.external_ids && details.external_ids.imdb_id);
      } else {
        imdbForTorrent = details.external_ids && details.external_ids.imdb_id;
      }
      if (imdbForTorrent) {
        servers.push({ name: 'Torrent', type: 'torrent', url: `https://torrentgalaxy.one/get-posts/keywords:${imdbForTorrent}` });
      }
      if (type === 'movie') {
        servers.push({ name: 'BunnyDDL', type: 'iframe', url: `https://bunnyddl.termsandconditionshere.workers.dev/movie/${id}` });
        servers.push({ name: 'VidSrcDL', type: 'iframe', url: `https://dl.vidsrc.vip/movie/${id}` });
      } else {
        servers.push({ name: 'BunnyDDL', type: 'iframe', url: `https://bunnyddl.termsandconditionshere.workers.dev/tv/${id}/${season}/${episode}` });
        servers.push({ name: 'VidSrcDL', type: 'iframe', url: `https://dl.vidsrc.vip/tv/${id}/${season}/${episode}` });
      }
      // Render buttons for each download source
      servers.forEach((srv) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-2 hover:bg-gray-700 rounded';
        btn.textContent = `Download via ${srv.name}`;
        btn.onclick = () => {
          // Hide server selection popup
          popup.classList.add('hidden');
          if (srv.type === 'torrent') {
            // Open torrent in new tab
            window.open(srv.url, '_blank');
          } else {
            // Show iframe popup for DL/Worker
            const framePopup = document.getElementById('download-iframe-popup');
            const frameContainer = document.getElementById('download-iframe-container');
            frameContainer.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="${srv.url}" frameborder="0" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"></iframe>`;
            framePopup.classList.remove('hidden');
          }
        };
        list.appendChild(btn);
      });
    };
    // Close server selection popup
    const popupClose = document.getElementById('download-close');
    if (popupClose) {
      popupClose.onclick = () => {
        document.getElementById('download-popup').classList.add('hidden');
      };
    }
    // Close iframe popup
    const iframeClose = document.getElementById('download-iframe-close');
    if (iframeClose) {
      iframeClose.onclick = () => {
        const framePopup = document.getElementById('download-iframe-popup');
        const frameContainer = document.getElementById('download-iframe-container');
        frameContainer.innerHTML = '';
        framePopup.classList.add('hidden');
      };
    }
    // If this is a TV show, render seasons and episodes below the player
    if (type === 'tv') {
      const seasonTabs = document.getElementById('season-tabs');
      const episodeGrid = document.getElementById('episode-grid');
      if (seasonTabs && episodeGrid) {
        renderSeasonEpisodeGrid(seasonTabs, episodeGrid, id, season);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the torrent page.  Expects query parameters `type` and `id`.
 * Fetches the IMDb ID using TMDB external IDs and embeds a torrent
 * search page from TorrentGalaxy.  Provides a sandbox toggle for
 * security.  The iframe is rendered with a 16:9 aspect ratio.
 */
async function initTorrentPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  if (!type || !id) return;
  const titleEl = document.getElementById('torrent-title');
  const player = document.getElementById('torrent-player');
  const sandboxToggle = document.getElementById('torrent-sandbox-toggle');
  const sandboxLabel = document.getElementById('torrent-sandbox-label');
  try {
    const details = await getDetails(type, id);
    const title = details.title || details.name || 'Unknown';
    titleEl.textContent = title;
    // Determine IMDb ID from external IDs or direct property
    let imdbId = null;
    if (details.external_ids && details.external_ids.imdb_id) {
      imdbId = details.external_ids.imdb_id;
    } else if (details.imdb_id) {
      imdbId = details.imdb_id;
    }
    if (!imdbId) {
      player.innerHTML = '<div class="text-center p-8">No IMDb ID available to fetch torrents.</div>';
      return;
    }
    const url = `https://torrentgalaxy.one/get-posts/keywords:${imdbId}`;
    // Helper to render iframe with optional sandbox
    const renderFrame = () => {
      const sandboxAttr = sandboxToggle && sandboxToggle.checked
        ? ' sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"'
        : '';
      player.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="${url}" frameborder="0"${sandboxAttr}></iframe>`;
    };
    // Initialize sandbox toggle and icon
    if (sandboxToggle) {
      const updateSandboxIcon = () => {
        if (sandboxLabel) {
          sandboxLabel.innerHTML = sandboxToggle.checked
            ? '<i class="fa-solid fa-shield-alt"></i>'
            : '<i class="fa-regular fa-square"></i>';
        }
      };
      sandboxToggle.onchange = () => {
        renderFrame();
        updateSandboxIcon();
      };
      // Set initial icon and frame
      updateSandboxIcon();
    }
    renderFrame();
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize the search page.  Expects a `query` parameter.  Displays
 * results grouped by media type.  Utilises the same card rendering and
 * watchlist functionality as other pages.
 */
async function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('query');
  const movieContainer = document.getElementById('search-movies');
  const tvContainer = document.getElementById('search-tv');
  const heading = document.getElementById('search-heading');
  if (!query) return;
  heading.textContent = `Results for “${query}”`;
  try {
    const results = await searchMulti(query);
    const movies = results.filter((item) => item.media_type === 'movie');
    const tvShows = results.filter((item) => item.media_type === 'tv');
    if (movies.length) {
      renderGrid(movieContainer, movies.slice(0, 20), 'movie');
    } else {
      movieContainer.innerHTML = '<p class="text-gray-400">No movies found.</p>';
    }
    if (tvShows.length) {
      renderGrid(tvContainer, tvShows.slice(0, 20), 'tv');
    } else {
      tvContainer.innerHTML = '<p class="text-gray-400">No TV shows found.</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Initialize a person page.  Displays the actor's photo, name, biography and
 * a list of works they are known for.  Expects query parameter `id`.
 */
async function initPersonPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const photoEl = document.getElementById('person-photo');
  const nameEl = document.getElementById('person-name');
  const bioEl = document.getElementById('person-biography');
  const knownContainer = document.getElementById('person-known');
  try {
    const lang = getLanguage();
    // Fetch person details with combined credits
    const person = await fetchJSON(
      `${API_BASE}/person/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=combined_credits`
    );
    nameEl.textContent = person.name || 'Unknown';
    bioEl.textContent = person.biography || 'Biography not available.';
    if (person.profile_path) {
      photoEl.src = IMG_W500 + person.profile_path;
    }
    // Combine movie and tv credits and sort by popularity
    const credits = person.combined_credits && person.combined_credits.cast ? person.combined_credits.cast : [];
    credits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    // Render up to 12 known works
    knownContainer.innerHTML = '';
    credits.slice(0, 12).forEach((item) => {
      const type = item.media_type === 'movie' ? 'movie' : 'tv';
      const card = renderCard(item, type);
      knownContainer.appendChild(card);
    });
    // Attach watchlist handlers to newly added cards
    attachWatchlistHandlers(knownContainer);
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------------------------------------------------------
// Global search handler
// -----------------------------------------------------------------------------

/**
 * Bind search input in the nav bar.  On Enter key, redirect to search page
 * with query parameter.  Works on every page that includes a search input
 * with the ID 'searchInput'.
 */
function setupGlobalSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `search.html?query=${encodeURIComponent(q)}`;
      }
    }
  });
}

/**
 * Set up the mobile search overlay.  When the search icon is tapped on
 * small screens, a full‑screen overlay appears with an input box.  As the
 * user types, we call TMDB’s multi‑search endpoint and display up to 8
 * suggestions including a small poster (50px wide) and the title.  Clicking
 * a result navigates directly to the details page for that media.  The
 * overlay can be dismissed via the X button.
 */
function setupMobileSearch() {
  const openBtn = document.getElementById('mobileSearchBtn');
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('overlaySearchInput');
  const results = document.getElementById('overlaySearchResults');
  const closeBtn = document.getElementById('overlayCloseBtn');
  if (!openBtn || !overlay || !input || !results || !closeBtn) return;
  openBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    input.value = '';
    results.innerHTML = '';
    input.focus();
  });
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  input.addEventListener('input', async () => {
    const q = input.value.trim();
    results.innerHTML = '';
    if (q.length < 2) return;
    try {
      const items = await searchMulti(q);
      items.slice(0, 8).forEach((item) => {
        const id = item.id;
        const type = item.media_type;
        const title = item.title || item.name || 'Unknown';
        const posterPath = item.poster_path || item.backdrop_path;
        const imgSrc = posterPath ? IMG_W500 + posterPath : '';
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer';
        row.innerHTML = `<img src="${imgSrc}" alt="${title}" class="w-12 h-16 object-cover rounded" /><span class="text-white text-sm truncate">${title}</span>`;
        row.addEventListener('click', () => {
          overlay.classList.add('hidden');
          window.location.href = `details.html?type=${type}&id=${id}`;
        });
        results.appendChild(row);
      });
    } catch (err) {
      console.error(err);
    }
  });
}

/**
 * Set up a mobile search overlay.  When the user taps the search icon on
 * mobile (button with id mobileSearchBtn), an overlay pops up with its
 * own input.  Live suggestions are fetched from TMDB and displayed with
 * small poster thumbnails.  Clicking a suggestion navigates to the
 * appropriate details page.  The overlay can be closed via the X icon.
 */
function setupMobileSearch() {
  const openBtn = document.getElementById('mobileSearchBtn');
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('overlaySearchInput');
  const results = document.getElementById('overlaySearchResults');
  const closeBtn = document.getElementById('overlayCloseBtn');
  if (!openBtn || !overlay || !input || !results || !closeBtn) return;
  // Show overlay on button click
  openBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    input.value = '';
    results.innerHTML = '';
    input.focus();
  });
  // Close overlay
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  // Handle live search
  input.addEventListener('input', async () => {
    const q = input.value.trim();
    results.innerHTML = '';
    if (q.length < 2) return;
    try {
      const data = await searchMulti(q);
      data.slice(0, 8).forEach((item) => {
        const id = item.id;
        const mediaType = item.media_type;
        const title = item.title || item.name || 'Unknown';
        const posterPath = item.poster_path || item.backdrop_path;
        const imgSrc = posterPath ? IMG_W500 + posterPath : '';
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer';
        row.innerHTML = `
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}" class="w-12 h-16 object-cover rounded" />` : '<div class="w-12 h-16 bg-gray-700 rounded"></div>'}
          <span class="text-white text-sm">${title}</span>
        `;
        row.onclick = () => {
          window.location.href = `details.html?type=${mediaType}&id=${id}`;
        };
        results.appendChild(row);
      });
    } catch (err) {
      console.error(err);
    }
  });
}

// -----------------------------------------------------------------------------
// Page router
// -----------------------------------------------------------------------------

/**
 * Determine which page to initialize based on the body’s data‑page attribute.
 */
function initPage() {
  const page = document.body.dataset.page;
  // Always set up search, theme toggle and language selector if present
  setupGlobalSearch();
  if (document.getElementById('themeToggle')) setupThemeToggle();
  if (document.getElementById('langSelect')) setupLanguageSelector();
  // Setup mobile menu (hamburger) if present
  setupMobileMenu();
  // Highlight the active bottom navigation link
  setupBottomNav();
  // Setup mobile search overlay if present
  setupMobileSearch();
  // Mobile search overlay
  setupMobileSearch();
  switch (page) {
    case 'home':
      initHomePage();
      break;
    case 'movies':
      initMoviesPage();
      break;
    case 'tv':
      initTvPage();
      break;
    case 'anime':
      initAnimePage();
      break;
    case 'filter':
      initFilterPage();
      break;
    case 'watchlist':
      initWatchlistPage();
      break;
    case 'details':
      initDetailsPage();
      break;
    case 'watch':
      initWatchPage();
      break;
    case 'search':
      initSearchPage();
      break;
    case 'platforms':
      // No dynamic data required for platforms page; just ensure theme and search are set up
      break;
    case 'torrent':
      initTorrentPage();
      break;
    case 'person':
      initPersonPage();
      break;
    default:
      // If no page specified, fallback to home
      initHomePage();
      break;
  }
}

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', initPage);
