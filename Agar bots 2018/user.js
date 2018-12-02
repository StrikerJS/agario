
const colors = require("colors");

let kitay = ["乾", "神", "盘", "五", "岳", "喜", "双", "喜", "蟠", "桃", "果", "熟", "三",
	"千", "岁", "福", "寿", "双", "😎", "😝", "😈", "😎", "😝", "😂", "😈", "😲", "😳",
	"🍔", "🍟", "🍩", "🎃", "🎄", "🎅", "🐣", "🐤", "👻", "👽", "👮", "இ", "💋",
	"👣", "💀", "🔥", "😾", "🏆", "🎁", "🐺", "🐍", "🍧", "🍪", "🍮", "🎈", "🐧",
	"👌", "🐨", "🉑", "🉐", "🈺", "🈹", "🈸", "🈶", "🈵", "🈴", "🈳", "🈲", "🈯",
	"🈚", "🈳"
];

const names = [
	//"H҉a҉c҉k҉e҉r҉"
	"Agar - A|ss"
	//"YT:ToxoidGuy",
	//"SizRex",
//	"FreetzYT"
];

const defaultBorders = {
    minX: -7071.067811865475,
    minY: -7071.067811865475,
    maxX: 7071.067811865475,
    maxY: 7071.067811865475
};

class user {
    constructor(IP, UUID, COINS) {
        this._IP = IP;
        this._UUID = UUID;
        this._COINS = COINS;
		this._bots = [];
		this._startTimeInt = 0;
		this.ProxyManager = null;
		this._coinsSave = 0;
		this.resetProxy();
    }
    startBots(botCount, agarServer) {
		if(this._COINS <= 0) return;
		this.startTimeTick();
        for(let i = 0; i < botCount; i++) {
            this._bots.push(new bot(i, this, agarServer));
		}
    }
    stopBots() {
		this.resetProxy();
        for(let i = 0; i < this._bots.length; i++) {
            if(this._bots[i]) {
                if(this._bots[i]._ws) {
					this._bots[i].reconnecting = false;
					try {
						this._bots[i]._ws.close();
					} catch(e) {}
                }
            }
        }
        this._bots = [];
        this.saveCoins();
    }
    splitBots() {
        for(let i = 0; i < this._bots.length; i++) {
            if(this._bots[i]) {
                this._bots[i].split();
            }
        }
    }
    ejectBots() {
        for(let i = 0; i < this._bots.length; i++) {
            if(this._bots[i]) {
                this._bots[i].eject();
            }
        }
    }
    moveBots(x, y) {
        for(let i = 0; i < this._bots.length; i++) {
            this._bots[i].handleBotAI(x, y);
        }
    }
    saveCoins() {
		clearInterval(this._startTimeInt);
        global.database = global.fs.readFileSync("./database.json", "utf-8");
        let check_database = JSON.parse(global.database);
        for(let i = 0; i < check_database.length; i++) {
            if(check_database[i].UUID == this._UUID) {
				check_database[i].coins = this._COINS;
                global.fs.writeFileSync("./database.json", global.json_corrector(check_database))
            }
        }
    }
    getCoins() {
        return this._COINS;
    }
    getCoinsDown() {
        this._COINS -= 5;
	}
	startTimeTick() {
		this._startTimeInt = setInterval(function(){
			this._COINS--;
			if(this._COINS <= 0) {
				this.stopBots();
				clearInterval(this._startTimeInt);
			}
		}.bind(this),1000);
	}
	getInformation() {
		let connected = 0;
		let spawned = 0;
		let coins = this._COINS;
		for(let i = 0; i < this._bots.length; i++) {
			if(this._bots[i] && this._bots[i]._ws) {
				if(this._bots[i]._ws.readyState == 1) {
					connected++;
					if(this._bots[i]._spawned) spawned++;
				}
			}
		}
		return {
			cB: connected,
			sB: spawned,
			uC: coins
		}
	}
	resetProxy() {
		this.ProxyManager = {
			socksProxies: [],
			httpProxies: [],
			usedAgents: {},
			agents: [],
		
			loadProxies() {
				this.socksProxies = global.fs.readFileSync('./socksProxies.txt', 'utf8').split('\n');
				this.httpProxies = global.fs.readFileSync('./httpProxies.txt', 'utf8').split('\n');
			},
		
			loadAgents() {
				this.loadProxies();
				for (let i = 0; i < this.socksProxies.length; i++) {
					if (this.socksProxies[i] == '') continue;
					let proxyInfo = this.socksProxies[i].split(':');
					for (let a = 0; a < 1; a++) {
						this.agents.push(new global.socks.Agent({
							proxy: {
								ipaddress: proxyInfo[0],
								port: proxyInfo[1] >>> 0,
								type: 5
							}
						}));
					}
				}
				for (let i = 0; i < this.httpProxies.length; i++) {
					let proxyInfo = this.httpProxies[i];
					this.agents.push(new global.HTTP(`http://${proxyInfo}`));
				}
			},
		
			getAgent(id, unuseableProxy) {
				const agent = this.usedAgents[id];
				if (agent && !unuseableProxy) this.agents.push(agent);
				const newAgent = this.agents.shift();
				this.usedAgents[id] = newAgent;
				return newAgent;
			}
		};
		this.ProxyManager.loadAgents();
	}
}



