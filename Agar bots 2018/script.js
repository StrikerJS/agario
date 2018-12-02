// ==UserScript==
// @name          AgarBots2018
// @namespace    bots for agar
// @version      2.0
// @description  ...
// @author       SizRex
// @icon64       http://imasters.org.ru/agar/agar_allys_ext_favicon.png
// @icon64URL    http://imasters.org.ru/agar/agar_allys_ext_favicon.png
// @icon         http://imasters.org.ru/agar/agar_allys_ext_favicon.png
// @match        https://agar.io/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.jss
// @require     https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @resource    https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-buttons.css
// @resource    https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @resource    https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-icons.png
// @run-at       document-start
// @grant        none
// ==/UserScript==
setTimeout(function(){
var script = document.createElement("script");
script.src = "https://unpkg.com/sweetalert/dist/sweetalert.min.js";
document.getElementsByTagName("head")[0].appendChild(script);
    }, 3000);

"use strict";
setTimeout(function() {
    function e() {
        var e = localStorage.getItem("cachedVanilla"),
            a = null;
        if (e) {
            try {
                a = JSON.parse(e)
            } catch (e) {
                console.assert(!1, e)
            }
            a && a.src && (window.eval(a.src), console.log("%c[VANILLA] loaded from cache...", "color: darkorange"))
        }
    }
    var a, t, o;
    a = "//imaster.space/agar.io/js/vanilla.core.js", t = function() {
        console.info("[VANILLA] inject success...")
    }, (o = document.createElement("script")).type = "text/javascript", o.charset = "utf-8", o.readyState ? o.onreadystatechange = function() {
        "loaded" != o.readyState && "complete" != o.readyState || (o.onreadystatechange = null, t && t())
    } : (document.body && document.body.setAttribute("data-vanilla-core", a), t && (o.onload = t, o.onerror = e)), o.src = a + "?_=" + ~~(Date.now() / 1e3 / 60), document.getElementsByTagName("head")[0].appendChild(o)

    class Client {
        constructor() {
            this.botServerIP = 'ws://127.0.0.1:8081';
            this.botServerStatus = '';
            this.agarServer = '';
            this.botNick = '';
            this.UUID = '';
            this.botAmount = 500;
            this.moveInterval = null;
            this.ws = null;
            this.reconnect = true;
            this.addListener();
            this.connect();
        }

        connect() {
            this.ws = new WebSocket(this.botServerIP);
            this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = this.onopen.bind(this);
            this.ws.onmessage = this.onmessage.bind(this);
            this.ws.onclose = this.onclose.bind(this);
            this.ws.onerror = this.onerror.bind(this);
        }

        onopen() {
            swal("Server: Online!", "www.neybots.com", "success");
            console.log('Connection to bot server open');
            $('#serverStatus').text('Connected');
            this.sendUUID();
            this.startMoveInterval();
        }

        onmessage(msg) {
            let buf = new DataView(msg.data);
            let offset = 0;
            let opcode = buf.getUint8(offset++);
            if ($("#reconnectButton").prop('disabled', false)) {
                $("#reconnectButton").prop('disabled', true);
            }
            switch (opcode) {
                case 0:
                    {
                        let addClasses = '';
                        let removeClasses = '';
                        switch (buf.getUint8(offset++)) {
                            case 0:
                                this.botServerStatus = 'Max сonnections';
                                this.reconnect = false;
                                break;
                            case 1:
                                this.botServerStatus = 'Invalid Data';
                                this.reconnect = false;
                                break;
                            case 2:
                                this.botServerStatus = 'IP limit';
                                this.reconnect = false;
                                break;
                            case 3:
                                this.botServerStatus = 'Auth';
                                break;
                            case 4:
                                this.botServerStatus = 'Ready';
                                $('#toggleButton').replaceWith(`<button id='toggleButton' onclick='window.client.startBots();' class='btn btn-success'>Start Bots</button>`);
                                $("#botCounter").html("0/0");
                               // swal("Bots Stopped!", "Time : Paused!", "success");
                                window.bots = [];
                                break;
                            case 5:
                                this.botServerStatus = 'UUID not auth';
                                this.reconnect = false;
                                break;
                            case 6:
                                this.botServerStatus = 'Getting proxies';
                                break;
                            case 7:
                                this.botServerStatus = 'Bots started!';
                                break;
                            case 8:
                                this.botServerStatus = 'Auth error!';
                                swal("Auth Error!", "Your Time Expired!", "error");
                                this.reconnect = false;
                                break;
                            case 9:
                                this.botServerStatus = 'Invalid server';
                                swal("Invalid Server!", "Invalid Party Server!", "error");
                                break;
                            case 10:
                                this.botServerStatus = 'Not Party Server';
                                swal("Bots Can't Start!", "Invalid Party Server", "error");
                                $('#toggleButton').replaceWith(`<button id='toggleButton' onclick='window.client.startBots();' class='btn btn-success'>Start Bots</button>`);
                                break;
                            case 11:
                                this.botServerStatus = 'Coins are over!';
                                this.reconnect = false;
                                break;
                            case 12:
                                this.botServerStatus = 'Server in maintenance...';
                                this.reconnect = false;
                                break;
                            case 13:
                                this.totalUsers = buf.getUint8(offset++, true);
                                $("#userStatus").css("display", "block");
                                $("#usersCounter").text(this.totalUsers);
                                break;
                        }
                        $("#serverStatus").text(this.botServerStatus);
                    }
                    break;
                case 1:
                    {
                        let spawnedBots = buf.getUint16(offset, true);
                        offset += 2;
                        let connectedBots = buf.getUint16(offset, true);
                        offset += 2;
                        let maxBots = buf.getUint16(offset, true);
                        offset += 2;
                        let coins = buf.getFloat64(offset, true);
                        offset += 2;
                        if (connectedBots >= maxBots) {
                            $("#botCounter").html(maxBots + "/" + maxBots);
                        }
                        else {
                            $("#botCounter").html(connectedBots + "/" + maxBots);
                        }
                        $('#coinsCounter').html(`${coins}`);
                    }
                    break;
                case 2:
                    {
                        window.bots = [];
                        let numBots = buf.getUint16(offset, true);
                        offset += 2;
                        for (let i = 0; i < numBots; i++) {
                            let xPos = buf.getInt32(offset, true);
                            offset += 4;
                            let yPos = buf.getInt32(offset, true);
                            offset += 4;
                            window.bots.push({
                                "xPos": xPos,
                                "yPos": yPos
                            });
                        }
                    }
                    break;
            }
        }

        onclose() {
            console.log('Connection to bot server closed.');
            $("#reconnectButton").prop('disabled', false);
            if (this.reconnect) setTimeout(this.connect.bind(this), 150);
            if (this.moveInterval) clearInterval(this.moveInterval);
            if (!this.reconnect) return;
            swal("Server: Offline!", "Maybe in Maintenance!", "error");
            $('#serverStatus').text('Connecting...');
        }

        onerror() {}

        sendUUID() {
            let buf = this.createBuffer(2 + this.UUID.length);
            buf.setUint8(0, 0);
            for (let i = 0; i < this.UUID.length; i++) buf.setUint8(1 + i, this.UUID.charCodeAt(i));
            this.send(buf);
        }

        startMoveInterval() {
            this.moveInterval = setInterval(() => {
                let pos = window.getMousePos();
                this.sendPos(pos.x, pos.y);
            }, 30);
        }

        startBots() {
            let buf = this.createBuffer(6 + window.vanilla.server.addr.length + 2 * this.botNick.length);
            let offset = 0;
            buf.setUint8(offset++, 2);
            for (let i = 0; i < window.vanilla.server.addr.length; i++) buf.setUint8(offset++, window.vanilla.server.addr.charCodeAt(i));
            buf.setUint8(offset++, 0);
            for (let i = 0; i < this.botNick.length; i++) {
                buf.setUint16(offset, this.botNick.charCodeAt(i), true);
                offset += 2;
            }
            buf.setUint16(offset, 0, true);
            offset += 2;
            buf.setUint16(offset, this.botAmount, true);
            this.send(buf);
            swal("Bots Started!", "www.neybots.com", "success");
            $('#toggleButton').replaceWith(`<button id='toggleButton' onclick='window.client.stopBots();' class='btn btn-danger'>Stop Bots</button>`);
        }

        sendPos(xPos, yPos) {
            let buf = this.createBuffer(9);
            buf.setUint8(0, 4);
            buf.setInt32(1, xPos, true);
            buf.setInt32(5, yPos, true);
            this.send(buf);
        }

        split() {
            this.send(new Uint8Array([5]));
        }

        eject() {
            this.send(new Uint8Array([6]));
        }

        addListener() {
            document.addEventListener('mousemove', event => {
                this.clientX = event.clientX;
                this.clientY = event.clientY;
            });
        }

        sendNickUpdate() {
            let buf = this.createBuffer(3 + 2 * this.botNick.length);
            let offset = 0;
            buf.setUint8(offset++, 7);
            for (let i = 0; i < this.botNick.length; i++) {
                buf.setUint16(offset, this.botNick.charCodeAt(i), true);
                offset += 2;
            }
            this.send(buf);
        }

        stopBots() {
            this.send(new Uint8Array([3]));
            swal("Bots Stopped!", "Time : Paused!", "success");
        }

        send(data) {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            this.ws.send(data, {
                binary: true
            });
        }

        createUUID() {
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = '';
            for (let i = 0; i < 3; i++) {
                for (let a = 0; a < 7; a++) token += possible.charAt(Math.floor(Math.random() * possible.length));
                token += '-';
            }
            token = token.substring(0, token.length - 1);
            localStorage.setItem('agarUnlimited2UUID', token);
            return token;
        }

        createBuffer(len) {
            return new DataView(new ArrayBuffer(len));
        }
        sUUID(a) {
            if (a) {
                $("#UUID").text(localStorage.getItem('agarUnlimited2UUID'));
            }
            else if (!a) {
                $("#UUID").text("hover for show");
            }
        }
    }

    class GUITweaker {
        constructor() {
            this.removeElements();
            this.addGUI();
            this.finishInit();
            let check = setInterval(() => {
                if (document.readyState == "complete") {
                    clearInterval(check);
                    setTimeout(() => {
                        this.addBotGUI();
                        window.client.botMode = localStorage.getItem('botMode');
                        let UUID = localStorage.getItem('agarUnlimited2UUID');
                        $('#agarUnlimitedToken').val(UUID);
                    }, 1500);
                }
            }, 100);
        }

        addBotGUI() {
            const botAmount = localStorage.getItem('botAmount') || 500;
            const botMode = localStorage.getItem('botMode');
            $('head').append(`<style type="text/css">.agario-panel,#mainui-grid{border-top: 5px solid #09f4ff; background-image: url("http://cdn.ogario.ovh/static/img/pattern.png"); background-repeat: repeat; background-position: top center;}</style>`);
            $('head').append(`<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">`);
            setTimeout(function() {
$('.agario-promo-container').replaceWith(`<div class="agario-panel" style="position:absolute;margin-top: 4px; width: 330px; height: 500; background-color: #fff;";><center><h3>NeyBots.com</h3></center>
<span>        </span><button id="toggleButton" onclick="window.client.startBots();" class="btn btn-success">Start Bots</button>
<button class="btn btn-success" onclick="UUIDChecker()">|-Your UUID-|</button>
<button onclick="if(!window.client.reconnect&&window.client.ws.readyState!==1){window.client.reconnect=true;window.client.connect();}else{}" class="btn btn-success" style="float:right;">Reconnect</button></div></div>
<span>        </span>

<script>
function UUIDChecker() {
    swal("Your UUID: ${window.client.UUID}", {
  icon: "success",
  title: "UUID Checked!",
            buttons: {
                cancel: "Close",
                catch: {
                    text: "Copy",
                    value: "catch",
                },
            },
        })
        .then((value) => {
            switch (value) {

                case "catch":
                    navigator.clipboard.writeText(window.client.UUID);
swal("UUID Copied!", {
      icon: "success",
    });
                    break;

                case "Close":
                    swal.close();
                    break;


            }
        });
}

</script></div>
<div>`);
            }, 5000);
        }

        removeElements() {
            $('#advertisement').remove();
            $('#bannerCarousel').remove();
            $('#user-id-tag').remove();
            $('#Potion_Regular_RareCanvas').remove();
        }

        addGUI() {
            $("body").append(`<div style="position:fixed; margin-top: 140px; min-width: 200px; z-index:9999; min-height: 100px; max-width: 900px; max-height: 200px"><div id="botSector" style="min-width: 25px;color:#fff; min-height: 25px;background: #333;max-width: 200px; max-height: 200px; border-radius: 10px"><div id="botText" style="margin-left: 10px;color:#fff0; width: 49px; height: 53; background: url('https://i.imgur.com/WZdqjIs.png') no-repeat;background-position-y: 1px;background-size: 45%">_<span style="color: #fff; margin-left: 15px; ">Minions:</span><span style="color: #fff; margin-left: 5px;"id="botCounter">0/0</span></div>
</div><div id="botSector" style="min-width: 25px;color:#fff; min-height: 25px;background: #333;max-width: 200px; max-height: 200px; border-radius: 10px; margin-top: 5px"><div id="botText" style="margin-left: 10px;color:#fff0; width: 49px; height: 53; background: url('https://i.imgur.com/bIUuG5a.png') no-repeat;background-position-y: 1px;background-size: 45%">_<span style="color: #fff; margin-left: 15px; ">Coins:</span><span style="color: #fff; margin-left: 5px;"id="coinsCounter">0</span></div>
</div><div id="botSector" style="min-width: 25px;color:#fff; min-height: 25px;background: #333;max-width: 200px; max-height: 200px; border-radius: 10px; margin-top: 5px"><div id="botText" style="margin-left: 10px;color:#fff0; width: 100%; background: url('https://i.imgur.com/F8B58GB.png') no-repeat;background-position-y: 1px;background-size: 11%">_<span style="color: #fff; margin-left: 15px; ">Status:</span><span style="color: #fff; margin-left: 5px;"id="serverStatus">Waiting</span></div></div></div></div>`);
        }

        finishInit() {
            window.client.botMode = localStorage.getItem('botMode');
            window.client.botAmount = localStorage.getItem('botAmount') >>> 0;
            window.client.botNick = localStorage.getItem('botNick');
            let UUID = localStorage.getItem('agarUnlimited2UUID');
            $('#agarUnlimitedToken').val(UUID);
        }
    }

    class Macro {
        constructor() {
            this.ejectDown = false;
            this.stopped = false;
            this.speed = 15;
            this.addKeyHooks();
        }

        addKeyHooks() {
            this.onkeydown();
        }
        onkeydown() {
            document.addEventListener('keydown', function(event) {
                console.log(event.keyCode, event.which);
                switch (event.keyCode || event.which) {
                    case 87:
                        window.core.eject();
                        break;
                    case 88:
                        client.split();
                        break;
                    case 67:
                        client.eject();
                        break;
                }
            }.bind(this));
        }
        eject() {
            if (this.ejectDown) {
                window.core.eject();
                setTimeout(this.eject.bind(this), this.speed);
            }
        }
    }
    setTimeout(function() {
        window.mouseX = 0;
        window.mouseY = 0;
        document.addEventListener('mousemove', evt => {
            window.mouseX = evt.clientX - window.innerWidth / 2;
            window.mouseY = evt.clientY - window.innerHeight / 2;
        });

        window.getMousePos = function() {
            let x = window.vanilla.player.x - (window.vanilla.map.x1 + window.vanilla.map.width / 2),
                y = window.vanilla.player.y - (window.vanilla.map.y1 + window.vanilla.map.height / 2);
            return {
                x: x + window.mouseX / window.vanilla.settings.scale,
                y: y + window.mouseY / window.vanilla.settings.scale
            };
        }
        window.client = new Client();
        new Macro();

        if (!localStorage.getItem('agarUnlimited2UUID')) localStorage.setItem('agarUnlimited2UUID', window.client.createUUID());
        if (!localStorage.getItem('botMode')) localStorage.setItem('botMode', 'FEEDER');
        if (!localStorage.getItem('botNick')) localStorage.setItem('botNick', '');
        if (!localStorage.getItem('botAmount')) localStorage.setItem('botAmount', 500);
        if (!localStorage.getItem('extraZoom')) localStorage.setItem('extraZoom', true);
        window.client.UUID = localStorage.getItem('agarUnlimited2UUID');

        new GUITweaker();
    }, 12000);
}, 0);