// global scope
api_key = "a942ead147c28026ed79eacf0354b7f0";
let temp = null;
let sliderValue = 5;

window.onload = () => {
  onLoadAsync();

  async function onLoadAsync() {
    // function to get values and update slider
    slider();

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
    document.querySelector("#span-number-results").innerHTML = String(`${slide.value} Results`);
    console.log(sliderValue)
  };
}

// complete everything in order when button is pressed
async function resolver() {
  let checkedResults = checkboxGenre();
  let returnDiscovery = await discoverCall(checkedResults);

  // add items to html
  selectedMovieHTML(returnDiscovery[0]);
  let selectedSecondary = secondaryMovies(returnDiscovery);
  clickedActions(selectedSecondary)
  
}

function selectedMovieHTML(data) {
  let selMovie = document.querySelector(".selected-movie");
  // clear old data
  // while (selMovie.firstChild != null) {
  //   selMovie.removeChild(selMovie.firstChild);
  // }

  //add title
  let titleDiv = document.querySelector(".selected-title")
  let title = document.createElement("h2");
  title.setAttribute("class", "selected-movie-poster");
  title.innerText = data.title;
  titleDiv.appendChild(title);



  // add img
  let poster = document.createElement("img");
  poster.setAttribute(
    "src",
    `https://image.tmdb.org/t/p/original${String(data.poster_path)}`
  );
  poster.setAttribute("class", "selected-movie-poster");
  // sizes for testing only update via css later
  poster.style.height = "300px";
  //poster.style.width = "200px"
  selMovie.appendChild(poster);

  overviewText = document.createElement("p");
  overviewText.innerText = String(data.overview);
  selMovie.appendChild(overviewText);
}

function secondaryMovies(data) {
  let dataCopy = data;
  let chosenTitles = [];
  let simmilarChoices = document.querySelector(".simmilar-choices");

  // splice out the already chosen element.
  dataCopy.splice(0, 1);

  // clear old elements
  while (simmilarChoices.firstChild != null) {
    simmilarChoices.removeChild(simmilarChoices.firstChild);
  }

  // pull the number to select from the discovery defaulting to 5 for now.
  for (let i = 0; i < sliderValue; i++) {
    let random = Math.floor(Math.random() * dataCopy.length);

    chosenTitles.push(dataCopy[random]);

    let posterPath = dataCopy[random].poster_path;

    //add html
    let movieDiv = document.createElement("div");
    movieDiv.setAttribute("class", "movie-holder");
    movieDiv.setAttribute("data-selection", i)
    simmilarChoices.appendChild(movieDiv);
    let title = document.createElement("h3");
    title.innerText = dataCopy[random].title;
    movieDiv.appendChild(title);

    let poster = document.createElement("img");
    poster.setAttribute(
      "src",
      `https://image.tmdb.org/t/p/original${posterPath}`
    );
    poster.style.height = "100px";
    movieDiv.appendChild(poster);

    // remove the choice so it is not selected again.
    dataCopy.splice(random, 1);
  }
  return chosenTitles
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
          let label = document.createElement("label")
          form.appendChild(label)

        


          let input = document.createElement("input");
          input.setAttribute("type", "checkbox");
          input.setAttribute("id", elm.name);
          input.setAttribute("name", elm.name);
          input.setAttribute("value", elm.id);
          label.appendChild(input);
          
          let span = document.createElement("span")
          span.innerHTML = elm.name
          label.appendChild(span)

          let br = document.createElement("br")
          form.appendChild(br)




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
    let urlQuery = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc${genreList}`;

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

function clickedActions (items) {
  let selected = document.querySelector(".simmilar-choices");
  let divs = Array.from(selected.querySelectorAll("div"))

  for(let i = 0; i<divs.length; i++){
    divs[i].addEventListener("click",function(){
      console.log("image pressed")
      console.log(divs[i].dataset.selection)
    })
  }


}
