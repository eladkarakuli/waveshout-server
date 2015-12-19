module.exports = {
    app: {
        name: 'koaStarterApp',
        version: '0.0.1',
        firebaseUrl: "https://waveshout.firebaseio.com/"
    },
    server: {
        port: 3000,
        forecastApiUrl: "http://api.worldweatheronline.com/free/v2/marine.ashx",
        forecastApiKey: "49d21cbf01b52a5ef55673aa143be",
        forecastFetchInterval: 3600000
    },
    template: {
        path: 'app/views',
        options: {
            map: { ect: 'ect' }
        }
    },
    session: {
        secretKey: 'myKoajsSecretKey'
    }
};