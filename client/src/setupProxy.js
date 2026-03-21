const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            pathRewrite: {
                '^/api': '/api',
            },
            ws: false, // Desabilita o upgrade de WebSocket para o proxy
        })
    );

    app.use(
        '/docs',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: false,
        })
    );
};
