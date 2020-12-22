// global scope
api_key = "a942ead147c28026ed79eacf0354b7f0"
let temp = null
let sliderValue = 5




window.onload = () => {
  // get supported Genres from service on page load 
  getGenre(api_key)
  slider()



  
}

// events
document.querySelector("#get-results").addEventListener("click", function () {
  resolver()
})

function slider(){
  let slide = document.getElementById("number-results")
  slide.oninput = () =>{
    console.log(slide.value)
    sliderValue = slide.value
    document.getElementById("span-number-results").innerHTML = slide.value

  }
}


// complete everything in order when button is pressed
async function resolver() {
  let checkedResults = checkboxGenre()
  console.log(checkedResults)
  let returnDiscovery = await discoverCall(checkedResults)
  console.log(returnDiscovery)

  // add items to html
  selectedMovieHTML(returnDiscovery[0])
  secondaryMovies(returnDiscovery)



}

function selectedMovieHTML(data) {

  let selMovie = document.querySelector(".selected-movie")
  // clear old data
  while (selMovie.firstChild != null) {
    selMovie.removeChild(selMovie.firstChild)
  }

  //add title
  let title = document.createElement("h2")
  title.setAttribute("class", "selected-movie-poster")
  title.innerText = data.title
  selMovie.appendChild(title)
  // add img
  let poster = document.createElement("img")
  poster.setAttribute("src", `https://image.tmdb.org/t/p/original${String(data.poster_path)}`)
  poster.setAttribute("class", "selected-movie-poster")
  // sizes for testing only update via css later
  poster.style.height = "300px"
  //poster.style.width = "200px"
  selMovie.appendChild(poster)

  overviewText = document.createElement("p")
  overviewText.innerText = String(data.overview)
  selMovie.appendChild(overviewText)

}

function secondaryMovies(data) {
  let dataCopy = data
  let chosenTitles = []
  let simmilarChoices = document.querySelector(".simmilar-choices")

  // splice out the already chosen element. 
  dataCopy.splice(0,1)

  // clear old elements
  while (simmilarChoices.firstChild != null) {
    simmilarChoices.removeChild(simmilarChoices.firstChild)
  }

  // pull the number to select from the discovery defaulting to 5 for now.  
  for (let i = 0; i < sliderValue; i++) {
    let random = Math.floor(Math.random() * dataCopy.length)
    

    chosenTitles.push(dataCopy[random])
    
    let posterPath = (dataCopy[random].poster_path)
    

    //add html
    let movieDiv = document.createElement("div")
    movieDiv.setAttribute("class", "movie-holder")
    simmilarChoices.appendChild(movieDiv)
    let title = document.createElement("h3")
    title.innerText = dataCopy[random].title


    let poster = document.createElement("img")
    poster.setAttribute("src", `https://image.tmdb.org/t/p/original${posterPath}`)
    poster.style.height = "100px"
    movieDiv.appendChild(poster)


    // remove the choice so it is not selected again. 
    dataCopy.splice(random, 1)
    temp = dataCopy

  }



  console.log(chosenTitles)

}


function getGenre(api_key) {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      let form = document.getElementById("genre-form")

      for (const elm of result.genres) {

        let input = document.createElement("input")
        input.setAttribute("type", "checkbox")
        input.setAttribute("id", elm.name)
        input.setAttribute("name", elm.name)
        input.setAttribute("value", elm.id)
        form.appendChild(input)
        let label = document.createElement("label")
        label.setAttribute("for", elm.name)
        label.innerText = elm.name
        form.appendChild(label)

      }



    })
    .catch(error => console.log('error', error));


}

function discoverCall(genreList) {

  return new Promise(function (resolve, reject) {
    // api does not accept form data so using URL manipulation. 
    let urlQuery = (`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc${genreList}`)

    fetch(urlQuery)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        resolve(result.results)

      })
      .catch(error => {
        reject(error)
      });

  })


}

function checkboxGenre() {
  let array = []
  let genreForm = document.querySelector("#genre-form")
  let checkedItems = genreForm.querySelectorAll('input[type=checkbox]:checked')

  for (const elm of checkedItems) {
    array.push(elm.value)
  }

  let stringQuery = null
  if (array.length == false) {
    stringQuery = ""
  } else {
    stringQuery = (`&with_genres=${String(array.join(","))}`)
  }

  return (stringQuery)
}