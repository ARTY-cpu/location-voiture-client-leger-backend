const { server } = require('./app');
const routesSocket = require('./router/index.socket');
const PORT: number = parseInt(process.env.PORT!, 10);
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${PORT}`);
});