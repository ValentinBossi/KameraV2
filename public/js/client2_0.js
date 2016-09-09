 var main = function() {

     var auswerfenButtonParat = '<button title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
     var auswerfenButtonBusy = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
     var auswerfenButtonDisabled = '<button disabled="disabled" title="Datenträger auswerfen" id="datentraegerAuswerfen" style="position: absolute; top: 25px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #bc4b51;" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-eject"></span><br>USB</button>';
     var kopierenButtonParat = '<button title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
     var kopierenButtonBusy = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><div style="vertical-align:middle;" class="loader"></div></button>';
     var kopierenButtonDisabled = '<button disabled="disabled" title="Medien auf Datenträger speichern" id="aufDatentraegerSpeichern" style="position: absolute; top: 212px; left:50%; margin-left: -50px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" class="btn btn-default" id="aufUsbSpeichern"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-save"></span><br>Speichern</button>';
     var videoButtonParat = '<button title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
     var videoButtonBusy = '<button disabled="disabled" title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
     var videoButtonDisabled = '<button disabled="disabled" title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-facetime-video"></span></button>';
     var videoButtonRecording = '<button title="Video aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: 50px; width: 100px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="videoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-record"></span></button>';
     var fotoButtonParat = '<button title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';
     var fotoButtonBusy = '<button disabled="disabled" title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><div style="vertical-align:middle;" class="loader"></div></button>';
     var fotoButtonDisabled = '<button disabled="disabled" title="Foto aufnehmen" style="position: absolute; top: 117px; left:50%; margin-left: -150px; width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color: #f4a259;" id="fotoMachen" class="btn btn-default"><span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-camera"></span></button>';


     var socket = io.connect('/');

     var systemStatusClient;

     var datentraegerAuswerfen = function() {
         $("#datentraegerAuswerfen").on('click', function() {
             socket.emit('datentraegerAuswerfen', "sollte auswerfen");
             $(this).replaceWith(auswerfenButtonBusy);
             $("#videoMachen").replaceWith(videoButtonDisabled);
             $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
             $("#fotoMachen").replaceWith(fotoButtonDisabled);
         });
     };
     socket.on('datentraegerAuswerfen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
     });

     var videoMachen = function() {
         $("#videoMachen").on('click', function() {
             if (systemStatusClient.videoGestartet) {
                 socket.emit('videoMachen', "stop");
                 clearInterval(interval);
                 $(this).replaceWith(videoButtonBusy);
                 activateLoeschen();
             }
             if (!systemStatusClient.videoGestartet) {
                 startTimer();
                 socket.emit('videoMachen', "start");
                 $(this).replaceWith(videoButtonBusy);
                 $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
                 $("#fotoMachen").replaceWith(fotoButtonDisabled);
                 $("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
                 disableLoeschen();
             }
         });
     };
     socket.on('videoMachen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         console.log(systemStatusClient);
         //muss noch implementiert werden!!!!
         if(!systemStatusClient.amVideoMachen){
            mediumHinzufuegen(systemStatusClient.gemachtesMedium);
            setTimeout(function(){
loeschen();
            }, 1000);
            
         }
         
         appCheck(systemStatusClient);
     });

     var aufDatentraegerSpeichern = function() {
         $("#aufDatentraegerSpeichern").on('click', function() {
             socket.emit('aufDatentraegerSpeichern', "sollte kopieren");
             $(this).replaceWith(kopierenButtonBusy);
             $("#fotoMachen").replaceWith(fotoButtonDisabled);
             $("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
             $("#videoMachen").replaceWith(videoButtonDisabled);
             $("[name='loeschen']").each(function() {
                 $(this).prop('disabled', true);
             });
             for (var i = 0; i < systemStatusClient.medien.length; i++) {
                 aufSpeicherListeBildHinzufuegen(systemStatusClient.medien[i].name);
             }
             $("#speichernPanel").slideDown(500);
         });
     };
     socket.on('aufDatentraegerSpeichern', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         $("[name='loeschen']").each(function() {
             $(this).prop('disabled', false);
         });
         if (systemStatusClient.amKopieren) {
             speicherIconAendern(systemStatusClient.kopiertesBild);
         } else {
             speicherIconAendern(systemStatusClient.kopiertesBild);
             setTimeout(function() {
                 $("#speichernPanel").slideUp(500, function() {
                     for (var i = 0; i < systemStatusClient.medien.length; i++) {
                         aufSpeicherListeBildLoeschen(systemStatusClient.medien[i].name);
                     }
                 });
             }, 500);
         }
         appCheck(systemStatusClient);
     });

     var fotoMachen = function() {
         $("#fotoMachen").on('click', function() {
             socket.emit('fotoMachen', "sollte foto machen");
             $(this).replaceWith(fotoButtonBusy);
             $("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
             $("#videoMachen").replaceWith(videoButtonDisabled);
             $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
         });
     };
     socket.on('fotoMachen', function(systemStatusServer) {
         systemStatusClient = systemStatusServer;
         mediumHinzufuegen(systemStatusClient.gemachtesMedium);
         appCheck(systemStatusClient);
         loeschen();
         download();
         fotosInfo();
     });

     var loeschen = function() {
         $("[name='loeschen']").each(function() {
             console.log("each loeschen");
             $(this).on('click', function() {
                 var picture = this.getAttribute("data");
                 $(this).html('<div style="vertical-align:middle;" class="loader"></div>');
                 socket.emit('bildLoeschen', picture);
             });
         });
     }
     loeschen();
     socket.on('bildLoeschen', function(systemStatusServer) {
         console.log(systemStatusServer);
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
         var fileName = systemStatusClient.geloeschtesBild.split(".");
         var image = fileName[0];
         var suffix = fileName[1];
         $("#" + image + "\\." + suffix).remove();
         fotosInfo();
     });

     var download = function() {
         $("[name='download']").each(function() {
             console.log("each download");
             $(this).on('click', function() {
                 top.location.href = $(this).attr("href");
             });
         });
     };
     download();

     var appCheck = function(systemStatusClient) {
         $("#datentraegerAuswerfen").replaceWith(systemStatusClient.buttons[0].state);
         $("#videoMachen").replaceWith(systemStatusClient.buttons[1].state);
         $("#aufDatentraegerSpeichern").replaceWith(systemStatusClient.buttons[2].state);
         $("#fotoMachen").replaceWith(systemStatusClient.buttons[3].state);
         if (systemStatusClient.fotoModus) {
             $(".switch :checkbox").prop('checked', false);
         } else {
             $(".switch :checkbox").prop('checked', true);
         }
         datentraegerAuswerfen();
         videoMachen();
         aufDatentraegerSpeichern();
         fotoMachen();
         if (systemStatusClient.amVideoMachen || systemStatusClient.amFotoMachen) {
             disableLoeschen();
         }
         //beide sollen nur bei fotoMachen/videoMachen erneut gecheckt weden!
         //loeschen();
         //download();
     };

     var fotosInfo = function() {
         if ($("tr").length > 1) {
             $("#keineMedien").css('display', 'none');
         } else {
             $("#keineMedien").css('display', 'block');
             $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
         }
     };
     fotosInfo();

     var aufSpeicherListeBildHinzufuegen = function(bild) {
         var html = '<tr id="speichernTr' + bild + '"><td><div id="loader' + bild + '" class="loaderKopieren"></div><p>' + bild + '</p></td></tr>';
         $("#bilderZumSpeichern").append(html);
     };

     var aufSpeicherListeBildLoeschen = function(bild) {
         var array = bild.split(".");
         var image = array[0];
         var suffix = array[1];
         $("#speichernTr" + image + "\\." + suffix).remove();
     };

     var speicherIconAendern = function(bild) {
         var array = bild.split(".");
         var image = array[0];
         var suffix = array[1];
         $("#loader" + image + "\\." + suffix).replaceWith('<span style="font-size:2.5em; float: left;" class="glyphicon glyphicon-ok"></span>');
     };

     var mediumHinzufuegen = function(medium) {
         var video = '<video width="100%" controls><source src="pictures/' + medium + '" type="video/mp4">Your browser does not support HTML5 video.</video>';
         var bild = '<img src="pictures/' + medium + '" style="width: 100%;" align="middle">';
         var med = medium.includes("mp4") ? video : bild;
         $("#letzterTable").prepend('<tr id="' + medium + '"><td style="border: 2px solid black;">' +
             med +
             '<div style="background-color: black; color: white; padding-top: 5px; padding-bottom: 5px;" align="center">' + medium + '</div><div style="margin-top: 10px; margin-bottom: 20px;" align="center">' +
             '<button title="Löschen" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#bc4b51; margin-right: 10px;" class="btn btn-default" name="loeschen" data="' + medium + '">' +
             '<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-trash">' +
             '</span></button><button title="Download" name="download" style="width: 100px; height: 67px; border-radius: 20px; border: 0px; background-color:#f4e285;" type="button" class="btn btn-default" href="' + medium + '">' +
             '<span style="font-size:2.5em; vertical-align:middle;" class="glyphicon glyphicon-cloud-download"></span></button></div></td></tr>');
     };

     $('.switch :checkbox').click(function() {
         if (!systemStatusClient.amVideoMachen && !systemStatusClient.amFotoMachen) {
             if ($(this).is(':checked')) {
                 $("#videoMachen").replaceWith(videoButtonBusy);
                 $("#fotoMachen").replaceWith(fotoButtonBusy);
                 $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
                 $("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
                 socket.emit('kameraModus', "video");
             } else {
                 $("#videoMachen").replaceWith(videoButtonBusy);
                 $("#fotoMachen").replaceWith(fotoButtonBusy);
                 $("#aufDatentraegerSpeichern").replaceWith(kopierenButtonDisabled);
                 $("#datentraegerAuswerfen").replaceWith(auswerfenButtonDisabled);
                 socket.emit('kameraModus', "foto");
             }
         }
     });
     socket.on('kameraModus', function(systemStatusServer) {
        console.log("kameraModus 230", systemStatusServer);
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient)
     });

     var systemState = function() {
         socket.emit('status');
     };
     systemState();
     socket.on('status', function(systemStatusServer) {
         console.log(systemStatusServer);
         systemStatusClient = systemStatusServer;
         appCheck(systemStatusClient);
     });
     var interval;
     var startTimer = function() {
         var counter = 0;
         var minuten = 0;
         var nullMin = "0";
         var sekunden = 0;
         var nullSek = "0";
         /**
         if (sekunden != undefined && minuten != undefined) {
             sekunden = setSekunden;
             minuten = setMinuten;
             counter = setSekunden + (60 * setMinuten);
         }**/
         interval = setInterval(function() {
             if (counter == 120) {
                 clearInterval(interval);
             }
             sekunden = sekunden < 10 ? nullSek + sekunden : (sekunden % 60);
             sekunden = sekunden == 0 ? "00" : sekunden;
             $("#counter").html(nullMin + minuten + ":" + sekunden);
             sekunden++;
             counter++
             if ((sekunden % 60) == 0) {
                 minuten++;
             }
         }, 1000);
     };

     var disableLoeschen = function() {
         $("[name='loeschen']").each(function() {
             $(this).attr("disabled", true);
         });
     };

     var activateLoeschen = function() {
         $("[name='loeschen']").each(function() {
             $(this).attr("disabled", false);
         });
     };
 }
 $(document).ready(main);