function deflate(input, output, sIdx, eIdx) {
    sIdx = sIdx || 0;
    eIdx = eIdx || (input.length - sIdx);
    for (let i = sIdx, n = eIdx, j = 0; i < n;) {
        let token = input[i++];
        let literals_length = (token >> 4);
        if (literals_length > 0) {
            let l = literals_length + 240;
            while (l === 255) {
                l = input[i++];
                literals_length += l;
            };
            let end = i + literals_length;
            while (i < end) output[j++] = input[i++];
            if (i === n) return output;
        };
        let offset = input[i++] | (input[i++] << 8);
        if (offset === 0 || offset > j) return -(i - 2);
        let match_length = (token & 0xf);
        let l = match_length + 240;
        while (l === 255) {
            l = input[i++];
            match_length += l;
        };
        let pos = j - offset;
        let end = j + match_length + 4;
        while (j < end) output[j++] = output[pos++];
    };
    return output;
};

class bot {
	constructor(id, user, server) {
        this._userJS = user;
        this.agerServer = server;
		this.id = id;
		this._lastBorderTime = Date.now();
		this._borders = Object.assign(defaultBorders);
		this._MyWorldCell_IDS = [];
		this._WorldCells = {};
		this._protocolVersion = global.protocolVersion;
		this._protocolKey = global.protocolKey;
		this._encryptionKey = 673720360 ^ this._protocolKey;
		this._decryptionKey = 0;
		this._xPos = 0;
		this._yPos = 0;
		this._waitingForToken = false;
		this.reconnecting = true;
		this._offsetX = 0;
		this._offsetY = 0;
		this._fSpawn = false;
		this._unuseableProxy = false;
		this._onceSplit = false;
		this._spawned = false;
		this._ws = null;
		this._sendFBdata = false;
		this._switchMove = false;
		this._switchMoveInt = null;
		this.auth_token = null;
		this.switchMovingIntervalTimout = 2500;
		this._goLoggedIn = false;
		this._splitOnPlayer = {
			splited: false,
			cellID: null
		}
		this._fbAccInformation = {
			coins: 0,
			lvl: 0,
			skin: null
		}
		this.log_lvl = 6;
        setTimeout(function() {
            this.connect();
        }.bind(this), 5 * this.id);
	}

	connect() {
		let proxyServer = this._userJS.ProxyManager.getAgent(this.id, this._unuseableProxy);
		this._ws = new global.ws(this.agerServer, {
			'headers': {
				'origin': 'http://agar.io',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
			},
			'agent': proxyServer
		});
		this._ws.binaryType = 'nodebuffer';
		this._ws.onopen = this.onopen.bind(this);
		this._ws.onmessage = this.onmessage.bind(this);
		this._ws.onclose = this.onclose.bind(this);
		this._ws.onerror = this.onerror.bind(this);
		this._unuseableProxy = true;
	}

