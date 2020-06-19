
const gameSettings = {
	map: {
		x: 4,
		y: 4
	},
	el: {
		btn_check: "#btn-check",
		btn_renew: "#btn-renew",
		btn_showAnswer: "#btn-showans",
		div_input: "#inputs",
	},

	enable: {
		renew: true,
		showAnswer: false
	}
};

const gameObject = {

	map: null,
	trueMap: null,
	slots: 0, // 方块总数

	changed: false, // 检查完成后如果未进行更改则禁止再次检查

	gamestate: { // 最后一次Check的结果
		ans: 0,
		col: 0,
		row: 0,
		both: 0
	},

	tried: 0, // 尝试次数
	started: false,
	gameover: false,
	cheated: false, // 如果开启则不进行Check

	timer: { // 计时
		start: 0,
		end: 0,
		all: 0,
		interval: null,
		allInterval: 0
	},

};

/** 页面加载完成后的载入入口 */
function init() {

	// 加载配置
	configure();

	// Init Map
	initMap(gameSettings.map.x, gameSettings.map.y);

	// Print TrueMap
	console.log(gameObject.trueMap);

}

function configure() {

	if(!gameSettings.enable.renew) {
		document.querySelector(gameSettings.el.btn_renew).style.display = "none";
	}

	if(!gameSettings.enable.showAnswer) {
		document.querySelector(gameSettings.el.btn_showAnswer).style.display = "none";
	}

}

/** 在GameObject中进行地图初始化 */
function initMap(x, y) {

	/** 创建元素地图 */
	gameObject.map = new Array(x);
	for (let index = 0; index < gameObject.map.length; index++) {
		gameObject.map[index] = new Array(y);
	}

	/** 创建答案地图 */
	gameObject.trueMap = new Array(x);
    for (let index = 0; index < gameObject.trueMap.length; index++) {
		let arr = new Array(y);
		for(let index = 0; index < arr.length; index++) {
			arr[index] = Math.floor(Math.random()*10);
			gameObject.slots += 1;
		}
        gameObject.trueMap[index] = arr;
    }

	let container = document.querySelector(gameSettings.el.div_input);

	/** 创建输入元素，并绑定到GameObject地图 */
	for(let i=0; i<x; i++) {
		for(let j=0; j<y; j++) {
			let el = document.createElement("input");
			
			// <input class="game-input" x="0" y="0" max=9 min=0 value=0 type="number">
			el.type = "number";
			el.value = 0;

			el.setAttribute("class", "game-input");
			el.setAttribute("x", i);
			el.setAttribute("y", j);
			el.setAttribute("max", 9);
			el.setAttribute("min", 0);

			el.onchange = ()=>{
				onChanged();
			};

			container.appendChild(el);

			gameObject.map[i][j] = el;
		}

		container.appendChild(document.createElement("br"));
	}

}

function setCurrent(el, val) {
	el.setAttribute("current", val?"1":"0");
}

function setOthers(el, val) {
	el.setAttribute("others", val);
}

/** 检查函数 */
function check(silent = true) {

	if(!gameObject.changed) {
		console.log("Detect unchanged state, skipping this check!");
		return;
	}

	if(gameObject.gameover) {
		console.log("Detect gameover state, skipping this check!");
		return;
	}

	let gs_ans = 0, gs_col = 0, gs_row = 0, gs_both = 0;

	for(let i=0; i<gameSettings.map.x; i++) {
		for(let j=0; j<gameSettings.map.y; j++) {

			let el = gameObject.map[i][j];
			let val = el.value;

			// 查询current
			let current = gameObject.trueMap[i][j] == val;

			// 写入current
			setCurrent(el, current);

			/**
			 * Col：竖行
			 * Row：横行
			 * Both：横竖都有
			 */

			let others = 0;

			// 检查横行（Row）
			for(let j0 = 0; j0 < gameObject.trueMap[i].length; j0++) {
				if(gameObject.trueMap[i][j0] == val) {
					others += 2;
					break;
				}
			}

			// 检查竖行（Col）
			for(let i0 = 0; i0 < gameObject.trueMap.length; i0++) {
				if(gameObject.trueMap[i0][j] == val) {
					others += 1;
					break;
				}
			}

			// 写入others
			setOthers(el, others);

			// #gamestate
			gs_ans  += current?1:0;
			gs_col  += others==1?1:0;
			gs_row  += others==2?1:0;
			gs_both += others==3?1:0;
		}
	}

	// 更新GameState数据
	let gs  = gameObject.gamestate;
	gs.ans  = gs_ans;
	gs.col  = gs_col;
	gs.row  = gs_row;
	gs.both = gs_both;

	// 禁止下一次检查
	gameObject.changed = false;

	if(!gameObject.cheated) {
		gameObject.tried += 1;
	}

	// 检查游戏是否结束
	let gameover = gameObject.gamestate.ans == gameObject.slots;
	if(gameover) {
		gameObject.gameover = true;
		if(!gameObject.cheated)
			onGameOver();
	}

	// 进行一次更新
	onUpdate();
}

function onChanged() {
	gameObject.changed = true;
	if(!gameObject.started) {
		gameObject.started = true;
		gameObject.timer.start = new Date().getTime();
		gameObject.timer.interval = setInterval("onSecond()", 1000);
	}
}

function onUpdate() {

	// 更新数据
	document.querySelector("#tried").innerHTML = gameObject.tried + (gameObject.gameover ? "（游戏结束）" : "");

}

function onSecond() {
	gameObject.timer.allInterval += 1;
	document.querySelector("#time").innerHTML = gameObject.timer.allInterval;
}

function newGame() {
	// 删除旧输入方块
	document.querySelector(gameSettings.el.div_input).innerHTML = "";

	// 初始化GameObject
	gameObject.map = null;
	gameObject.trueMap = null;
	gameObject.slots = 0;
	gameObject.changed = false;
	gameObject.tried = 0;
	gameObject.gamestate = {
		ans: 0,
		col: 0,
		row: 0,
		both: 0
	};
	gameObject.started = false;
	gameObject.gameover = false;
	gameObject.cheated = false;
	gameObject.timer = {
		start: 0,
		end: 0,
		all: 0
	};

	// 新游戏
	init();
}

/** 显示答案 */
function showAnswer(cheated = true) {

	gameObject.cheated = cheated;

	for(let i=0; i<gameObject.map.length; i++) {
		for(let j=0; j<gameObject.map[i].length; j++) {
			gameObject.map[i][j].value = gameObject.trueMap[i][j];
		}
	}

	check();

}

function showGameState() {
	console.log("## GameState ##");
	console.log("ANS", gameObject.gamestate.ans);
	console.log("COL", gameObject.gamestate.col);
	console.log("ROW", gameObject.gamestate.row);
	console.log("BTH", gameObject.gamestate.both);
}

/** 当游戏结束时进行的函数 */
function onGameOver() {
	gameObject.timer.end = new Date().getTime();
	gameObject.timer.all = gameObject.timer.end - gameObject.timer.start;
	clearInterval(gameObject.timer.interval);
	alert(`你赢得了游戏！\n尝试${gameObject.tried}次\n耗时${gameObject.timer.allInterval}秒`);
}
