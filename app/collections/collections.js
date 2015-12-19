Forecasts = new Mongo.Collection("forecasts");
Forecasts._ensureIndex({date: 1, spotName: 1}, {unique: 1});