	onopen() {

		let buf = new Buffer.alloc(5);
		buf.writeUInt8(254, 0);
		buf.writeUInt32LE(this._protocolVersion, 1);
		this.send(buf);

		buf = new Buffer.alloc(5);
		buf.writeUInt8(255, 0);
		buf.writeUInt32LE(this._protocolKey, 1);
		this.send(buf);

		//this.sendFBLogin();
		this.spawn();
	}

	sendFBLogin() {
		var hasAccs = global.facebookManger.hasAvailableToken();
		if(hasAccs == true) {
			this.auth_token = global.facebookManger.getToken();
		}
		if(this.auth_token) {
			let c = this;
			let check_l = this.auth_token.length + 25;
			let bytes = [];
			if(check_l > 255) {
				setTimeout(function() { this.sendFBLogin() }.bind(this),100);
			} else {
				if(this.auth_token.length > 255) {

                    bytes = [102, 8, 1, 18, this.auth_token.length - 103, 2, 8, 10, 82, this.auth_token.length - 138, 2, 8, 2, 18, 14, 8, 5, 18, 6, 50, 46, 49, 48, 46, 53, 24, 0, 32, 0, 26,  this.auth_token.length - 128, 2];

                } else if(this.auth_token.length < 255) {
                            
                    bytes = [102, 8, 1, 18, this.auth_token.length + 26, 1, 8, 10, 82, this.auth_token.length + 21, 1, 8, 2, 18, 14, 8, 5, 18, 6, 50, 46, 49, 48, 46, 53, 24, 0, 32, 0, 26, this.auth_token.length, 1];

				};
				function compile() {

					for(var i = 0; i <= c.auth_token.length - 1; i++) {
	
						bytes.push(c.auth_token.charCodeAt(i));
	
					};
	
					build();
	
				};
	
				function build() {
	
					var buf = new Buffer.alloc(bytes.length);
	

						for(var i = 0; i <= bytes.length - 1; i++) {	
		
							var byte = bytes[i];
	
							if(byte > 255) {

								buf.writeUInt16LE(byte, i);
	
							} else {
	
								buf.writeUInt8(byte, i);
	
							};
	
						};
	
	
					var buffer = buf;
	
					c.send(buffer, true);
	
				};
	
				compile();
			}
		}
	}

