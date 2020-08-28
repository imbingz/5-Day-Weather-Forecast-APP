$(document).ready(function() {


		/* SET GLOBAL VIRABLES
	==================================================================================================== */
	const apiKey = '3019514fb26959aff7eeb1e73e5aa725';

	let searchCity = [];

		/* SET LOCAL STORAGE
	==================================================================================================== */

	function init() {
		//Get Stored cities from localstorage and parseInt string to an Object
		var latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		// If there is exsiting stored data, update the searchCity array
		if (latestSearch !== null) {
			searchCity = latestSearch; 
		} 		
		displaySearchHistory ()
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
		queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity[0] || queryCity}&units=imperial&appid=${apiKey}`
		return queryURL;
	}


	// Forecast URL

	function buildForcastQuery() {
		let queryCity = $('#cityInput').val().trim();
		queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity[0] || queryCity}&units=imperial&appid=${apiKey}`
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
		if (city === "") { return; }; 
		//add city input to the start of the array
		searchCity.unshift(city);
		// delete duplication and only keep  9 latest searches
		searchCity = searchCity.slice(0, 2).filter(onlyUnique);
		sotreSearch();
		displayLocalStorage();	
	}

	displayLocalStorage()
	
	// Use localStorage to display last search
	function displayLocalStorage() {
		let latestSearch = JSON.parse(localStorage.getItem('latestSearch'));
		//Use for loop to dispaly saved search cites 
		if (latestSearch) {
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
			searchCity.unshift(savedCity);
			//Store updated serachCity array
			sotreSearch();

			// displaySearchHistory(savedCity)
			$.ajax({
				url: `https://api.openweathermap.org/data/2.5/weather?q=${savedCity}&units=imperial&appid=${apiKey}`,
				method: 'GET'
			}).then(updateCurrentWeather)
				.catch(function(err) {
				console.log(err);
			});
			// $.ajax({
			// 	url: `https://api.openweathermap.org/data/2.5/forecast?q=${savedCity}&units=imperial&appid=${apiKey}`,
			// 	method: 'GET'
			// }).then(updateForecastPage).catch(function(err) {
				// console.log(err);
			// });
		});
		}	
	}


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

	let uvQueryURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
 
	// Making Query Call to UV Index API 
	$.ajax({
		url: uvQueryURL,
		mathod: 'GET'
	}).then(function(uvData) {
		let uvIndex = uvData.value;
		let currentDay = `
      <div class="card card-panel current">
				<h3 class="card-title" id='cityName'>${cityName}<span><img id="wicon" src="${iconURL}" alt="Weather icon"></span>	</h3>
				<p id="date"><small> ${currentDate} </small></p> 
        <p class="temperature">Temperature: <span id="temperature">${temp} &deg;F</span></p>
        <p class="humidity">Humidity: <span id="humidity">${humidity}%</span></p>
        <p class="windSpeed">Wind Speed: <span id="windSpeed">${windSpeed} MPH</span></p>
        <p class="uv">UV Index: <span id="uv" class="red white-text">${uvIndex}</span></p>        
      </div>
    `;
		$('#main-display').append(currentDay);
	});
}
	
	
/* WARNING MESSAGES ===================================================================================================================================*/
	function noInputWarning() {
	$('#warning').append('<h5 class="red-text center">"Search Field can not be empty!"</h5>')
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
		if (city !== "") {
			clear();
			displaySearchHistory();
			currentQueryCall()

		} else {
			noInputWarning();
		}
	});
});
