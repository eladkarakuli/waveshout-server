module.exports = {
    app: {
        name: 'koaStarterApp',
        version: '0.0.1',
        firebaseUrl: "https://waveshout.firebaseio.com/"
    },
    server: {
        port: 3000,
        forecastApiUrl: "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=fuzzy%20monkey",
        forecastApiKey: "secretKey!",
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