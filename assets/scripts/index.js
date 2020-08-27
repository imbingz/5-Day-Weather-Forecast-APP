$(document).ready(function() {
	/* BUILD QUERY URL ============================================================================= */

	// Current Weather URL

	function buildCurrentQuery() {
		const baseURL = 'https://api.openweathermap.org/data/2.5/weather?q=';
		const apiKey = '3019514fb26959aff7eeb1e73e5aa725';
		var queryCity = $('#cityInput').val().trim();
		var units = 'imperial';
		var queryURL = baseURL + queryCity + '&units=' + units + '&APPID=' + apiKey;
		return queryURL;
	}

	// Forecast URL

	function buildForcastQuery() {
		const baseURL = 'https://api.openweathermap.org/data/2.5/forecast?q=';
		const apiKey = '3019514fb26959aff7eeb1e73e5aa725';
		var queryCity = $('#cityInput').val().trim();
		var units = 'imperial';
		var queryURL = baseURL + queryCity + '&units=' + units + '&APPID=' + apiKey;
		return queryURL;
	}

	/* UPDATE PAGE ============================================================================== */

	//Current Weather Update

	function updateCurrentWeather(cwData) {
		var apiKey = '3019514fb26959aff7eeb1e73e5aa725';
		let cityName = cwData.name;
		let currentDate = moment().format('dddd, LLL');
		let iconCode = cwData.weather[0].icon;
		let iconURL = 'http://openweathermap.org/img/w/' + iconCode + '.png';
		let temp = cwData.main.temp;
		let humidity = cwData.main.humidity;
		let windSpeed = cwData.wind.speed;
		let lon = cwData.coord.lon;
		let lat = cwData.coord.lat;

		// Generate UV index query URL using lon and lat from current weather query response
		let uvQueryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

		$.ajax({
			url: uvQueryURL,
			mathod: 'GET'
		}).then(function(uvData) {
			let uvIndex = uvData.value;
			let uvColor;

			// Color Label UV index
			if (uvIndex <= 2) {
				uvColor = 'green';
				console.log(uvColor);
			} else if (uvIndex <= 5) {
				uvColor = 'yellow';
			} else if (uvIndex <= 7) {
				uvColor = 'orange';
			} else if (uvIndex <= 10) {
				uvColor = 'red';
			} else {
				uvColor = 'voilet';
			}
			// Display Current Weather Condition
			let currentDay = `
      <div class="card card-panel">
				<h3 class="card-title" id='cityName'>${cityName}<span><img id="wicon" src="${iconURL}" alt="Weather icon"></span>	</h3>
				<p id="date"><small> ${currentDate} </small></p> 
        <p class="temperature">Temperature: <span id="temperature">${temp} &deg;F</span></p>
        <p class="humidity">Humidity: <span id="humidity">${humidity}%</span></p>
        <p class="windSpeed">Wind Speed: <span id="windSpeed">${windSpeed} MPH</span></p>
        <p class="uv">UV Index: <span id="uv" class="${uvColor}">${uvIndex}</span></p>        
      </div>
    `;
			$('#main-display').append(currentDay);
		});
	}

	// Get search history array
	function getSearchHistoy() {
		let historyStr = localStorage.getItem('searchHistory');
		if (historyStr !== null) {
			historyStr = JSON.parse(historyStr);
		} else {
			return [];
		}
	}

	// Assign getSearchHistory() to a variable
	let searchHistory = getSearchHistoy();

	//Display Search City History
	function displaySearchHistory(city) {
		//Only add the city to the beginning of searchHistory array if there is user input
		if (city) {
			// Filter out the cities that users have previously searched to avoid repetition
			searchHistory = searchHistory.filter(function(input) {
				return input !== city;
			});
			//Add city to the beginning of the array
			searchHistory.unshift(city);
			//Save the city search history to the local storage
			localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
		}
		//clear out the search history
		$('.collection').empty();
		// Use a for loop to append only the lastest 8 different cities
		for (let i = 0; i < searchHistory.slice(0, 9); i++) {
			searchCity = `<li class="collection-item">
            <a href="#" class="grey-text text-darken-1 search-city" data-city="austin">${searchHistory[i]}</a>
          </li>`;
			$('.collection').append(searchCity);
		}
	}

	// 5-Day Forecast Update

	function updateForecastPage(wfData) {
    for (let i = 1; i < wfData.list.length; i += 8) {
      
      // Get info from response data 
			let year = wfData.list[i].dt_txt.slice(0, 4);
			let month = wfData.list[i].dt_txt.slice(5, 7);
			let day = wfData.list[i].dt_txt.slice(8, 10);
			let dates = month + '/' + day + '/' + year;
			let iconCode = wfData.list[i].weather[0].icon;
			let iconURL = 'http://openweathermap.org/img/w/' + iconCode + '.png';
			let temp = wfData.list[i].main.temp;
			let humidity = wfData.list[i].main.humidity;
      
      // Set up HTML structure 
			let forecastDay = `
			<div class="col s12 l5ths">
				<div class="card card-panel forecast blue accent-4">
					<h4 class="card-title white-text">${dates}</h4>
					<div class="icon">
						<img id="wicon" src="${iconURL}" alt="Weather icon">
					</div>
					<p class="temperature white-text">
						Temperature: <span id="temperature">${temp} &deg;F</span>
					</p>
					<p class="humidity white-text">
						Humidity: <span id="humidity">${humidity}%</span>
					</p>
				</div>
			</div>
		`;
      // Display 5- day weather forecast 
			$('#forecast-div').append(forecastDay);
		}
	}

	/* CLEAR INPUT ---------------------------------------------------------------------------------------------------------------------------------------------------- */

	function clear() {
		$('#forecast-div').empty();
		$('#main-display').empty();
	}

	/* CLICK HANDLER ---------------------------------------------------------------------------------------------------------------------------------------------------- */

	$('#searchBtn').on('click', function(event) {
		//Prevent form submission and page reload
		event.preventDefault();

		//Clear the display before calling query
		clear();

		let city = $('#cityInput').val().trim();

		if (city) {
			$.ajax({
				url: buildCurrentQuery(),
				method: 'GET'
			}).then(updateCurrentWeather);

			$.ajax({
				url: buildForcastQuery(),
				method: 'GET'
			}).then(updateForecastPage);
		}
	});

	/*--------------------------------------------------------------------------------------------------------------------------------------------------- */

	// Current Weather URL

	/* SET GLOBAL VIRABLES ----------------------------------------------------------------------------------- */

	// const apiKey = '3019514fb26959aff7eeb1e73e5aa725';
	// var queryCity = $('#cityInput').val().trim();
	// console.log(queryCity);
	// let cityHistory = [];

	/* ADD SEARCH BUTTON CLICK EVENT HANDLER  ----------------------------------------------------------------------------------- */
	// $('#searchBtn').on('click', function(event) {
	// 	console.log('button clicked');
	// 	event.preventDefault();
	// 	if (queryCity) {
	// 		displayWeather(city);
	// 	}
	// });

	/* MAKE API CALLS AND DISPLAY WEATHER     ----------------------------------------------------------------------------------- */

	// function displayWeather(city) {
	// 	//First check if there is any user input or stored city
	// 	if (!queryCity && !cityHistory.length) return;

	// 	// Making query calls to both current and forecast weather asynchronously
	// 	Promise.all([
	// 		$.ajax({
	// 			url: `https://api.openweathermap.org/data/2.5/weather?q=${queryCity ||
	// 				cityHistory[0]}&units=imperial&appid=${apiKey}`,
	// 			method: 'GET'
	// 		}),
	// 		$.ajax({
	// 			url: `https://api.openweathermap.org/data/2.5/forecast?q=${queryCity ||
	// 				cityHistory[0]}&units=imperial&appid=${apiKey}`,
	// 			method: 'GET'
	// 		}).then(function(result) {
	// 			console.log(result[0]);
	// 			$.ajax({
	// 				url: `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${result[0].coord.lat}&lon=${result[0]
	// 					.coord.lon}`,
	// 				method: 'GET'
	// 			}).catch(function(err) {
	// 				console.log(`Error in promises $(err)`);
	// 			});
	// 		})
	// 	]);
	// }
});
