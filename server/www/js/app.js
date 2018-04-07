let socket = io.connect(location.origin),
    img = new Image(),
    canvasFace = document.getElementById('canvas-face'),
    context = canvasFace.getContext('2d'),
    canvas = document.getElementById('canvas'),
    width = 640,
    height = 480,
    delay = 800,
    jpgQuality = 0.6,
    isHappy = false;

socket.on('response', function (r) {
    let data = JSON.parse(r);
    if (data.length > 0 && data[0].hasOwnProperty('emotion')) {
        if (isHappy === false && data[0]['emotion'] === 'happy') {
            isHappy = true;
            swal({
                title: "Good!",
                text: "All is better with one smile!",
                icon: "success",
                buttons: false,
                timer: 2000,
            });

            $('#nonHappy').hide();
            $('#video').hide();
            $('#happyForm').show();
            $('#smile')[0].src = 'data:image/png;base64,' + data[0].image;
        }

        img.onload = function () {
            context.drawImage(this, 0, 0, canvasFace.width, canvasFace.height);
        };

        img.src = 'data:image/png;base64,' + data[0].image;
    }
});

navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

navigator.getMedia({video: true, audio: false}, (mediaStream) => {
    let video = document.getElementsByTagName('video')[0];
    video.src = window.URL.createObjectURL(mediaStream);
    video.play();
    setInterval(((video) => {
        return function () {
            let context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            socket.emit('img', canvas.toDataURL('image/jpeg', jpgQuality));
        }
    })(video), delay)
}, error => console.log(error));

$(() => {
    $('#login').click(() => {
        $('#login-page').hide();
        $('#private').show();
    })
});