	onmessage(msg) {
		let buf = null;

		if (this._decryptionKey)
			buf = this.xorBuffer(msg.data, this._decryptionKey ^ this._protocolKey);
		else
			buf = msg.data;

		let offset = 0;
		let opcode = null;
		try {
			opcode = buf.readUInt8(offset++);
		} catch (e) {
			return;
		}
		switch (opcode) {
			case 18:
				if (!this._decryptionKey) break;
				this._decryptionKey = this.rotateKey(this._decryptionKey);
				this._MyWorldCell_IDS = [];
				this._WorldCells = {};
				break;
			case 32:
				if(this._switchMoveInt == null) {
					this._switchMoveInt = setInterval(function() {
						if(this._switchMove) {
							this._switchMove = false;
							this.switchMovingIntervalTimout = 2500;
						} else if(!this._switchMove) {
							this._switchMove = true;
							this.switchMovingIntervalTimout = 500;
						}
					}.bind(this), this.switchMovingIntervalTimout);
				}
				if (!this._fSpawn) {
					this._fSpawn = true;
					this.sendFBLogin();
				}
				try {
					this._MyWorldCell_IDS.push(buf.readUInt32LE(offset));
					this._spawned = true;
				} catch (e) {}
				break;
			case 85:
				if (this._userJS.getCoins() <= 0) return this.reconnecting = false, this._ws.close();
                this.unuseableProxy = true;
				this._ws.close();
				//this._waitingForToken = true;
				//this.sendRecaptchaResponse("FUCK YOU AGAR")
				//this.requestCaptcha();
				break;
			case 102:

				/*let ShopType = 0;
				let Terminal = 0;
				let offset = 2;
				//console.log(buf);
				Terminal = buf.readUInt16LE(offset);
				offset += 2;
				ShopType = buf.readUInt8(offset++);
				console.log(ShopType, Terminal, offset);*/


				break;
			case 103: // FB LOGIN
				//console.log("Login done");
				this.collectFreeCoins();
				//this.buy_mass_boost();
				//this.activate_mass_boost();
				break;
			case 104: // FB LOGOUT
				if(this.auth_token) global.facebookManger.returnToken(this.auth_token);
				this.auth_token = null;
				break;
			case 105:
				this.unuseableProxy = true;
				this._ws.close();
				break;
			case 112:
				buf = Buffer.from(buf);
				const packet112 = new Buffer.alloc(buf.byteLength + 2);
				for (let i = 0; i < buf.byteLength; i++) packet112.writeUInt8(buf.readUInt8(i), i);
				packet112.writeUInt16LE(this.id, buf.byteLength);
				this.send(packet112, true);
				break;
			case 113:
				const botID = buf.readUInt16LE(buf.byteLength - 2);
				const packet113 = new Buffer.alloc(buf.byteLength - 2);
				for (let i = 0; i < buf.byteLength - 2; i++) packet113.writeUInt8(buf.readUInt8(i), i);
				this.send(packet113, true);
				break;
			case 161:
				//console.log(new Uint8Array(buf));
				break;
			case 226:
				buf.writeUInt8(227, 0);
				this.send(buf, true);
				break;
			case 241:
				try {
					this._decryptionKey = buf.readInt32LE(offset);
				} catch (e) {}
				break;
			case 242:
				//console.log(buf.readUInt32LE(1));
				break;
			case 255:
				buf = this.decompressBuffer(buf);
				let n_offset = 0;
				let n_opcode = null;
				try {
					n_opcode = buf.readUInt8(n_offset++);
				} catch (e) {
					break;
				}
				switch (n_opcode) {
					case 16:
						this.handleCells(buf);
						break;
					case 64:
						this.handleBorders(buf);
						break;
				}
				if (!this._waitingForToken && Date.now() - this._lastBorderTime > 2000) {
					clearInterval(this._switchMoveInt);
					this._switchMoveInt = null;
					this._MyWorldCell_IDS = [];
					this._WorldCells = {};
					this._spawned = false;
					this._onceSplit = false;
					this._splitOnPlayer.splited = false;
					this.changeSkin("skin_spider");
					this.spawn();
					this._lastBorderTime = Date.now();
				}
				break;
			default:
				//console.log(this.id, opcode, buf);
		}
	}

	changeSkin(skin) {

        if(typeof(skin) == "string") {
			// OMG UR BYTES NOT WORK CHANGE SKIN IT - 102 FIRST BYTE.. OMG
            var bytes = [102, 8, 1, 18, 21, 8, 80, 130, 5, 16, 10, 14, 8, 1, 16, 1, 26, 8];
        
			for(let i = 0; i < skin.length; i++ ){
				bytes.push(skin.charCodeAt(i));
			}

			let buf = Buffer.from(bytes);

            this.send(buf, true);

        } else {

            console.log("Invalid skin");

        };
    }

	collectFreeCoins() {

        var name = "hourlyBonus";
        var buf = new global.writer(23); //LENGHT

        buf.writeUInt8(102); //OPCODE
        buf.writeUInt8(8); //FB VERSION
        buf.writeUInt8(1); //TYPE 1 = FB 2 = GOOGLE
        buf.writeUInt8(18); //IDK
        buf.writeUInt8(18); //Something IDK
        buf.writeUInt8(8); //FB VERSION
        buf.writeUInt8(110); //IDK
        buf.writeUInt8(242); //IDK
        buf.writeUInt8(6); //Version?
        buf.writeUInt8(13); //IDK
        buf.writeUInt8(10); //IDK
        buf.writeUInt8(11); //IDK
        buf.writeStringUtf8(name, true);

        this.send(buf.toBuffer(), true);

    }

	buy_mass_boost() {

		let bytes = [102, 8, 1, 18, 25, 8, 70, 178, 4, 20, 10, 18];

		let massBoostName = "1_mass_boost_3x_1h";

		for(let i = 0; i < massBoostName.length; i++) {
			bytes.push(massBoostName.charCodeAt(i));
		}

		let buf = Buffer.from(bytes);

		this.send(buf, true);

	}
	
