
const searchBtn = document.getElementById("search-btn")
const searchTxt = document.getElementById('search-txt')
const placeHolder = document.getElementById('placeholder')
const main = document.getElementById("main")

async function getMovieData(title) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=2b580389&s=${title}`)
        if (!res.ok) {
            throw Error("Something went wrong")
        }
        const data = await res.json()
        if (data.Response === "False") {
            throw Error("Unable to find what you are looking for. Please try another search.")
        }
        placeHolder.style.visibility = "hidden"  
        renderHtml(data.Search)
    } catch(err) {
        console.error(err.message)
        placeHolder.style.visibility = "visible"
        placeHolder.innerHTML = `<b class="placeholderError">${err.message}</b>`
        searchTxt.value = "Searching something with no data.."
    }
}

async function getMovieDetails(imdbId) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=2b580389&i=${imdbId}`)
        if (!res.ok) {
            throw Error("Something went wrong")
        }
        const data = await res.json()
        console.log(data)
        return data
    } catch(err) {
        console.error(err.message)
    }
}

searchBtn.addEventListener("click", function(){
    getMovieData(searchTxt.value)
})

searchTxt.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getMovieData(searchTxt.value)
    }
})

async function renderHtml(movieSearch){
    let returnHtml = ""
    for (const movie of movieSearch) {
        const movieDetails = await getMovieDetails(movie.imdbID)
        returnHtml += `
        <div class="movie-div">
            <img src="${movieDetails.Poster}" class="movie-poster">
                <div class="movie-data">
                    <div class="title-row">
                        <p class="movie-title">${movieDetails.Title}</p>
                        <img src="images/star.png">
                        <p class="movie-ratings">${movieDetails.imdbRating}</p>
                    </div>
                    <div class="details-row">
                        <p class="movie-details">${movieDetails.Runtime}</p>
                        <p class="movie-details">${movieDetails.Genre}</p>
                        <button class="movie-details">
                            <img src="images/add.png">
                            Watchlist
                        </button>
                    </div>
                    <div class="plot-row">
                        ${movieDetails.Plot}
                    </div>
                </div>
            </div>
        </div>
        `
    }
    main.innerHTML = returnHtml
}
