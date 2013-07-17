window.TTT = (function () {
	(function (w, e, l, t, a, r, A, D, _) { e = "eventTarget"; if (!w[e]) { l = "EventListener", t = "tachEvent", a = "add", r = "remove", A = "at", D = "de"; _ = w[e] = {}; if (w[a + l] && w[r + l]) _[a] = a + l, _[r] = r + l; else if (w[A + t] && w[A + t]) _[a] = A + t, _[r] = D + t; else w[e] = null; } })(window);

	var style = (function () {
		var style = document.createElement("STYLE");
		style.type = "text/css";

		style.css = ("\
			#id {width:312px; height:312px; background:black; padding:2px;}\
			#id .space {\
				background:white; margin:2px;\
				display:block; float:left;\
				width:100px; height:100px;\
				text-align:center; line-height:100px;\
			}\
			#id .space span {font-size:100px; display:none;}\
			#id .space.player1 span.selected1 {display:block;}\
			#id .space.player2 span.selected2 {display:block;}\
		");

		style.fix = (function () {
			//var test = "#id {width:900px; height:900px;}\n#id span {display:block; float:left; width:100px; height:100px;} body #id {}";
			var find = /((?:^|[\n\r},])\s*)([\W\w]*?)#id(?=[\s,{])([^{,]*?)(?=\s*{)/g;
			var replace = function (match, before, pre, post) {
				var returned = before + pre + ids.join(post + ", " + pre) + post;
				return returned;
			};

			return function () {
				this.innerHTML = this.css.replace(find, replace);
			}
		})();

		document.head.appendChild(style);

		return style;
	})();

	var ids = [];

	function TTT(id) {
		if (id == null) { id = "TTT"; }

		var container = this.HTML = document.createElement("DIV");
		container.id = id;

		ids.push("#id1");
		ids.push("#" + id);
		style.fix();

		var spaces = this.spaces = [];
		var ordered = this.spaces.ordered = [];
		var rows = [[], [], []],
			cols = [[], [], []],
			back = [], forward = [];
		var i = 0, il = 9, col, row;
		for (var i = 0, l = 9; i < l; i++) {
			var space = new Space(this);

			col = (i % 3);
			row = ((i / 3) | 0);

			console.log(col, row);

			connectSpaceToLine(space, "col", cols[col]);
			connectSpaceToLine(space, "row", rows[row]);
			if (col === row) {
				connectSpaceToLine(space, "back", back);
			}
			if ((col + row) === 2) {
				connectSpaceToLine(space, "forward", forward);
			}

			spaces.push(space);
			ordered.push(space);
			container.appendChild(space.HTML);
		}

		console.log("cols: ", cols);
		console.log("rows: ", rows);
		console.log("back: ", back);
		console.log("forward: ", forward);
		console.log(spaces);
	}
	TTT.prototype = {
		HTML: null,

		findBestMove: function (player) {
			var opponent = -(1 - 3);
			var best = null, bestAdv = 0, bestThreat = 0, bests = [];
			var spaces = this.spaces, space, spaceAdv, spaceThreat;
			var i = 0, l = spaces.length;
			while (i < l) {
				space = spaces[i];

				if (best === null) {
					best = space;
					bests.push(space);
					bestAdv = (space.weight[player] - space.weight[opponent]);
					bestThreat = space.weight[opponent];
				}
				else {
					spaceAdv = (space.weight[player] - space.weight[opponent]);
					spaceThreat = space.weight[opponent];
					if (spaceThreat === 2) {
						if (bestThreat < spaceThreat) {
							bests.length = 0;
							best = space;
						}

						bests.push(space);
					}
					else if (spaceAdv >= bestAdv) {
						if (spaceAdv > bestAdv) {
							best = space; bestAdv = spaceAdv;
							bests.length = 0;
						}

						bests.push(space);
					}

				}

				i++;
			}

			if (bests.length > 1) {
				best = bests[(Math.random() * bests.length) | 0];
			}

			console.log(
				"player " + player + "'s best move " +
				"at an advantage of " + bestAdv + ": ",
				best.HTML, bests
			);

			bests.length = 0;
			return best;
		}
	};

	function connectSpaceToLine(space, lineName, line) {
		var local = space[lineName] = [];
		local.selected = selected;

		var i = 0, l = line.length, lineSpace;
		while (i < l) {
			lineSpace = line[i];
			lineSpace[lineName].push(space);
			space[lineName].push(lineSpace);

			i++;
		}

		line.push(space);
	}
	var selected = (function () {
		var i, l, space, alreadyOwned;
		return function selected(player) {
			i = 0; l = this.length;

			alreadyOwned = 0;
			opponentOwns = 0;
			while (i < l) {
				space = this[i];
				if (space.player === 0) {
					space.weight[player]++;
				}
				else {
					if (space.player === player) {
						alreadyOwned++;
					}
					else {
						opponentOwns++;
					}
				}

				i++;
			}

			if (opponentOwns > 0) {
				i = 0; l = this.length;
				while (i < l) {
					space = this[i];
					space.weight[player] = 0;

					i++;
				}
			}

			space = undefined;

			if (alreadyOwned === 2) { return true; }
		};
	})();

	function debug(TTT) {
		// https://en.wikipedia.org/wiki/Box-drawing_character
		console.log(
			TTT.spaces.map(function (v, i) {
				var returned = "";

				var isLeft = ((i % 3) === 0);
				var isTop = (i < 3);

				if (isLeft && !isTop) {
					returned += "\n\u2550\u2550\u2550\u2550\u2550\u256c\u2550\u2550\u2550\u2550\u2550\u256c\u2550\u2550\u2550\u2550\u2550\n";
				}

				if (!isLeft) {
					returned += "\u2551";
				}

				return returned + v.weight[1] + ":" + v.weight[2] + ":" + v.player;
			}).join("") + "\n"
		);
	};

	var Space = (function () {
		var template = (function () {
			var template = document.createElement("SPAN");
			template.className = "space";
			template.innerHTML = (
				"<span class='selected1'>X</span>" +
				"<span class='selected2'>O</span>"
			);
			return template;
		})();

		function Space(TTT) {
			this.TTT = TTT;

			var HTML = this.HTML = template.cloneNode(true);
			HTML.Space = this;

			HTML[eventTarget.add]("mousedown", select);
			HTML[eventTarget.add]("contextmenu", select);

			this.connected = new Connections();

			this.player = 0;
			this.weight = { 1: 0, 2: 0 };

			this.col = this.row = this.back = this.forward = null;
		}
		Space.prototype = {
			HTML: null,
			player: 0, weight: null,

			col: null, row: null, back: null, forward: null,

			select: function (player) {
				if (this.player !== 0) { return; }

				this.player = player;
				this.HTML.className = "space player" + player;

				this.weight[1] = 0; this.weight[2] = 0;

				//console.clear();

				var row, col, back, forward;
				if ((row = this.row) && (row.selected(player))) {
					console.log("player " + player + " won!", row);
				}
				if ((col = this.col) && (col.selected(player))) {
					console.log("player " + player + " won!", col);
				}
				if ((back = this.back) && (back.selected(player))) {
					console.log("player " + player + " won!", back);
				}
				if ((forward = this.forward) && (forward.selected(player))) {
					console.log("player " + player + " won!", forward);
				}

				debug(this.TTT);
				//TTT.findBestMove(1);
				//TTT.findBestMove(2);
				////console.log("player 1's best move: ", TTT.findBestMove(1).HTML);
				////console.log("player 2's best move: ", TTT.findBestMove(2).HTML);
				
				//if (player === 1) {
				//	this.TTT.findBestMove(2).select(2);
				//}
			},

			reset: function () {
				this.HTML.className = "space";
				this.player = null;
			}
		};

		function select(e) {
			if (e.preventDefault) { e.preventDefault(); }

			var space = (e.target.Space || e.target.parentNode.Space);
			space.select((e.button === 0) ? 1 : 2);
		}

		var Connections = (function () {
			function Connections() {
				this.list = [];
			}
			Connections.prototype = {
				list: null,

				connectTo: function (space) {
					space.connections.list.push(this);
					this.list.push(space);
				},
				changePlayerWeight: (function () {
					var list, space;
					var i, l;
					return function (player) {
						list = this.list;
						i = 0; l = list.length;
						while (i < l) {
							space = list[i];
							if (space.player === 0) {
								space.weight[player] += 1;
							}

							i++;
						}

						list = null; space = null;
					};
				})()
			};

			return Connections;
		})();

		return Space;
	})();

	

	return TTT;
})();