	activate_mass_boost() {

		let bytes = [102, 8, 1, 18, 23, 8, 112, 130, 7, 18, 10, 16];

		let massBoostName = "mass_boost_3x_1h";

		for(let i = 0; i < massBoostName.length; i++) {
			bytes.push(massBoostName.charCodeAt(i));
		}

		let buf = Buffer.from(bytes);

		this.send(buf, true);

	}

	requestCaptcha() {
		if (this._userJS.getCoins() <= 0) return this.reconnecting = false, this._ws.close();
		/*let ran_id = Math.floor(Math.random() * 1000000);
		request(`http://api.captchacoder.com/imagepost.ashx?action=upload&key=PO3LLHK2I1FB9Z6YDQUWFGVUIYYINTIJ43J4RENY&captchatype=3&gen_task_id=${ran_id}&sitekey=6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl&pageurl=http://agar.io`, (err, res, body) => {
			if (err || res.statusCode !== 200) {
				this._unuseableProxy = true;
				this._ws.close();
				console.log('Failed to send request to generate captcha token');
				return;
			}
			if(body === "Error Queue_Limited" || body === "Error Timeout" || body === "Error Not_Enough_Fund") return this.requestCaptcha();
			coinsToMinus += 5;
			this.sendRecaptchaResponse(body);
			console.log(`Got recaptcрa response token`, `${body}`.green);
			this._waitingForToken = false;
		});*/
		global.request('http://2captcha.com/in.php?key=&method=userrecaptcha&googlekey=6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl&pageurl=agar.io', (err, res, body) => {
			if (err || res.statusCode !== 200) {
				this._unuseableProxy = true;
				this._ws.close();
				console.log('Failed to send request to generate captcha token');
				return;
			}
			this._userJS.getCoinsDown();
			const id = body.split('|')[1];
			this.log(`Uploaded captcha, got response ID ${id} starting wait interval.`, 6);
			const requestInterval = setInterval(() => {
				global.request(`http://2captcha.com/res.php?key=&action=get&id=${id}`, (err, res, body) => {
					if (err || res.statusCode !== 200 || !/OK/.test(body)) return;
					const recaptchaResponse = body.split('|')[1];
					this.sendRecaptchaResponse(recaptchaResponse);
					this.log(`Got recaptcрa response token ${recaptchaResponse}`, 6);
					clearInterval(requestInterval);
					this._waitingForToken = false;
				});
			}, 5000);
		});

		/*let that = this;

		anticaptcha.getBalance(function (err, balance) {
			if (err) {
				that._unuseableProxy = true;
				that._ws.close();
				return;
			}
			if (balance > 0) {
				anticaptcha.createTaskProxyless(function (err, taskId) {
					if (err) {
						that._unuseableProxy = true;
						that._ws.close();
						return;
					}

					anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
						if (err) {
							return;
						}

						that.sendRecaptchaResponse(taskSolution);
						console.log(`Got recaptcрa response token`, `${taskSolution}`.green);
						that._waitingForToken = false;
					});
				});
			}
		});*/
	}

	decompressBuffer(buf) {
		try {
			let buf_ = buf.readUInt32LE(1);
			let out = new Buffer.alloc(buf_);
			return deflate(buf.slice(5), out);
		} catch (e) {}
	}

	log(msg, lvl) {
		if (lvl != this.log_lvl) return;
		console.log(`[bot ${this.id}] get message -> `, (msg).green);
	}

	sendRecaptchaResponse(response) {
		let buf = new Buffer.alloc(2 + response.length);
		buf.writeUInt8(86, 0);
		buf.write(response, 1);
		this.send(buf, true);
		//this.spawn();
	}

	handleBorders(buf) {
		let offset = 1;
		this._lastBorderTime = Date.now();
		this._borders.minX = buf.readDoubleLE(offset);
		offset += 8;
		this._borders.minY = buf.readDoubleLE(offset);
		offset += 8;
		this._borders.maxX = buf.readDoubleLE(offset);
		offset += 8;
		this._borders.maxY = buf.readDoubleLE(offset);
		if (this._borders.maxX - this._borders.minX > 14E3) { 
			this._offsetX = (this._borders.maxX + this._borders.minX) / 2;
		}
		if (this._borders.maxY - this._borders.minY > 14E3) {
			this._offsetY = (this._borders.maxY + this._borders.minY) / 2;
		}
	}

