"use strict";

import * as wwoInterpreter from './forcast-api-interpreters/wwo-interpreter';
import { check } from './utils';
import { Forecasts } from './db';

var request = require('request');
var TEN_SEC = 10000;

let isValidResponse = (response) => {
  if (response !== undefined && response.statusCode === 200) {
    return true;
  } 

  return false;
}

let handleResponseBody = (body) => {
  return(JSON.parse(body));
}

let fetcher = function(url){
  check(url, String);

  return new Promise((resolve, reject) => {
    request(url, {timeout:TEN_SEC}, function(error, response, body) {
      try {
        if (error) {
          reject(error);
        } else if(!isValidResponse(response)) {
          reject(`faild response for url:${url} response:${response} body:${body}`);
        }

        resolve(handleResponseBody(body));
      } catch(err) {
        reject(err);
      }
    });
  });
};

let interpreteData = function(data) {
  let forecast = wwoInterpreter.interpreteForecast(data);

  if (forecast === undefined) {
    throw("faild to interprete data: " + data);
  }

  return forecast;
};

let assignData  = function(respJson, data) {
  return Object.assign(respJson, data, {requestDate: new Date()});
}

let fetch = function(url) {
  return fetcher(url);
}

let saveFetch = (respJson, spotName) => {
  try {
    if (respJson === undefined || !respJson.hasOwnProperty('data')) {
      throw new Error(`[${respJson.responseStatus}] Faild to save response for spot: ${spotName}`);
    }

    let forecast = interpreteData(respJson);
    forecast = assignData(forecast, { spotName });
    Forecasts.update(forecast);
    console.log(spotName, "fetch saved.");
  }
  catch (e) {
    console.error("faild saving a fetch for spot", spotName, e);
  }
}

module.exports = {
  fetch,
  saveFetch
}