/*
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:0║1:0
add advantage to lines

 X ║   ║   		0:0║1:1║1:1
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║1:1║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║1:0
zero space on same line as both players

 X ║   ║   		0:0║1:1║2:1
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║3:1║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:0║1:0║0:0
choose spac with most threat
	or most advantageous,
	favouring advantage in ties
add 2 to space on same line as 2 player spaces

 X ║   ║   		0:0║1:2║2:2
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║   		0:0║0:0║1:3
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:1║1:1║0:0

 X ║   ║   		0:0║1:2║4:2
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:1║1:1║0:0

 X ║   ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:3║1:1║0:0

 X ║   ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 X ║   ║ X 		0:0║3:1║0:0

 X ║   ║ O 		0:0║0:2║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 X ║ O ║ X 		0:0║0:0║0:0

 X ║ X ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 X ║ O ║ X 		0:0║0:0║0:0



 when 2 spaces take by the same player
	on the same line, SET weight of third
	space to 0,3

 O ║ O ║   		0:0║0:0║2:3
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║   		1:1║0:0║2:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		2:1║1:0║0:0





   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:0║1:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║1:1║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:1║0:0║1:0
update line
each space's weight for a player
	= maximum count of all player's 
	spaces on all coinciding lines

 X ║ X ║   		0:0║0:0║2:0
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║1:1║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:1║1:0║1:0

 X ║ X ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║1:1║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:1║1:0║1:1

 X ║ X ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║   		0:0║2:1║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║   		1:1║0:0║1:1

 X ║ X ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║   		0:0║0:0║0:2
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║   		1:1║0:0║1:1

 X ║ X ║ O 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║   		1:1║0:0║1:1




   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:0║1:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:1║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:1║1:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║2:1║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:0║1:1║0:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:0║1:2║0:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║ X 		2:0║0:0║0:0

 X ║ O ║   		0:0║0:0║1:2
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
 O ║ X ║ X 		0:0║0:0║0:0

 X ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║2:1
═══╬═══╬═══		═══╬═══╬═══
 O ║ X ║ X 		0:0║0:0║0:0

 X ║ O ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║ O 		2:1║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
 O ║ X ║ X 		0:0║0:0║0:0



   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:0║1:0

 X ║   ║   		0:0║1:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ O 		1:1║0:1║0:0

 X ║   ║   		0:0║1:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ O 		1:1║0:1║0:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:0║1:1║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ O 		1:1║0:1║0:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ X ║ X 		2:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ O 		1:1║1:1║0:0

 X ║ O ║   		0:0║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
 O ║ X ║ X 		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ O 		1:1║1:1║0:0


   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		0:0║0:0║0:0

 X ║   ║   		0:0║1:0║1:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║1:0║0:0
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:0║0:0║1:0

 X ║   ║   		0:0║1:1║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║0:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║   		1:1║0:1║1:1

 X ║   ║   		0:0║1:1║2:1
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		2:1║1:1║0:0
-
 X ║   ║   		0:0║1:1║1:2
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
 O ║   ║ X 		0:0║1:1║0:1
+
 X ║   ║   		0:0║1:1║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║ O ║   		1:1║0:0║1:1
═══╬═══╬═══		═══╬═══╬═══
   ║   ║ X 		1:1║1:1║0:0

// http://en.wikipedia.org/wiki/Tic-tac-toe

*/



