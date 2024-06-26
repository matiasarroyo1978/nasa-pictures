const apiURL = 'https://api.nasa.gov/planetary/apod';
const apiKey = 'DEMO_KEY';
const count = 10;
const resultNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader');
let resultsArray = [];
let favorites = {};

function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === 'results') {
    resultNav.classList.remove('hidden');
    favoritesNav.classList.add('hidden');
  } else {
    resultNav.classList.add('hidden');
    favoritesNav.classList.remove('hidden');
  }
  loader.classList.add('hidden');
}

function createCard(result, page) {
  const card = document.createElement('div');
  card.classList.add('card');

  const link = document.createElement('a');
  link.href = result.hdurl;
  link.title = 'View Full Image';
  link.target = '_blank';

  const image = document.createElement('img');
  image.src = result.url;
  image.alt = 'NASA Picture of the Day';
  image.loading = 'lazy';
  image.classList.add('card-img-top');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title');
  cardTitle.textContent = result.title;

  const saveText = document.createElement('p');
  saveText.classList.add('clickable');
  saveText.textContent = page === 'results' ? 'Add To Favorites' : 'Remove Favorite';
  saveText.setAttribute('onclick', `toggleFavorite('${result.url}', '${page}')`);

  const cardText = document.createElement('p');
  cardText.textContent = result.explanation;

  const footer = document.createElement('small');
  footer.classList.add('text-muted');

  const date = document.createElement('strong');
  date.textContent = result.date;

  const copyrightResult = result.copyright === undefined ? '' : result.copyright;
  const copyright = document.createElement('span');
  copyright.textContent = ` ${copyrightResult}`;

  footer.append(date, copyright);
  cardBody.append(cardTitle, saveText, cardText, footer);
  link.appendChild(image);
  card.append(link, cardBody);
  return card;
}

function createDOMNodes(page) {
  const currentArray = page === 'results' ? resultsArray : Object.values(favorites);
  imagesContainer.innerHTML = '';
  currentArray.forEach((result) => {
    const card = createCard(result, page);
    imagesContainer.appendChild(card);
  });
}

function updateDOM(page) {
  if (localStorage.getItem('nasaFavorites')) {
    favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
  }
  createDOMNodes(page);
  showContent(page);
}

async function fetchData() {
  loader.classList.remove('hidden');
  try {
    const response = await fetch(`${apiURL}?api_key=${apiKey}&count=${count}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    resultsArray = await response.json();
    updateDOM('results');
  } catch (error) {
    console.error('Error fetching data:', error.message);
    alert('Error fetching data: ' + error.message);
  }
}

function toggleFavorite(url, page) {
  const isFavorite = favorites[url];
  if (isFavorite) {
    delete favorites[url];
  } else {
    const result = resultsArray.find((result) => result.url === url);
    if (result) {
      favorites[url] = result;
      saveConfirmed.hidden = false;
      setTimeout(() => {
        saveConfirmed.hidden = true;
      }, 2000);
    }
  }
  localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
  updateDOM(page === 'results' ? 'results' : 'favorites');
}

function init() {
  fetchData();
}

init();
