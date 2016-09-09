var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var morgan = require("morgan");
var path = require("path");
var exec = require('child_process').exec;
var fs = require('fs');
var bodyParser = require("body-parser");
var df = require("node-df");
var spawn = require('child_process').spawn;

const auswerfenButtonParat = '<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
const auswerfenButtonBusy = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
const auswerfenButtonDisabled = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
const kopierenButtonParat = '<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
const kopierenButtonBusy = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><div style="vertical-align:middle;" class="loader"></div></button>';
const kopierenButtonDisabled = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
const videoButtonParat = '<button title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
const videoButtonBusy = '<button disabled="disabled" title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
const videoButtonDisabled = '<button disabled="disabled" title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
const videoButtonRecording = '<button title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-record"></span></button>';
const fotoButtonParat = '<button title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';
const fotoButtonBusy = '<button disabled="disabled" title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
const fotoButtonDisabled = '<button disabled="disabled" title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';

//app.use(express.static(path.resolve(__dirname, "/public")));

app.use('/', express.static(__dirname + '/public'));

var
    options = {
        file: '/home',
        prefixMultiplier: 'MB',
        isDisplayPrefixMultiplier: true,
        precision: 2
    };

df(options, function(error, response) {
    if (error) {
        throw error;
    }

    console.log(JSON.stringify(response, null, 2));
});

var medienOrdnerInhalt = [];
var picToCopyString;
var gesicherteMedien = [];
var zuKopierendeMedien;

var buttons = [{
    "name": "auswerfenButton",
    "state": auswerfenButtonDisabled
}, {
    "name": "videoButton",
    "state": videoButtonDisabled
}, {
    "name": "kopierenButton",
    "state": kopierenButtonDisabled
}, {
    "name": "fotoButton",
    "state": fotoButtonDisabled
}];

var systemStatus = {
    buttons: buttons,
    usbOK: false,
    hatBilder: false,
    kameraOK: true,
    fotoMachen: false,
    videoMachen: false,
    amKopieren: false,
    medien: medienOrdnerInhalt,
    geloeschtesBild: "leer",
    kopiertesBild: "leer",
    gemachtesMedium: "leer",
    videoModus: false,
    videoGestartet: false,
    fotoModus: true
};

var validateButtons = function(state) {
    switch (state) {
        case "amKopieren":
            buttons[0].state = auswerfenButtonDisabled;
            buttons[1].state = videoButtonDisabled;
            buttons[2].state = kopierenButtonBusy;
            buttons[3].state = fotoButtonDisabled;
            break;
        case "amFotoMachen":
            buttons[0].state = auswerfenButtonDisabled;
            buttons[1].state = videoButtonDisabled;
            buttons[2].state = kopierenButtonDisabled;
            buttons[3].state = fotoButtonBusy;
            break;
        case "amVideoMachen":
            buttons[0].state = auswerfenButtonDisabled;
            buttons[1].state = videoButtonRecording;
            buttons[2].state = kopierenButtonDisabled;
            buttons[3].state = fotoButtonDisabled;
            break;
        case "keinUSB":
            buttons[0].state = auswerfenButtonDisabled;
            buttons[1].state = systemStatus.fotoModus ? videoButtonDisabled : videoButtonParat;
            buttons[2].state = kopierenButtonDisabled;
            buttons[3].state = systemStatus.videoModus ? fotoButtonDisabled : fotoButtonParat;
            break;
        case "keineMedien":
            buttons[0].state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
            buttons[1].state = systemStatus.fotoModus ? videoButtonDisabled : videoButtonParat;
            buttons[2].state = kopierenButtonDisabled;
            buttons[3].state = systemStatus.videoModus ? fotoButtonDisabled : fotoButtonParat;
            break;
        case "OK":
            buttons[0].state = systemStatus.usbOK ? auswerfenButtonParat : auswerfenButtonDisabled;
            buttons[1].state = systemStatus.fotoModus ? videoButtonDisabled : videoButtonParat;
            buttons[2].state = systemStatus.usbOK && systemStatus.hatBilder ? kopierenButtonParat : kopierenButtonDisabled;
            buttons[3].state = systemStatus.videoModus ? fotoButtonDisabled : fotoButtonParat;
            break;
    }
};

