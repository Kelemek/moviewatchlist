const searchBtn = document.getElementById("search-btn")
const searchTxt = document.getElementById('search-txt')
const placeHolder = document.getElementById('placeholder')
const main = document.getElementById("main")

document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/watchlist.html" || window.location.pathname === "/watchlist") {
        const watchlistFromLocalStorage = JSON.parse(localStorage.getItem("watchlist"))
        if (!watchlistFromLocalStorage || watchlistFromLocalStorage.length === 0) {
            placeHolder.classList.add('visible')
        } else {
            renderHtml(watchlistFromLocalStorage)
            placeHolder.classList.remove('visible')
        }
    }
})

async function getMovieData(title) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=2b580389&s=${title}&type=movie`)
        if (!res.ok) {
            throw Error("Something went wrong")
        }
        const data = await res.json()
        if (data.Response === "False") {
            throw Error("Please try another search.")
        }
        placeHolder.style.visibility = "hidden" 
        renderHtml(data.Search)
    } catch(err) {
        console.error(err.message)
        placeHolder.style.visibility = "visible"
        placeHolder.innerHTML = `<b class="placeholderError">${err.message}</b>`
    }
}

async function getMovieDetails(imdbId) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=2b580389&i=${imdbId}`)
        if (!res.ok) {
            throw Error("Something went wrong")
        }
        const data = await res.json()
        return data
    } catch(err) {
        console.error(err.message)
    }
}

searchBtn.addEventListener("click", function(){
    const encodedQuery = encodeURIComponent(searchTxt.value)
    getMovieData(encodedQuery)
})

searchTxt.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const encodedQuery = encodeURIComponent(searchTxt.value)
        getMovieData(encodedQuery)
    }
})

document.addEventListener('click', function(e){
    if(e.target.dataset.watch){
        const watchlistFromLocalStorage = JSON.parse( localStorage.getItem("watchlist") )
        let watchlist = []
        let watchListItem = {}
        if (watchlistFromLocalStorage) {
            watchListItem = {imdbID: e.target.dataset.watch} 
            watchlist = watchlistFromLocalStorage
            if (!watchlist.some(item => item.imdbID === watchListItem.imdbID)) {
                watchlist.push(watchListItem) 
                e.target.innerHTML = "<p>Added to list</p>"
            } else {
                e.target.innerHTML = "<p>Already added</p>"
            }               
        } else {
            watchListItem = {imdbID: e.target.dataset.watch} 
            watchlist.push(watchListItem)    
        }
        localStorage.setItem("watchlist", JSON.stringify(watchlist))     
    } 
    
    if (e.target.dataset.remove){
        const watchlistFromLocalStorage = JSON.parse( localStorage.getItem("watchlist") ) || []
        let watchlist = watchlistFromLocalStorage.filter(watch => watch.imdbID !== e.target.dataset.remove)
        if (watchlist.length === 0) {
            placeHolder.classList.add('visible')
            window.location.reload()
        } else {
            placeHolder.classList.remove('visible')
        }
        localStorage.setItem("watchlist", JSON.stringify(watchlist))        
        renderHtml(watchlist)
        
    }
})

async function renderHtml(movieSearch){
    console.log(movieSearch)
    let returnHtml = ""
    for (const movie of movieSearch) {
        const movieDetails = await getMovieDetails(movie.imdbID)
        returnHtml += `
        <div class="movie-div">
            <img src="${movieDetails.Poster}" class="movie-poster" alt="${movieDetails.Title}">
                <div class="movie-data">
                    <div class="title-row">
                        <p class="movie-title">${movieDetails.Title}</p>
                        <img src="images/star.png">
                        <p class="movie-ratings">${movieDetails.imdbRating}</p>
                    </div>
                    <div class="details-row">
                        <p class="movie-details">${movieDetails.Runtime}</p>
                        <p class="movie-details">${movieDetails.Genre}</p>
                        ${
                            (window.location.pathname === "/watchlist" || window.location.pathname === "/watchlist.html")
                            ? `<button class="movie-details" data-remove=${movieDetails.imdbID}>
                                <img src="images/remove.png" alt="remove icon">
                                Remove
                            </button>`
                            : `<button class="movie-details" data-watch=${movieDetails.imdbID}>
                                <img src="images/add.png" alt="add icon">
                                Watchlist
                            </button>`
                        }
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