	handleCells(buf) {
		try {
			let offset = 1;
			let eatQueueLength = buf.readUInt16LE(offset);
			offset += 2;
			for (let i = 0; i < eatQueueLength; i++) {
				let eater = buf.readUInt32LE(offset);
				offset += 4;
				let victim = buf.readUInt32LE(offset);
				offset += 4;
				if (this._WorldCells[victim]) delete this._WorldCells[victim];
			}
			while (true) {
				let cell = new Cell();
				cell.id = buf.readUInt32LE(offset);
				offset += 4;
				if (cell.id == 0) break;
				cell.xPos = buf.readInt32LE(offset);
				offset += 4;
				cell.yPos = buf.readInt32LE(offset);
				offset += 4;
				cell.size = buf.readUInt16LE(offset);
				offset += 2;
				let flags = buf.readUInt8(offset++);
				let flags2 = 0;
				if (flags & 128) flags2 = buf.readUInt8(offset++);
				if (flags & 1) cell.isVirus = true;
				if (flags & 2) offset += 3;
				if (flags & 4)
					while (buf.readInt8(offset++) !== 0) {}
				if (flags & 8)
					while (buf.readInt8(offset++) !== 0) {}
				if (flags2 & 4) offset += 4;
				if (flags2 & 1) cell.isFood = true;
				this._WorldCells[cell.id] = cell;
			}
			let removeQueueLength = buf.readUInt16LE(offset);
			offset += 2;
			for (let i = 0; i < removeQueueLength; i++) {
				let removeID = buf.readUInt32LE(offset);
				offset += 4;
				if (this._WorldCells[removeID]) delete this._WorldCells[removeID];
			}
		} catch (e) {};
	}