// pi '/home/pi/git/Kamera/public/pictures/'
// OSX '/Users/bossival/git/Kamera/public/pictures/'
const pathToMediaFolder = '/home/pi/git/Kamera/public/pictures/';
var arrayOfPictures;
var objectOfPicturesArray = [];
const usbStick = "/media/usb0";

//Makes this entries array available in all views
app.locals.systemStatus = systemStatus;
// argumente noch optimieren!!!
var fotoArgs = ["-t", "0", "-k", "-o", pathToMediaFolder + "bild.jpg", "-v"];
var videoArgs = ["-t", "0", "-k", "-i", "pause", "-o", pathToMediaFolder + "video.h264", "-v"]
var raspivid;
//const raspistill = spawn('python', ['cam.py']);
var raspistill;


var kameraModus = function(modus) {
    console.log("kameraModus modus", modus);
    if (modus === "foto") {
        raspistill = spawn('raspistill', fotoArgs);
        systemStatus.fotoModus = true;
        systemStatus.videoModus = false;
        validateButtons("OK");
    }
    if (modus === "video") {
        //beende raspistill, wenn vorhanden ordentlich
        raspivid = spawn('raspivid', videoArgs);
        raspivid.stderr.once('data', (data) => {
    console.log(`raspistill stderr: ${data}`);
});
        console.log("sollte raspivid starten!");
        systemStatus.videoModus = true;
        systemStatus.fotoModus = false;
        validateButtons("OK");
    }
};
kameraModus("foto");
raspistill.stderr.once('data', (data) => {
    console.log(`raspistill stderr: ${data}`);
});

// OSX 'diskutil list | grep "FAT32"'
// pi 'mount | grep "vfat"'
var usbCheck = function() {
    exec('mount | grep "/media/usb0"', function(error, stdout, stderr) {
        if (stdout.length > 0) {
            systemStatus.usbOK = true;
        } else {
            systemStatus.usbOK = false;
        }
        //console.log('stdout ' + stdout);
        //console.log('stderr ' + stderr);
        if (error !== null) {
            console.log('exec error mount: ' + error);
            systemStatus.usbOK = false;
        }
    });
}
usbCheck();

var zeitstempel = function() {
    full = new Date();
    sekunde = full.getSeconds();
    minute = full.getMinutes();
    stunde = full.getHours();
    jahr = full.getFullYear();
    monat = full.getMonth() + 1;
    tag = full.getDate();
    return jahr + "_" + monat + "_" + tag + "_" + stunde + "_" + minute + "_" + sekunde;
};

app.set("view engine", "ejs");

app.set("views", path.resolve(__dirname, "views"));

/**
app.use(bodyParser.urlencoded({
	extended: false
}));**/

app.use(morgan("short"));

