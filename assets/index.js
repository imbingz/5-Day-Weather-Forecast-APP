// add event listener on serach button
// - get the input city from user
// - generate a new URL to make a call to query
// - display the current weahter information in main display area (make sure to clear the display )
// - display 5 day forecact (using a for loop)

//Store search history to local storage 
// display the last search when refresh the app 

// add event listener on ul of search - hisroty -city list (use $(this)) )
// - use data-city value as queryterm to make a call

/* BUILD QUERY URL ---------------------------------------------------------------------------------------------------------------------------------------------------- */





// Forecast URL

function buildForcastQuery() {
	var baseURL = 'https://api.openweathermap.org/data/2.5/forecast?q=';
	var apiKey = '3019514fb26959aff7eeb1e73e5aa725';
	var queryCity = $('#cityInput').val().trim();
	var units = 'imperial';
	var queryURL = baseURL + queryCity + '&units=' + units + '&APPID=' + apiKey;
	return queryURL;
}



/* UPDATE PAGE ---------------------------------------------------------------------------------------------------------------------------------------------------- */

function updateForecastPage(wfData) {
	for (let i = 1; i < wfData.list.length; i += 8) {
		let year = wfData.list[i].dt_txt.slice(0, 4);
		let month = wfData.list[i].dt_txt.slice(5, 7);
		let day = wfData.list[i].dt_txt.slice(8, 10);
		let dates = month + '/' + day + '/' + year;

		let iconCode = wfData.list[i].weather[0].icon;
		let iconURL = 'http://openweathermap.org/img/w/' + iconCode + '.png';
		let temp = wfData.list[i].main.temp;
		let humidity = wfData.list[i].main.humidity;

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

		$('#forecast-div').append(forecastDay);
	}
}

/* CLICK HANDLER ---------------------------------------------------------------------------------------------------------------------------------------------------- */

$('#searchBtn').on('click', function(event) {
	event.preventDefault();

	clear();

	$.ajax({
		url: buildCurrentQuery(),
		method: 'GET'
	}).then(updateCurrentWeather);

	$.ajax({
		url: buildForcastQuery(),
		method: 'GET'
	}).then(updateForecastPage);
});
