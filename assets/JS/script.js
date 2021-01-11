// Global Scope
api_key = "a942ead147c28026ed79eacf0354b7f0";
let temp = null;
let sliderValue = 3;
let firstItem = null;
let ratingValue = 5;

window.onload = () => {
  onLoadAsync();

  async function onLoadAsync() {
    // Function to get Values and update Slider
    slider();
    ratingSlider();

    // Load supported Genres on page launch
    let genereCheckboxs = await getGenre(api_key);

    storedCheckedItems(genereCheckboxs);
  }
};

// Events
document.querySelector("#get-results").addEventListener("click", function () {
  resolver();
});

// Get Additional Selections Slider Value
function slider() {
  let slide = document.getElementById("number-results");
  slide.oninput = () => {
    sliderValue = slide.value;
    document.querySelector(
      "#span-number-results"
    ).innerHTML = `${slide.value} Results`;
  };
}

// Get User Rating Slider Value
function ratingSlider() {
  let ratingSlide = document.getElementById("rating-number");
  ratingSlide.oninput = () => {
    ratingValue = ratingSlide.value;
    document.querySelector(
      "#span-rating-result"
    ).innerText = ` ${ratingValue} >`;
  };
}

// Complete everything in order on button press
async function resolver() {
  let checkedResults = checkboxGenre();
  let returnDiscovery = await discoverCall(checkedResults);

  // Add items to HTML
  firstItem = returnDiscovery[0];

  selectedMovieHTML(firstItem);
  let selectedSecondary = secondaryMovies(returnDiscovery);
}

function selectedMovieTrailer(data) {
  fetch(
      `https://api.themoviedb.org/3/movie/${data}/videos?api_key=${api_key}&language=en-US`
    )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return [];
      }
    })
    .then((result) => {
      // See documentation at https://developers.google.com/youtube/player_parameters

      // Create an <iframe> (and YouTube player)
      var player;
      onYouTubeIframeAPIReady();

      function onYouTubeIframeAPIReady() {
        player = new YT.Player("player", {
          height: "240",
          width: "360",
          videoId: String(result["results"][0].key),
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      }

      // The API calls this function when the player's state changes.
      // The function indicates that when playing a video (state=1),

      var done = false;

      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          done = true;
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

// Selected/Focused Movie Primary Function
function selectedMovieHTML(data) {
  let selMovie = document.querySelector(".selected-movie");

  // Clear old data
  while (selMovie.firstChild != null) {
    selMovie.removeChild(selMovie.firstChild);
  }
  try {
    let card = document.createElement("div");
    card.classList.add("card", "horizontal", "main-search-result-for-styling");
    selMovie.append(card);

    // Add Card Image
    let cardImageDiv = document.createElement("div");
    cardImageDiv.classList.add("card-image");
    card.appendChild(cardImageDiv);
    let cardImage = document.createElement("img");
    cardImage.setAttribute(
      "src",
      `https://image.tmdb.org/t/p/original${String(data.poster_path)}`
    );

    cardImageDiv.classList.add("fixed-image");
    cardImageDiv.appendChild(cardImage);
    console.log(data);

    // Add Card Info
    let cardStacked = document.createElement("div");
    cardStacked.classList.add("card-stacked");
    card.appendChild(cardStacked);
    let cardContent = document.createElement("div");
    cardContent.classList.add("card-content");
    cardStacked.appendChild(cardContent);

    cardContent.innerHTML = `
    <h4>${String(data.title)}</h4>
    <p>${String(data.overview)}</p>
    <br>
    <p>User Rating: ${String(data.vote_average)}⭐</p>
    <br>
    <p>Release Date: ${String(data.release_date)}</p>
    <br>
    <div id="player"><div>  
    
    `;

    selectedMovieTrailer(String(data.id));
  } catch (error) {
    let errorP = document.createElement("p");
    selMovie.appendChild(errorP);
    errorP.innerText = "No movies were found for your search"


  }
}
// Setup Card

function secondaryMovies(data) {
  let dataCopy = data;
  let chosenTitles = [];

  // Splice out the already chosen element
  dataCopy.splice(0, 1);

  // Pull the number to select from the discovery based on the slider
  for (let i = 0; i < sliderValue; i++) {
    let random = Math.floor(Math.random() * dataCopy.length);

    chosenTitles.push(dataCopy[random]);

    // Remove the choice so it is not selected again
    dataCopy.splice(random, 1);
  }
  secondaryMoviesHTML(chosenTitles, data);
  return chosenTitles;
}

// Secondary/Additional Movie Selection
function secondaryMoviesHTML(selected) {
  let simmilarChoices = document.querySelector(".simmilar-choices");

  while (simmilarChoices.firstChild != null) {
    simmilarChoices.removeChild(simmilarChoices.firstChild);
  }

 try{
  for (let i = 0; i < selected.length; i++) {
    // Card Setup
    let movieDiv = document.createElement("div");
    movieDiv.classList.add(
      "movie-holder",
      "card",
      "col",
      "m4",
      "l2",
      "card-format"
    );

    movieDiv.setAttribute("data-selection", i);
    simmilarChoices.appendChild(movieDiv);

    // Set Card Image
    
      let cardImage = document.createElement("div");
      cardImage.classList.add("card-image");
      movieDiv.appendChild(cardImage);
      let poster = document.createElement("img");
      poster.setAttribute(
        "src",
        `https://image.tmdb.org/t/p/original${selected[i].poster_path}`
      );
      cardImage.appendChild(poster);
    }
  }catch{
    let error = document.createElement("p");
    simmilarChoices.appendChild(error);
    error.innerText = "No movies were found for your search. :("

  }
    clickedActions(selected);
  }


// Storage
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
    // API does not accept form data so using URL manipulation.
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

  // Select form and get all checked items.
  let genreForm = document.querySelector("#genre-form");
  let checkedItems = genreForm.querySelectorAll("input[type=checkbox]:checked");

  // Clear Local Storage before setting. Note: do this as a JSON item later to prevent clearing all storage.
  localStorage.clear();

  for (const elm of checkedItems) {
    array.push(elm.value);

    // Set Storage we will likely want to do this as a JSON item later but for now just individual values will be fine.
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

  for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function () {
      let selected = divs[i].dataset.selection;
      let priorSelection = firstItem;
      firstItem = items[selected];
      selectedMovieHTML(firstItem);

      // Swap the position in the array for the prior selected item.
      items.splice(selected, 1, priorSelection);
      secondaryMoviesHTML(items);

      // Temp scroll to top.
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    });
  }
}