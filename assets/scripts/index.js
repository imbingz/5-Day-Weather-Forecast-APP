$(document).ready(function() {
	/* SET GLOBAL VIRABLES
	==================================================================================================== */
	const apiKey = '3019514fb26959aff7eeb1e73e5aa725';

	let searchCity = [];

	/* SET LOCAL STORAGE
	==================================================================================================== */

	init();

	function init() {
		//Get Stored cities from localstorage and parseInt string to an Object
		var latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		// If there is exsiting stored data, update the searchCity array
		if (latestSearch !== null) {
			searchCity = latestSearch;
			displayLocalStorage();
			displayStoredCurrent();
			displayStoredForecast();
		}
		
	}

	function storeSearch() {
		//Stringify and set localStorage to searchCity array
		localStorage.setItem('latestSearch', JSON.stringify(searchCity));
	}

	/* BUILD QUERY URL
 =================================================================================================*/

	// Current Weather URL

	function buildCurrentQuery() {
		let queryCity = $('#cityInput').val().trim();
		queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity[0] ||
			queryCity}&units=imperial&appid=${apiKey}`;
		return queryURL;
	}

	// Forecast URL

	function buildForcastQuery() {
		let queryCity = $('#cityInput').val().trim();
		queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity[0] ||
			queryCity}&units=imperial&appid=${apiKey}`;
		return queryURL;
	}

	/* MAMKING QUERY CALLS 
	===================================================================================================================================*/

	// Make Current Weather Query Call

	function currentQueryCall() {
		$.ajax({
			url: buildCurrentQuery(),
			method: 'GET'
		}).then(updateCurrentWeather);
	}

	// Make Forecast Weather query call

	function forecastQueryCall() {
		$.ajax({
			url: buildForcastQuery(),
			method: 'GET'
		}).then(updateForecastPage);
	}

	/* UPDATE PAGE 
	==================================================================================================== */

	// check and remove the duplication of searched cities https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	// Search city history update
	function displaySearchHistory() {
		$('.collection').empty();
		//Get user input data
		let city = $('#cityInput').val().trim();
		//Return early if no city input
		if (city === '') {
			return;
		}
		//add city input to the start of the array
		searchCity.unshift(city);
		// delete duplication and only keep  4 latest searches
		searchCity = searchCity.slice(0, 5).filter(onlyUnique);
		storeSearch();
		displayLocalStorage();
	}

	// Use localStorage to display last search cities
	function displayLocalStorage() {
		clear();
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		
		// delete duplication and only keep  5 latest searches
		latestSearch = latestSearch.slice(0, 5).filter(onlyUnique);
		
		if (latestSearch) {
			//Use for loop to dispaly saved search cites
			for (let i = 0; i < latestSearch.length; i++) {
				let sampleCityLi = `
			    <li class="collection-item grey-text text-darken-1" id="savedCity" data-city="${latestSearch[i]}">${latestSearch[
					i
				].toUpperCase()}
			    </li>
          `;
				$('.collection').append(sampleCityLi);
			}
			
			//Add event handler on saved city li
			$('li').on('click', function() {
				clear();
				let savedCity = $(this).attr('data-city');
				let apiKey = '3019514fb26959aff7eeb1e73e5aa725';
				//Add saved city to searchCity array when user click
				searchCity.unshift(savedCity);
				//Store 
				storeSearch();
				//Make a call to current weather api
				$.ajax({
					url: `https://api.openweathermap.org/data/2.5/weather?q=${savedCity}&units=imperial&appid=${apiKey}`,
					method: 'GET'
				})
					.then(updateCurrentWeather)
					.catch(function(err) {
						console.log(err);
					});

				// Make a call to 5-day forecast API
				$.ajax({
					url: `https://api.openweathermap.org/data/2.5/forecast?q=${savedCity}&units=imperial&appid=${apiKey}`,
					method: 'GET'
				})
					.then(updateForecastPage)
					.catch(function(err) {
						console.log(err);
					});
			});
		}
	}

	// Update current weather using data from query call
	function updateCurrentWeather(cwData) {
		let iconCode = cwData.weather[0].icon;
		let lon = cwData.coord.lon;
		let lat = cwData.coord.lat;
		// Generate UI Index API URL
		let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
		//Making query call to get ui idenx
		$.ajax({
			url: uvQueryURL,
			mathod: 'GET'
		})
			.then(function(uvData) {
				let uvIndex = uvData.value;

				let current = {
					city: cwData.name,
					date: moment().format('ddd, LL'),
					icon: 'https://openweathermap.org/img/w/' + iconCode + '.png',
					temp: cwData.main.temp,
					humidity: cwData.main.humidity,
					windSpeed: cwData.wind.speed,
					uv: uvIndex
				};

				// Check ui index and color label them
				if (current.uv <= 2) {
					let uvColor = '';
					uvColor = 'green accent-3';
				} else if (current.uv <= 5) {
					uvColor = 'yellow accent-2';
				} else if (current.uv <= 7) {
					uvColor = 'orange';
				} else if (current.uv <= 10) {
					uvColor = 'red';
				} else {
					uvColor = 'purple accent-4';
				}

				//set HTML sturcture to append
				let currentDay = `
			<div class="card card-panel current">
				<h3 class="card-title" id='cityName'>${current.city}</h3>
				<P id="date">${current.date}</p> 
				<div><img id="wicon" src="${current.icon}" alt="Weather icon"></div>
        <p class="temperature">Temperature : <span id="temperature">${current.temp} &deg;F</span></p>
        <p class="humidity">Humidity: <span id="humidity">${current.humidity}%</span></p>
        <p class="windSpeed">Wind Speed : <span id="windSpeed">${current.windSpeed} MPH</span></p>
        <p class="uv">UV Index: <span id="uv" class="${uvColor} white-text">${current.uv}</span></p>        
      </div>
		`;
				$('#main-display').append(currentDay);
			})
			.catch(function(err) {
				console.log(err);
			});
	}

	// Use localStorage to display last searched city
	function displayStoredCurrent() {
		clear();
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		if (latestSearch !== null) {
			searchCity[0] = latestSearch[0];
			currentQueryCall();
		}
	}

	// 5-Day Weather Forecast

	function updateForecastPage(wfData) {
		// clear()
		for (let i = 1; i < wfData.list.length; i += 8) {
			// Get info from response data
			let year = wfData.list[i].dt_txt.slice(0, 4);
			let month = wfData.list[i].dt_txt.slice(5, 7);
			let day = wfData.list[i].dt_txt.slice(8, 10);
			let dates = month + '/' + day + '/' + year;
			let iconCode = wfData.list[i].weather[0].icon;
			let iconURL = 'https://openweathermap.org/img/w/' + iconCode + '.png';
			let temp = wfData.list[i].main.temp;
			let humidity = wfData.list[i].main.humidity;

			// Set up HTML structure
			let forecastDay = `
			<div class="col s12 l5ths">
				<div class="card card-panel forecast">
					<h4 class="card-title white-text">${dates}</h4>
					<div class="icon">
						<img id="wicon" src="${iconURL}" alt="Weather icon">
					</div>
					<p class="temperature white-text">
						Temperature : <span id="temperature">${temp} &deg;F</span>
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

	// Use localStorage to display last searched city
	function displayStoredForecast() {
		clear();
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		if (latestSearch !== null) {
			searchCity[0] = latestSearch[0];
			forecastQueryCall();
		}
	}

	/* WARNING MESSAGES
	 ===================================================================================================================================*/

	function noInputWarning() {
		$('#warning').append('<h5 class="red-text center">"Search Field can not be empty!"</h5>');
		// $('#warning').empty();
	}

	/* CLEAR INPUT 
	===================================================================================================================================*/

	function clear() {
		$('#forecast-div').empty();
		$('#main-display').empty();
	}

	/* CLICK HANDLER - ACTOIN STARTS HERE 
	=====================================================================================================================*/

	$('#searchBtn').on('click', function(event) {
		//Prevent form submission and page reload
		event.preventDefault();
		//Save user input to a variable
		let city = $('#cityInput').val().trim();

		// First check if there is a user input
		if (city !== '') {
			$('#warning').empty();
			clear();
			displaySearchHistory();
			currentQueryCall();
			forecastQueryCall();
			$('#cityInput').val('');
		} else {
			noInputWarning();
		}
	});
});
