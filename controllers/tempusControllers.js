const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler')
const axios = require('axios');

//get all data
const getData = asyncHandler(async (req, res) => {

    // get the city from the app
    const { city } = req.body

    //validate the city
    if (!city) {
        res.status(404);
        throw new Error('City is required');
    }


    // Define your API endpoint
    const apiUrl = process.env.BASE_URL + '/forecast.json';


    // Define the request data
    const requestData = {
        params: {
            key: process.env.TEMPUSKEY,
            q: city,
            days: 6
        },
    };

    // Function to format a date in "Month Day, Year" format
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Function to convert time to 12-hour format
    function formatTime(timeString) {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    }

    // Make a GET request using Axios
    axios.get(apiUrl, requestData)
        .then((response) => {
            // Handle the response data

            // Extract the relevant data for the zone, date and time
            const { tz_id, localtime } = response.data.location;

            // Extract the temperature and the last time it was updated.
            const { last_updated, temp_c, } = response.data.current;

            //Extract the conditions of the temperature
            const { text } = response.data.current.condition;

            // Extract the forecast data
            const forecastDays = response.data.forecast.forecastday;





            // Format the date and time
            const formattedDate = formatDate(localtime);
            const formattedTime = formatTime(localtime);
            const formattedLastUpdatedDate = formatDate(last_updated);
            const formattedLastUpdatedTime = formatTime(last_updated);

            // Iterate through the forecast days
            const dailyTemperatures = forecastDays.map((day) => {
                const date = formatDate(day.date);
                const highTempCelsius = day.day.maxtemp_c;
                const lowTempCelsius = day.day.mintemp_c;

                // Extract the next six hours forecast data for the current day
                const nextSixHoursForecast = day.hour
                    .filter((hourData) => new Date(hourData.time) >= new Date(localtime))
                    .slice(0, 6)
                    .map((hourData) => ({
                        time: formatTime(hourData.time),
                        condition: hourData.condition.text,
                        temp_c: hourData.temp_c,
                    }));

                return {
                    date,
                    highTempCelsius,
                    lowTempCelsius,
                    nextSixHoursForecast,
                };
            });



            // Create an object with the formatted data
            const formattedData = {
                zone: tz_id,
                date: formattedDate,
                time: formattedTime,
                lastUpdatedDate: formattedLastUpdatedDate,
                lastUpdatedTime: formattedLastUpdatedTime,
                temperatureCelsius: temp_c,
                weatherCondition: text
            };

            // Add the daily temperatures to the formatted data
            formattedData.dailyTemperatures = dailyTemperatures;

            // Send the extracted data as a JSON response with a status code of 200
            res.status(200).json(formattedData);
        })
        .catch((error) => {
            // Handle errors
            console.error(error);

        });

})






module.exports = {
    getData,
}