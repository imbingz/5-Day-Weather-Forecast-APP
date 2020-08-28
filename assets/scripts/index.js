$(document).ready(function() {
	/* BUILD QUERY URL
 =================================================================================================*/

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

	/* MAKE QUERY CALLS
 =================================================================================================*/

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

	// Saved Search City

	let searchCity = [];

	// check and remove the duplication
	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	// Search city history update
	function displaySearchHistory(city) {
		//Get user input data
		city = $('#cityInput').val().trim();
		//Check
		if (city) {
			$('.collection').empty();
			//add city input to the start of the array
			searchCity.unshift(city);
			// delete duplication and only keep  9 latest searches
			var latestSearch = searchCity.slice(0, 9).filter(onlyUnique);

			// Set local storage to save latest search array
			localStorage.setItem('latestSearch', JSON.stringify(latestSearch));

			latestSearch = JSON.parse(localStorage.getItem('latestSearch'));

			displayLocalStorage();
		}
	}

	// Use localStorage to display last search
	function displayLocalStorage() {
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		
		if (latestSearch !==[]) {
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
			$.ajax({
				url: `https://api.openweathermap.org/data/2.5/weather?q=${savedCity}&units=imperial&appid=${apiKey}`,
				method: 'GET'
			}).then(updateCurrentWeather);
			$.ajax({
				url: `https://api.openweathermap.org/data/2.5/forecast?q=${savedCity}&units=imperial&appid=${apiKey}`,
				method: 'GET'
			}).then(updateForecastPage);
		});
		}
		
	}
	displayLocalStorage();

	function updateCurrentWeather(cwData) {
		var apiKey = '3019514fb26959aff7eeb1e73e5aa725';
		// let cityName = cwData.name;
		// let currentDate = moment().format('MM/DD/YYYY');
		let iconCode = cwData.weather[0].icon;
		// let iconURL = 'http://openweathermap.org/img/w/' + iconCode + '.png';
		// let temp = cwData.main.temp;
		// let humidity = cwData.main.humidity;
		// let windSpeed = cwData.wind.speed;
		let lon = cwData.coord.lon;
		let lat = cwData.coord.lat;
		// let id = cwData.sys.id

		let uvQueryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

		$.ajax({
			url: uvQueryURL,
			mathod: 'GET'
		}).then(function(uvData) {
			let uvColor = '';
			let uvIndex = uvData.value;

			let query = {
				city: cwData.name,
				date: moment().format('ddd, LL'),
				icon: 'http://openweathermap.org/img/w/' + iconCode + '.png',
				temp: cwData.main.temp,
				humidity: cwData.main.humidity,
				windSpeed: cwData.wind.speed,
				uv: uvIndex
			};

			if (query.uv <= 2) {
				uvColor = 'green';
				console.log(uvColor);
			} else if (query.uv <= 5) {
				uvColor = 'yellow';
			} else if (query.uv <= 7) {
				uvColor = 'orange';
			} else if (query.uv <= 10) {
				uvColor = 'red';
			} else {
				uvColor = 'voilet';
			}

			localStorage.setItem('query', JSON.stringify(query));

			let lastQuery = JSON.parse(localStorage.getItem('query'));

			let currentDay = `
      <div class="card card-panel current">
				<h3 class="card-title" id='cityName'>${lastQuery.city}</h3>
				<P id="date">${lastQuery.date}</p> 
				<div><img id="wicon" src="${lastQuery.icon}" alt="Weather icon"></div>
        <p class="temperature">Temperature: <span id="temperature">${lastQuery.temp} &deg;F</span></p>
        <p class="humidity">Humidity: <span id="humidity">${lastQuery.humidity}%</span></p>
        <p class="windSpeed">Wind Speed: <span id="windSpeed">${lastQuery.windSpeed} MPH</span></p>
        <p class="uv">UV Index: <span id="uv" class="${uvColor} white-text">${lastQuery.uv}</span></p>        
      </div>
		`;

			$('#main-display').append(currentDay);
		});
	}

	// let uvColor = '';
	// function uvIndexData(uvData) {
			
	// 		let query = {
	// 			city: cwData.name,
	// 			date: moment().format('ddd, LL'),
	// 			icon: 'http://openweathermap.org/img/w/' + iconCode + '.png',
	// 			temp: cwData.main.temp,
	// 			humidity: cwData.main.humidity,
	// 			windSpeed: cwData.wind.speed,
	// 			uv: uvData.value
	// 		};
			
	// 		//Check uvIndex and color label uv 
	// 		if (query.uv <= 2) {
	// 			uvColor = 'green';
	// 			console.log(uvColor);
	// 		} else if (query.uv <= 5) {
	// 			uvColor = 'yellow';
	// 		} else if (query.uv <= 7) {
	// 			uvColor = 'orange';
	// 		} else if (query.uv <= 10) {
	// 			uvColor = 'red';
	// 		} else {
	// 			uvColor = 'voilet';
	// 		}

	// 		localStorage.setItem('query', JSON.stringify(query));
	// 		storedCurrentDisplay();

	// }
	// Display current weather from localStorage


	// function storedCurrentDisplay() {
		
	// 	let lastQuery = JSON.parse(localStorage.getItem('query'));

	// 		let currentDay = `
  //     <div class="card card-panel current">
	// 			<h2 class="card-title" id='cityName'>${lastQuery.city}</h2>
	// 			<P id="date">${lastQuery.date}</p> 
	// 			<div><img id="wicon" src="${lastQuery.icon}" alt="Weather icon"></div>
  //       <p class="temperature">Temperature: <span id="temperature">${lastQuery.temp} &deg;F</span></p>
  //       <p class="humidity">Humidity: <span id="humidity">${lastQuery.humidity}%</span></p>
  //       <p class="windSpeed">Wind Speed: <span id="windSpeed">${lastQuery.windSpeed} MPH</span></p>
  //       <p class="uv">UV Index: <span id="uv" class="${uvColor} white-text">${lastQuery.uv}</span></p>        
  //     </div>
	// 	`;

	// 		$('#main-display').append(currentDay);
	// }

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

		let city = $('#cityInput').val().trim();

		displaySearchHistory(city);

		if (city) {
			//Clear the display before calling query
			clear();

			currentQueryCall();

			forecastQueryCall();
		}
	});
});
