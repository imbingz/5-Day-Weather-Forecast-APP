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
		}
		displayLocalStorage();
		displayStoredCurrent();
		displayStoredForecast();
	}

	function sotreSearch() {
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

	/* MAMKING QUERY CALLS ===================================================================================================================================*/

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

	// check and remove the duplication of searched cities
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
		// delete duplication and only keep  9 latest searches
		searchCity = searchCity.slice(0, 9).filter(onlyUnique);
		sotreSearch();
		displayLocalStorage();
	}

	// displayLocalStorage();

	// Use localStorage to display last search cities
	function displayLocalStorage() {
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		//Use for loop to dispaly saved search cites
		if (latestSearch) {
			// delete duplication and only keep  9 latest searches
			latestSearch = latestSearch.slice(0, 9).filter(onlyUnique);
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
			$('ul').on('click','li', function() {
				clear();
				let savedCity = $(this).attr('data-city');
				let apiKey = '3019514fb26959aff7eeb1e73e5aa725';
				searchCity.unshift(savedCity);
				//Store updated serachCity array
				sotreSearch();

				// displaySearchHistory(savedCity)
				$.ajax({
					url: `https://api.openweathermap.org/data/2.5/weather?q=${savedCity}&units=imperial&appid=${apiKey}`,
					method: 'GET'
				})
					.then(updateCurrentWeather)
					.catch(function(err) {
						console.log(err);
					});
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
					uvColor = 'green';
				} else if (current.uv <= 5) {
					uvColor = 'yellow';
				} else if (current.uv <= 7) {
					uvColor = 'orange';
				} else if (current.uv <= 10) {
					uvColor = 'red';
				} else {
					uvColor = 'voilet';
				}

				let currentDay = `
			<div class="card card-panel current">
				<h3 class="card-title" id='cityName'>${current.city}</h3>
				<P id="date">${current.date}</p> 
				<div><img id="wicon" src="${current.icon}" alt="Weather icon"></div>
        <p class="temperature">Temperature: <span id="temperature">${current.temp} &deg;F</span></p>
        <p class="humidity">Humidity: <span id="humidity">${current.humidity}%</span></p>
        <p class="windSpeed">Wind Speed: <span id="windSpeed">${current.windSpeed} MPH</span></p>
        <p class="uv">UV Index: <span id="uv" class="${uvColor} white-text">${current.uv}</span></p>        
      </div>
		`;
				$('#main-display').append(currentDay);
			})
			.catch(function(err) {
				console.log(err);
			});
	}

	// displayStoredCurrent();

	// Use localStorage to display last searched city
	function displayStoredCurrent() {
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		if (latestSearch !== null) {
			searchCity[0] = latestSearch[0];
			currentQueryCall();
		}
	}

	// 5-Day Weather Forecast

	function updateForecastPage(wfData) {
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
				<div class="card card-panel forecast  indigo accent-3">
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

	// displayStoredForecast();

	// Use localStorage to display last searched city
	function displayStoredForecast() {
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		if (latestSearch !== null) {
			searchCity[0] = latestSearch[0];
			forecastQueryCall();
		}
	}

	/* WARNING MESSAGES ===================================================================================================================================*/
	function noInputWarning() {
		$('#warning').append('<h5 class="red-text center">"Search Field can not be empty!"</h5>');
	}

	/* CLEAR INPUT ===================================================================================================================================*/

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
			clear();
			displaySearchHistory();
			currentQueryCall();
			forecastQueryCall();
		} else {
			noInputWarning();
		}
	});
});
