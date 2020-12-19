// global scope
api_key = "a942ead147c28026ed79eacf0354b7f0"
let temp = null


window.onload = () => {
  // get supported Genres from service on page load 
  getGenre(api_key)
}

// events
document.querySelector("#get-results").addEventListener("click", function () {
  resolver()
})

// complete everything in order when button is pressed
async function resolver() {
  let checkedResults = checkboxGenre()
  console.log(checkedResults)
  let returnDiscovery = await discoverCall(checkedResults)
  temp = returnDiscovery
  console.log(returnDiscovery)

  // add items to html
  selectedMovieHTML(returnDiscovery)

}

function selectedMovieHTML(data) {

  let selMovie = document.querySelector(".selected-movie")
  // clear old data
  while(selMovie.firstChild !=null){
    selMovie.removeChild(selMovie.firstChild)
  }

  //add title
  let title = document.createElement("h2")
  title.setAttribute("class", "selected-movie-poster")
  title.innerText = data[0].title
  selMovie.appendChild(title)
  // add img
  let poster = document.createElement("img")
  poster.setAttribute("src", `https://image.tmdb.org/t/p/original${String(data[0].poster_path)}`)
  poster.setAttribute("class", "selected-movie-poster")
  // sizes for testing only update via css later
  poster.style.height = "200px"
  //poster.style.width = "200px"
  selMovie.appendChild(poster)

  overviewText = document.createElement("p")
  overviewText.innerText = String(data[0].overview)
  selMovie.appendChild(overviewText)


  

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