	handleBotAI(x, y) {
		let bX = 0;
		let bY = 0;
		let bC = 0;
		let bS = 0;

		for (let i in this._MyWorldCell_IDS) {
			if (this._WorldCells.hasOwnProperty(this._MyWorldCell_IDS[i])) {
				let gN = this._WorldCells[this._MyWorldCell_IDS[i]];
				bX += gN.xPos;
				bY += gN.yPos;
				bS += gN.size;
				bC++;
			}
		}

		bX /= bC;
		bY /= bC;

		let botConfig = {
			bX: bX,
			bY: bY,
			bS: bS,
			bC: bC
		}

		if (botConfig) {
			if (!this._onceSplit) {
				if(this._switchMove) {
					if (!botConfig.bX && !botConfig.bY) {
						return;
					} else {
						let nX = null;
						let nY = null;
						let random = Math.random();
						if(random >= 0.2) {
							nX = botConfig.bX + Math.floor(Math.random() * (-450) + (450) - (450));
							nY = botConfig.bY - Math.floor(Math.random() * (-450) + (450) - (450));
						} else if(random >= 0.4) {
							nX = botConfig.bX - Math.floor(Math.random() * (-450) + (450) - (450));
							nY = botConfig.bY + Math.floor(Math.random() * (-450) + (450) - (450));
						} else if(random >= 0.6) {
							nX = botConfig.bX + Math.floor(Math.random() * (450) + (450) - (450));
							nY = botConfig.bY - Math.floor(Math.random() * (450) + (450) - (450));
						} else if(random >= 0.8) {
							nX = botConfig.bX - Math.floor(Math.random() * (450) + (450) - (450));
							nY = botConfig.bY + Math.floor(Math.random() * (450) + (450) - (450));
						} else {
							nX = botConfig.bX - Math.floor(Math.random() * (450) + (450) - (450));
							nY = botConfig.bY + Math.floor(Math.random() * (-450) + (450) - (450));
						}
						this.moveTo(nX - this._offsetX, nY - this._offsetY);
					}
				} else {
					if (botConfig.bS < 73) {
						this._onceSplit = false;		
						if (!botConfig.bX && !botConfig.bY) {
							return;
						} else {
							let calcBestPlayerForEat = this.calcBestPlayerForEat(botConfig.bX, botConfig.bY, botConfig.bS);
							let bestNode = this.calcBestEatEvent(botConfig.bX, botConfig.bY, botConfig.bS);
							if(!calcBestPlayerForEat) {
								if (!bestNode.eatEvent) {
									this.moveTo(x, y);
									return;
								} else {
									this.moveTo((bestNode.eatEvent.xPos - this._offsetX) + Math.floor(Math.random() * (-35) + (35) - (35)), (bestNode.eatEvent.yPos - this._offsetY) + Math.floor(Math.random() * (-35) + (35) - (35)));
									return;
								}
							} else if(calcBestPlayerForEat) { 	
								if(calcBestPlayerForEat.eatEvent) {
									if(calcBestPlayerForEat.eatEvent.xPos && calcBestPlayerForEat.eatEvent.yPos) {
										this.moveTo((calcBestPlayerForEat.eatEvent.xPos - this._offsetX), (calcBestPlayerForEat.eatEvent.yPos - this._offsetY));
										if(this._splitOnPlayer.cellID != calcBestPlayerForEat.eatEvent.id) {
											this._splitOnPlayer.cellID = calcBestPlayerForEat.eatEvent.id;
											console.log(this.id, "detect player for eat! bot mass - ", botConfig.bS, "player mass", calcBestPlayerForEat.eatEvent.size, "last cell id", this._splitOnPlayer.cellID, "new cell id", calcBestPlayerForEat.eatEvent.id);
											this.send(Buffer.from([17]), true);
										};
										return;	
									} else {
										if (bestNode.eatEvent) {
											if(bestNode.eatEvent.xPos && bestNode.eatEvent.yPos) {
												this.moveTo((bestNode.eatEvent.xPos - this._offsetX) + Math.floor(Math.random() * (-35) + (35) - (35)), (bestNode.eatEvent.yPos - this._offsetY) + Math.floor(Math.random() * (-35) + (35) - (35)));
												return;
											} else {
												this.moveTo(x + Math.floor(Math.random() * (-35) + (35) - (35)), y + Math.floor(Math.random() * (-35) + (35) - (35)));
											}	
										}
									}
								} else {
									if (bestNode.eatEvent) {
										if(bestNode.eatEvent.xPos && bestNode.eatEvent.yPos) {
											this.moveTo((bestNode.eatEvent.xPos - this._offsetX) + Math.floor(Math.random() * (-35) + (35) - (35)), (bestNode.eatEvent.yPos - this._offsetY) + Math.floor(Math.random() * (-35) + (35) - (35)));
											return;
										} else {
											this.moveTo(x + Math.floor(Math.random() * (-35) + (35) - (35)), y + Math.floor(Math.random() * (-35) + (35) - (35)));
										}
									}
								}
							}	
						}
					} else {	
						this.moveTo(x + Math.floor(Math.random() * (-35) + (35) - (35)), y + Math.floor(Math.random() * (-35) + (35) - (35)));
						if (!this._onceSplit) {
							this._onceSplit = true;
							return;
						}
					}	
				}
			} else if (this._onceSplit) {
				this.moveTo(x, y);
				return;
			}
		}		
	}


	calcBestPlayerForEat(bX, bY, bS) {
		let bestDistance = 10000.0;
		let eatEvent = null;
		Object.keys(this._WorldCells).forEach(key => {
			let node = this._WorldCells[key];
			if(node.isFood == false && node.isVirus == false) {
				if (node.size < ((bS / 2) * 0.75)) {
					let dist = this.calcDist(bX, bY, node.xPos, node.yPos);
					if (dist < bestDistance) {
						bestDistance = dist;
						eatEvent = node;
					}
				}
			}
		});
		return {
			bestDistance: bestDistance,
			eatEvent: eatEvent
		}
	}


