const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    port = 8080,
    amqp = require('amqplib/callback_api');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(port, function () {
    console.log('listening on *:8080');
});

let readFromSocket = (base64, callback) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, ch) => {
            ch.assertQueue('', {exclusive: true}, (err, q) => {
                let corr = generateUuid();
                ch.consume(q.queue, msg => {
                    if (msg.properties.correlationId === corr) {
                        callback(msg).then(function () {
                            conn.close();
                        });
                    }
                }, {noAck: true});
                ch.sendToQueue('image.check', new Buffer(base64), {correlationId: corr, replyTo: q.queue});
            });
        });
    });
};

function generateUuid() {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

io.on('connection', function (socket) {
    socket.on('img', function (base64) {
        readFromSocket(base64.replace(/^data:image\/(png|jpeg);base64,/, ""), msg => {
            return new Promise((resolve) => {
                socket.emit("response", msg.content.toString());
                resolve();
            });
        });
    })
});



