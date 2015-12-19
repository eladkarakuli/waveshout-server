'use strict';

let wwoInterpreter = function(data){
  try {
    data = data.data;
    var date = data.weather[0].date,
        maxtempC = data.weather[0].maxtempC,
        reports = [];

    reports = data.weather[0].hourly.map((hourlyData) => {
      return {
        time: hourlyData.time,
        swellHeight: hourlyData.swellHeight_m,
        tempC: hourlyData.tempC,
        waterTemp: hourlyData.waterTemp_C,
        winddirDegree: hourlyData.winddirDegree,
        windspeedKmph: hourlyData.windspeedKmph
      };
    });
    
    return { 
      date: date,
      maxtempC: maxtempC,
      reports: reports
    };
  }
  catch (e) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    console.error("wwo parser error: ", e);
    return undefined;
  }
};

let interpreteForecast = function(data) {
  return wwoInterpreter(data);
}

module.exports = {
  interpreteForecast
}
