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



	/* UPDATE PAGE 
	==================================================================================================== */

	// Saved Search City

	let searchCity = [];

	// check and remove the duplication of searched cities 
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
	
	/* CLEAR INPUT ===================================================================================================================================*/

	function clear() {
		$('#forecast-div').empty();
		$('#main-display').empty();
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


	/* CLICK HANDLER - ACTOIN STARTS HERE 
	=====================================================================================================================*/

	$('#searchBtn').on('click', function(event) {
		console.log("button clicked");
		//Prevent form submission and page reload
		event.preventDefault();
		//Save user input to a variable 
		let city = $('#cityInput').val().trim();
		console.log(city);
		console.log($('#warning').text());
		// First check if there is a user input 
		if (city!== "") {
			displaySearchHistory(city);
			currentQueryCall()

		} else {
			$('#warning').append('<h5 class="red-text center">"Search Field can not be empty!"</h5>')
		}
	});
});
