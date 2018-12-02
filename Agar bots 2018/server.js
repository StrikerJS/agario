process.on('uncaughtException', function (err) {
    console.log(err);
})

global.colors = require("colors");

global.fs = require("fs");

global.ws = require('ws');

global.socks = require('socks');

global.HTTP = require('https-proxy-agent');

global.binaryReader = require("./binaryReader.js");

global.phantom = require("phantom");

//global.phantomServer = require('./phantomServer.js');

global.json_corrector = require("json-pretty");

global.request = require("request");

global.facebookManger = require("./facebookManager.js");

global.writer = require("./BinaryWriter.js");

const userJS = require("./user.js");

global.database = global.fs.readFileSync("./database.json", "utf-8");

let conUsers = 0;

global.users = [];

global.protocolVersion = 18;

global.protocolKey = 30116;

/*global.phantomServer.onReady = () => {
    
    process.stdout.write('\x1B[2J\x1B[0f');

    console.log(`[PhantomJS]`.green, `Patching ready!`.yellow);

    global.phantomServer.onProtocolVersion = pVersion => {

        global.protocolVersion = pVersion;
        console.log(`[PhantomJS]`.green, `Agar.io protocol version ${global.protocolVersion}`.yellow);

        global.phantomServer.on255 = pKey => {

            global.protocolKey = Buffer.from(pKey).readUInt32LE(1);
            console.log(`[PhantomJS]`.green, `Agar.io protocol key ${global.protocolKey}`.yellow);*/

            global.facebookManger.getCheckAccs(undefined, function() {

                console.log(`\n[FaceBookManager]`.green, `Account checking done ${global.facebookManger.activeAccounts.length}`.yellow);
                
                const wss = new global.ws.Server({
                    port : 8081
                });
                
                wss.on("connection", function(ws, req) {
                    conUsers++;
                    if(ws.upgradeReq == null && req != null) ws.upgradeReq = req;
                    if(ws.upgradeReq == null) throw Error("WTF IS THIS");
                
                    ws.getIP = ws.upgradeReq.connection.remoteAddress.split(':')[3];
                    ws.getUUID = null;
                    ws.auth = false;
                    
                    ws.sendBuf = function(buf) {
                        if(ws && ws.readyState == 1) ws.send(buf);
                    }
                    
                    for(let i = 0; i < global.users.length; i++) {
                        if(global.users[i]._IP == ws.getIP) {
                            ws.sendBuf(Buffer.from([0, 2])), ws.close();
                            console.log("[ServerJS]".green, "IP Limited".yellow, ws.getIP);
                        }
                    }

                    ws.on("message", (msg) => {
                        let buf = new global.binaryReader(msg);
                        let opcode = buf.readUInt8();
                        switch(opcode) {
                            case 0: {
                                ws.sendBuf(Buffer.from([0, 3]));
                                let UUID = buf.readStringZeroUtf8();
                                if(!ws.auth) {
                                    global.database = global.fs.readFileSync("./database.json", "utf-8");
                                    let read_database = JSON.parse(global.database);
                                    let user = {}
                                    for(let i = 0; i < read_database.length; i++) {
                                        if(read_database[i].UUID == UUID) {
                                            ws.auth = true;
                                            ws.sendBuf(Buffer.from([0, 4]));
                                            user.UUID = read_database[i].UUID;
                                            user.COINS = read_database[i].coins;
                                            user.IP = ws.getIP;
                                        }
                                    }
                                    if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                                    console.log("[ServerJS]".green, "Authorizate user".yellow, ws.getIP);
                                    global.users.push(new userJS(user.IP, user.UUID, user.COINS));
                                    ws.getUUID = user.UUID;
                                } else if(ws.auth) {
                                    console.log("[ServerJS]".green, "Authorizate user".yellow, ws.getIP);
                                    global.users.push(new userJS(ws.getIP, UUID, 5));
                                    ws.getUUID = UUID;
                                    ws.sendBuf(Buffer.from([0, 4]));
                                }
                            } break;
                            case 1: { // bot mode change
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                            } break;
                            case 2: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                                let agarServer = buf.readStringZeroUtf8();
                                //buf.readStringZeroUnicode();
                                let botAmount = 1000; // 1000 BOTS LIMIT OR SERVER DIE SO FAST !!!!!!!!!
                                if(!agarServer.split("?")[1]) { //.split("?")[0]
                                    ws.sendBuf(Buffer.from([0, 10]));
                                    break;   
                                }
                                for(let i = 0; i < global.users.length; i++) {
                                    if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                        global.users[i].startBots(botAmount, agarServer.split("?")[0]);
                                        ws.sendBuf(Buffer.from([0, 7]));
                                        console.log("[ServerJS]".green, "Start bots".yellow, ws.getIP);
                                    }
                                }
                
                            } break;
                            case 3: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                
                                for(let i = 0; i < global.users.length; i++) {
                                    if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                        global.users[i].stopBots();
                                        ws.sendBuf(Buffer.from([0, 4]));
                                        console.log("[ServerJS]".green, "Stop bots".yellow, ws.getIP);
                                    }
                                }
                
                            } break;
                            case 4: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                                let xPos = buf.readInt32();
                                let yPos = buf.readInt32();
                                
                                for(let i = 0; i < global.users.length; i++) {
                                    if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                        global.users[i].moveBots(xPos, yPos);
                                        let information = global.users[i].getInformation();
                                        let buffer = new Buffer.alloc(21);
                                        buffer.writeUInt8(1, 0);
                                        buffer.writeUInt16LE(0, 1);
                                        buffer.writeUInt16LE(information.sB, 3);
                                        buffer.writeUInt16LE(information.cB, 5);
                                        buffer.writeDoubleLE(information.uC, 7);
                                        ws.sendBuf(buffer);
                                    }
                                }
                
                            } break;
                            case 5: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                
                                for(let i = 0; i < global.users.length; i++) {
                                    if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                        global.users[i].splitBots();
                                    }
                                }
                
                            } break;
                            case 6: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                
                                for(let i = 0; i < global.users.length; i++) {
                                    if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                        global.users[i].ejectBots();
                                    }
                                }
                
                            } break;
                            default: {
                                if(!ws.auth) return ws.sendBuf(Buffer.from([0, 8])), ws.close();
                            } break;
                        }
                    });
                
                
                    ws.on("close", () => {
                        conUsers--;
                        if(!ws.auth) return;
                        for(let i = 0; i < global.users.length; i++) {
                            if(ws.auth && global.users[i]._UUID == ws.getUUID && global.users[i]._IP == ws.getIP) {
                                global.users[i].stopBots();
                                global.users.splice(i, 1);
                                console.log("[ServerJS]".green, "unauthorizate user (disconnect)".yellow, ws.getIP);
                            }
                        }
                    });
                
                    ws.on("error", (e) => {
                        console.log(e);
                    });
                });
            });
        //};
    //};
//};