	calcBestEatEvent(bX, bY, bS) {
		let bestDistance = 10000.0;
		let eatEvent = null;
		Object.keys(this._WorldCells).forEach(key => {
			let node = this._WorldCells[key];
			if (node.isFood) {
				if (node.size < bS * 0.75) {
					let dist = this.calcDist(bX, bY, node.xPos, node.yPos);
					if (dist < bestDistance) {
						bestDistance = dist;
						eatEvent = node;
						setTimeout(function() {
							if (this._WorldCells[eatEvent.id]) {
								delete this._WorldCells[eatEvent.id];
								return;
							} else {
								return;
							}
						}.bind(this), 3000);
					}
				}
			}
		});
		return {
			bestDistance: bestDistance,
			eatEvent: eatEvent
		}
	}

	calcDist(botX, botY, nodeX, nodeY) {
		let dist = null;
		dist = Math.abs(nodeX - botX) + Math.abs(nodeY - botY);
		return dist;
	}

	split() {
		if (!this._onceSplit) return;
		this.send(Buffer.from([17]), true);
	}

	eject() {
		if (!this._onceSplit) return;
		this.send(Buffer.from([21]), true);
	}

	spawn() {
		let newbotNick = names[Math.floor(Math.random() * names.length)];
		let buf = new Buffer.alloc(2 + Buffer.byteLength(newbotNick));
		buf.writeUInt8(0, 0);
		buf.write(newbotNick, 1);
		buf.writeUInt8(0, buf.length - 1);
		this.send(buf, true);
	}	

	onclose(e) {
		this._lastBorderTime = Date.now();
		this._borders = Object.assign(defaultBorders);	
		this._encryptionKey = 673720360 ^ this._protocolKey;
		this._decryptionKey = 0;
		this._offsetX = 0;
		this._offsetY = 0;
		this._unuseableProxy = false;
		this._spawned = false;
		this._ws = null;
		if(this._switchMoveInt != null) {
			clearInterval(this._switchMoveInt);
			this._switchMoveInt = null;
		}
		this._fSpawn = false;
		this._sendFBdata = false;
		if(this.auth_token) global.facebookManger.returnToken(this.auth_token);
		this.auth_token = null;
		if (this.reconnecting) setTimeout(this.connect.bind(this, 50));
	}

	onerror(e) {
		this._lastBorderTime = Date.now();
		this._borders = Object.assign(defaultBorders);
		this._encryptionKey = 673720360 ^ this._protocolKey;
		this._decryptionKey = 0;
		this._offsetX = 0;
		this._offsetY = 0;
		this._unuseableProxy = false;
		this._spawned = false;
		this._ws = null;
		this._sendFBdata = false;
	}

	moveTo(xPos, yPos) {
		if (!this._ws || this._ws.readyState != 1) return;
		try {
			let buf = new Buffer.alloc(13);
			buf.writeUInt8(16, 0);
			buf.writeInt32LE(xPos + this._offsetX, 1);
			buf.writeInt32LE(yPos + this._offsetY, 5);
			buf.writeInt32LE(this._decryptionKey, 9);
			this.send(buf, true);
		} catch (e) {

		}
	}

	send(buf, runEncryption, fb) {
		if (!this._ws || this._ws.readyState != 1) return;
		if (runEncryption) {
			buf = this.xorBuffer(buf, this._encryptionKey);
			this._encryptionKey = this.rotateKey(this._encryptionKey);
		}
		this._ws.send(buf);
	}

	xorBuffer(buf, xorKey) {
		try {
			const newBuf = new Buffer.alloc(buf.byteLength);
			for (let i = 0; i < buf.byteLength; i++) newBuf.writeUInt8(buf.readUInt8(i) ^ xorKey >>> i % 4 * 8 & 255, i);
			return newBuf;
		} catch (e) {}
	}

	rotateKey(key) {
		key = Math.imul(key, 1540483477) >> 0;
		key = (Math.imul(key >>> 24 ^ key, 1540483477) >> 0) ^ 114296087;
		key = Math.imul(key >>> 13 ^ key, 1540483477) >> 0;
		return key >>> 15 ^ key;
	}
}

class Cell {
	constructor() {
		this.isVirus = false;
		this.isFood = false;
		this.xPos = 0;
		this.yPos = 0;
		this.size = 0;
		this.id = 0;
	}
}

module.exports = user;