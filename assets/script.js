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