io.on('connection', function(client) {
    console.log('Kamera connected...');
    //console.log(client.id);
    //console.log(io.sockets.clients().connected);


    client.on('kameraModus', function(modus) {
        if(modus === "foto"){
            raspivid.stdin.write("x\n");
            console.log("killed vid");

        }
        if(modus === "video"){
            raspistill.stdin.write("x\n");
            console.log("killed still");
        }
        
        
        setTimeout(function(){
            fs.unlink(pathToMediaFolder + "bild.jpg", function(){
                kameraModus(modus);
                client.emit('kameraModus', systemStatus);
            });
        },2000);
            console.log("emit kameraModus");
    });

    //OK
    //Bild loeschen
    client.on('bildLoeschen', function(bild) {
        console.log(bild);
        var pathToPicture = pathToMediaFolder + bild;
        exec('rm -rf ' + pathToPicture, function(error, stdout, stderr) {
            console.log('stdout ' + stdout);
            console.log('stderr ' + stderr);
            if (error !== null) {
                console.log('exec error rm: ' + error);
            } else {
                console.log("Bild wurde gelöscht: ", bild);
                fs.readdir(pathToMediaFolder, function(err, list) {
                    medienOrdnerInhalt = [];
                    list.forEach(function(pic) {
                        medienOrdnerInhalt.push({
                            name: pic
                        });
                    });
                    app.locals.pictures = medienOrdnerInhalt;
                    systemStatus.medien = medienOrdnerInhalt;
                    systemStatus.geloeschtesBild = bild;
                    if (medienOrdnerInhalt.length == 0) {
                        systemStatus.hatBilder = false;
                        validateButtons("keineMedien");
                    } else {
                        systemStatus.hatBilder = true;
                        //OK ist es wirklich nur, wenn nichts aufgenommen wird!
                        //kann während video/fotoaufnahmen zu falschen Buttons führen!
                        validateButtons("OK");
                    }
                    //console.log(medienOrdnerInhalt);
                    client.emit('bildLoeschen', systemStatus);
                });
            }
        });
    });

    //OK
    //Datentraeger auswerfen
    client.on('datentraegerAuswerfen', function() {
        // pi 'sudo umount /media/usb0'
        // OSX diskutil umountDisk /dev/disk3
        exec('sudo umount /media/usb0', function(error, stdout, stderr) {
            console.log('stdout ' + stdout);
            console.log('stderr ' + stderr);
            if (error !== null) {
                console.log('exec error umount: ' + error);
                // zu implementieren!!!!!!!!!!!!
                //systemStatus.usbOK = true;
                //validateButtons("state")
                //console.log(systemStatus);
                //client.emit('datentraegerAuswerfen', systemStatus);
            } else {
                systemStatus.usbOK = false;
                validateButtons("keinUSB");
                client.emit('datentraegerAuswerfen', systemStatus);
            }
        });
    });

    //Video machen
    client.on('videoMachen', function(data) {
        if (data === "start") {
            raspivid.stdin.write("\n");
            raspivid.stderr.on('data', (data) => {

            console.log(`raspistill stderr: ${data}`);
        });
            systemStatus.amVideoMachen = true;
            systemStatus.videoGestartet = true;
            validateButtons("amVideoMachen");
            console.log(systemStatus);
            client.emit('videoMachen', systemStatus);
        }
        if (data === "stop") {
            raspivid.stdin.write("x\n");
            raspivid.stderr.on('data', (data) => {

            console.log(`raspistill stderr: ${data}`);
        });
            systemStatus.amVideoMachen = false;
            systemStatus.videoGestartet = false;
            validateButtons("OK");
            //console.log(systemStatus);
            systemStatus.gemachtesMedium = "video.h264";
            setTimeout(function(){
                client.emit('videoMachen', systemStatus);
            },2000);
        }
    });

    //Auf Datentraeger kopieren
    client.on('aufDatentraegerSpeichern', function(data) {
        systemStatus.amKopieren = true;
        validateButtons("amKopieren");
        zuKopierendeMedien = Object.create(medienOrdnerInhalt);
        console.log("am Kopieren");
        var kopieren = function() {
            bildZumKopieren = zuKopierendeMedien.pop().name;
            exec("sudo cp " + pathToMediaFolder + bildZumKopieren + " " + usbStick, function(error, stdout, stderr) {
                console.log('stdout ' + stdout);
                console.log('stderr ' + stderr);
                if (error !== null) {
                    //zu implementieren!!!!!!!!
                    console.log('exec error copy to usb stick: ' + error);
                } else {
                    console.log("bild wurde kopiert!", bildZumKopieren);
                    systemStatus.kopiertesBild = bildZumKopieren;
                    if (zuKopierendeMedien.length > 0) {
                        client.emit('aufDatentraegerSpeichern', systemStatus);
                        kopieren();
                    } else {
                        systemStatus.amKopieren = false;
                        validateButtons("OK");
                        client.emit('aufDatentraegerSpeichern', systemStatus);
                        console.log("fertig kopiert!");
                    }
                }
            });
        };
        kopieren();
    });


    // performance verbessern!!!!!!!!!!!!!!
    //Foto machen
    client.on('fotoMachen', function(data) {
        systemStatus.amFotoMachen = true;
        raspistill.stdin.write("\n");
        var bildname = zeitstempel() + ".jpg";


        // stderr wird von raspistill als standart output verwendet! anstatt stdout! 
        raspistill.stderr.on('data', (data) => {

            console.log(`raspistill stderr: ${data}`);
        });
        //timeout, weil stderr im intervall ausgiebt und das unberechenbar ist! und es mehr sicherheit gibt, dass das bild fertig auf die sd geschrieben worden ist!
        setTimeout(function() {
            exec('mv ' + pathToMediaFolder + "bild.jpg " + pathToMediaFolder + bildname, function(error, stdout, stderr) {
                console.log('stdout ' + stdout);
                console.log('stderr ' + stderr);
                if (error !== null) {
                    console.log('exec error mv: ' + error);
                    systemStatus.amFotoMachen = false;
                } else {
                    medienOrdnerInhalt.push({
                        name: bildname
                    });
                    systemStatus.amFotoMachen = false;
                    systemStatus.gemachtesMedium = bildname;
                    systemStatus.hatBilder = true;
                    validateButtons("OK");
                    console.log(medienOrdnerInhalt);
                    client.emit('fotoMachen', systemStatus);
                }
            });
        }, 1000);

        raspistill.on('close', (code) => {
            if (code !== 0) {
                console.log(`raspistill process exited with code ${code}`);
                //client.emit('fotoMachen', {"status": "close", "message": code});
            }
        });
        /**
        console.log(data);
        systemStatus.amFotoMachen = true;
        // pi
        raspistill.stdin.write("\n");


        raspistill.stdout.on('data', function(data) {
            console.log(data);
        });
        raspistill.stdout.on('end', function() {
            console.log('Sum of numbers=');
        });
        //raspistill.stdin.end();

        
        //console.log("hallo?!");
            //console.log(`raspistill stderr: ${data}`);
        //});

        var bildname = zeitstempel() + ".jpg";
        raspistill.stderr.pipe(process.stdout);
        // stderr wird von raspistill als standart output verwendet! anstatt stdout!
        //var stream = raspistill.stderr.pipe(process.stdout);
        //stream.on('finish', function(){
        //	console.log("hallooooo");
        //});
        //timeout, weil stderr im Intervall ausgiebt und das unberechenbar ist! und es mehr sicherheit gibt, dass das bild fertig auf die sd geschrieben worden ist!
        setTimeout(function() {
            exec('mv ' + pathToMediaFolder + "bild.jpg " + pathToMediaFolder + bildname, function(error, stdout, stderr) {
                console.log('stdout ' + stdout);
                console.log('stderr ' + stderr);
                if (error !== null) {
                    console.log('exec error mv: ' + error);
                    systemStatus.amFotoMachen = false;
                } else {
                    medienOrdnerInhalt.push({
                        name: bildname
                    });
                    systemStatus.amFotoMachen = false;
                    systemStatus.gemachtesMedium = bildname;
                    systemStatus.hatBilder = true;
                    validateButtons("OK");
                    //console.log(medienOrdnerInhalt);
                    client.emit('fotoMachen', systemStatus);
                }
            });
        }, 2000);

        raspistill.on('close', (code) => {
            if (code !== 0) {
                console.log(`raspistill process exited with code ${code}`);
                //client.emit('fotoMachen', {"status": "close", "message": code});
            }
        });**/
    });

    //Status senden
    client.on('status', function() {
        if (systemStatus.usbOK) {
            validateButtons("OK");
        }
        if (systemStatus.amKopieren) {
            validateButtons("amKopieren");
        }
        if (systemStatus.amVideoMachen) {
            validateButtons("amVideoMachen")
        }
        if (systemStatus.amFotoMachen) {
            validateButtons("amFotoMachen");
        }
        client.emit('status', systemStatus);
        //console.log(systemStatus);
    });

});

app.get('/', function(reg, res) {
    usbCheck();
    fs.readdir(pathToMediaFolder, function(err, list) {
        medienOrdnerInhalt = [];
        list.forEach(function(pic) {
            medienOrdnerInhalt.push({
                name: pic
            });
        });
        systemStatus.hatBilder = medienOrdnerInhalt.length > 0 ? true : false;
        //console.log(systemStatus);
        //console.log(medienOrdnerInhalt);
        app.locals.pictures = medienOrdnerInhalt;
        systemStatus.medien = medienOrdnerInhalt;
        // um usbCheck() erkennen zu koennen!
        setTimeout(function() {
            res.render('pages/index');
        }, 100);
    });
});

app.get('/:picture', function(reg, res) {
    res.download(pathToMediaFolder + reg.params.picture);
});
//console.log(fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log')));

server.listen(3000);
