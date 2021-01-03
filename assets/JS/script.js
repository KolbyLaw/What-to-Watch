// global scope
api_key = "a942ead147c28026ed79eacf0354b7f0";
let temp = null;
let sliderValue = 5;
let firstItem = null;
let ratingValue = 0;

window.onload = () => {
  onLoadAsync();

  async function onLoadAsync() {
    // function to get values and update slider
    slider();
    ratingSlider();

    // get supported Genres from service on page load
    let genereCheckboxs = await getGenre(api_key);

    storedCheckedItems(genereCheckboxs);
  }
};

// events
document.querySelector("#get-results").addEventListener("click", function () {
  resolver();
});

function slider() {
  let slide = document.getElementById("number-results");
  slide.oninput = () => {
    sliderValue = slide.value;
    document.querySelector("#span-number-results").innerHTML = (
      `${(slide.value)} Results`
    );

  };
}

function ratingSlider() {
  let ratingSlide = document.getElementById("rating-number");
  ratingSlide.oninput = () => {
    ratingValue = ratingSlide.value;
    document.querySelector("#span-rating-result").innerText = (` ${ratingValue} >`)

  }
}

// complete everything in order when button is pressed
async function resolver() {
  let checkedResults = checkboxGenre();
  let returnDiscovery = await discoverCall(checkedResults);

  // add items to html
  firstItem = returnDiscovery[0];
  selectedMovieHTML(firstItem);
  let selectedSecondary = secondaryMovies(returnDiscovery);
}

function selectedMovieHTML(data) {
  let selMovie = document.querySelector(".selected-movie");
  // clear old data
  while (selMovie.firstChild != null) {
    selMovie.removeChild(selMovie.firstChild);
  }

  // card
  let card = document.createElement("div");
  card.classList.add("card","horizontal")
  selMovie.append(card)

  // card image
  let cardImageDiv = document.createElement("div")
  cardImageDiv.classList.add("card-image");
  card.appendChild(cardImageDiv);
  let cardImage = document.createElement("img");
  cardImage.setAttribute("src",`https://image.tmdb.org/t/p/original${String(data.poster_path)}`);
  cardImageDiv.appendChild(cardImage);

  // card info
  let cardStacked = document.createElement("div");
  card.appendChild(cardStacked);
  let cardContent = document.createElement("div")
  cardStacked.appendChild(cardContent);

  cardContent.innerHTML = (`
  <h4>${String(data.title)}</h4>
  <p>${String(data.overview)}</p>
  <br>
  <p>User Rating: ${String(data.vote_average)}⭐</p>
  
  `)

}

function secondaryMovies(data) {
  let dataCopy = data;
  let chosenTitles = [];

  // splice out the already chosen element.
  dataCopy.splice(0, 1);

  // pull the number to select from the discovery based on the slider.
  for (let i = 0; i < sliderValue; i++) {
    let random = Math.floor(Math.random() * dataCopy.length);

    chosenTitles.push(dataCopy[random]);

    // remove the choice so it is not selected again.
    dataCopy.splice(random, 1);
  }
  secondaryMoviesHTML(chosenTitles, data);
  return chosenTitles;
}


// Possibly create cards for movie results
function secondaryMoviesHTML(selected) {
  let simmilarChoices = document.querySelector(".simmilar-choices");
  console.log(selected);

  while (simmilarChoices.firstChild != null) {
    simmilarChoices.removeChild(simmilarChoices.firstChild);
  }

  
  for (let i = 0; i < selected.length; i++) {

    //card
    let movieDiv = document.createElement("div");
    //movieDiv.setAttribute("class", "movie-holder");
    movieDiv.classList.add("movie-holder", "card", "horizontal")
    movieDiv.setAttribute("data-selection", i);
    simmilarChoices.appendChild(movieDiv);

    // stacked card div
    let cardStacked = document.createElement("div");
    cardStacked.classList.add("card-stacked");
    movieDiv.appendChild(cardStacked);

    // card content
    let cardContent = document.createElement("div")
    cardContent.classList.add("card-content")
    cardStacked.appendChild(cardContent)
    let title = document.createElement("p");
    //title.setAttribute("class","card-title")
    title.innerText = selected[i].title;
    cardContent.appendChild(title);

    // card image
    let cardImage = document.createElement("div")
    cardImage.classList.add("card-image")
    movieDiv.appendChild(cardImage)
    let poster = document.createElement("img");
    poster.setAttribute(
      "src",
      `https://image.tmdb.org/t/p/original${selected[i].poster_path}`
    );
    //poster.style.height = "100px";
    cardImage.appendChild(poster);
  }
  clickedActions(selected);
}

function storedCheckedItems(checkboxItems) {
  let itemsArray = Array.from(
    checkboxItems.querySelectorAll("input[type=checkbox]")
  );

  for (let i = 0; i < itemsArray.length; i++) {
    let name = itemsArray[i].name;
    let storedItem = localStorage.getItem(name);

    if (storedItem != null) {
      itemsArray[i].checked = true;
    } else {
      continue;
    }
  }
}

function getGenre(api_key) {
  return new Promise(function (resolve, reject) {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`)
      .then((response) => response.json())
      .then((result) => {
        let form = document.getElementById("genre-form");

        for (const elm of result.genres) {
          let label = document.createElement("label");
          form.appendChild(label);

          let input = document.createElement("input");
          input.setAttribute("type", "checkbox");
          input.setAttribute("id", elm.name);
          input.setAttribute("name", elm.name);
          input.setAttribute("value", elm.id);
          label.appendChild(input);

          let span = document.createElement("span");
          span.innerHTML = elm.name;
          label.appendChild(span);

          let br = document.createElement("br");
          form.appendChild(br);

          //let label = document.createElement("label");
          // label.setAttribute("for", elm.name);
          // label.innerText = elm.name;
          // form.appendChild(label);
        }

        resolve(form);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function discoverCall(genreList) {
  return new Promise(function (resolve, reject) {
    // api does not accept form data so using URL manipulation.
    let urlQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc${genreList}&vote_average.gte=${ratingValue}`;

    fetch(urlQuery)
      .then((response) => response.json())
      .then((result) => {
        resolve(result.results);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function checkboxGenre() {
  let array = [];

  //Select form and get all checked items.
  let genreForm = document.querySelector("#genre-form");
  let checkedItems = genreForm.querySelectorAll("input[type=checkbox]:checked");

  // clear local storage before setting, Note do this as a json item later to prevent clearing all storage
  localStorage.clear();

  for (const elm of checkedItems) {
    array.push(elm.value);

    // set storage we will likely want to do this as a JSON item later but for now just individual values will be fine.
    localStorage.setItem(elm.name, "checked");
  }

  // API does not take form data transfer results into string query.
  let stringQuery = null;
  if (array.length == false) {
    stringQuery = "";
  } else {
    stringQuery = `&with_genres=${String(array.join(","))}`;
  }

  return stringQuery;
}

function clickedActions(items) {
  let selectedDiv = document.querySelector(".simmilar-choices");
  let divs = Array.from(selectedDiv.querySelectorAll(".movie-holder"));
  console.log(divs)

  for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function () {
      let selected = divs[i].dataset.selection;
      console.log(selected)
      let priorSelection = firstItem;
      firstItem = items[selected];
      selectedMovieHTML(firstItem);

      // swap the position in the array for the prior selected item.
      items.splice(selected, 1, priorSelection);
      secondaryMoviesHTML(items);

      // temp scroll to top
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    });
  }
}