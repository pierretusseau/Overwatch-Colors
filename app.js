$(document).ready(function() {

	var c = document.getElementById("c");
	var ctx = c.getContext("2d");
	var cH;
	var cW;
	var bgColor = "#CBC1AD";
	var animations = [];
	var circles = [];
	var chars = ["ana","bastion","dva","genji","hanzo","junkrat","lucio","mccree","mei","mercy","pharah","reaper","reinhardt","roadhog","soldier","sombra","symmetra","torbjorn","tracer","widow","winston","zarya","zenyatta"];
	var colors = ["#CBC1AD","#6D984C","#FF7FD0","#83FD01","#928748","#D29208","#8AEB22","#8D3939","#9ADAF3","#FEE06B","#1A64C5","#272725","#A9958D","#C09476","#586FB5","#8e5ab5","#5BEBFF","#FF6100","#F7931B","#6F6FAE","#4C505B","#F470A7","#C69B00"];
	var previousColor = "#CBC1AD";
	var spanCouleur = document.getElementById('span-couleur');
	var spanChar = document.getElementById('span-char');

	var colorPicker = (function() {
		// var colors = [
		// 	"ana" 			: "#CBC1AD",
		// 	"bastion" 		: "#6D984C",
		// 	"dva" 			: "#FF7FD0",
		// 	"genji" 		: "#83FD01",
		// 	"hanzo" 		: "#928748",
		// 	"junkrat" 		: "#D29208",
		// 	"lucio" 		: "#8AEB22",
		// 	"mccree" 		: "#8D3939",
		// 	"mei" 			: "#9ADAF3",
		// 	"mercy" 		: "#FEE06B",
		// 	"pharah" 		: "#1A64C5",
		// 	"reaper" 		: "#272725",
		// 	"reinhardt"		: "#A9958D",
		// 	"soadhog" 		: "#A9958D",
		// 	"soldier" 		: "#586FB5",
		// 	"sombra" 		: "#8e5ab5",
		// 	"symmetra" 		: "#5BEBFF",
		// 	"torbjorn" 		: "#FF6100",
		// 	"tracer" 		: "#F7931B",
		// 	"widow" 		: "#6F6FAE",
		// 	"winston" 		: "#4C505B",
		// 	"zarya" 		: "#F470A7",
		// 	"zenyatta" 		: "#C69B00"
		// ];
		var index = 0;
		function next() {
			index = index++ < colors.length-1 ? index : 0;
			// tests perso pour savoir quel personnage pop quand
			// console.log(chars[index]);
			return colors[index];
		}
		function current() {
			// tests perso pour savoir quel personnage pop quand
			// console.log(chars[index]);
			return colors[index]
		}
		return {
			next: next,
			current: current
		}
	})();

	function removeAnimation(animation) {
		var index = animations.indexOf(animation);
		if (index > -1) animations.splice(index, 1);
	}

	function calcPageFillRadius(x, y) {
		var l = Math.max(x - 0, cW - x);
		var h = Math.max(y - 0, cH - y);
		return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
	}

	// Ca écoute le click
	function addClickListeners() {
		// légèrement custom "click"
		document.addEventListener("click", handleEvent);
		// pas trouvé à quoi ça pouvait servir
		//document.addEventListener("mousedown", handleEvent);
	};

	// Ca gere tout le click
	function handleEvent(e) {
		if (e.touches) {
			e.preventDefault();
			e = e.touches[0];
		}

		// Custom script test
		var clickedItem = e.target.id;
		// console.log("Hello " + clickedItem);

		if (chars.includes(clickedItem)) {
			// connaître l'index du personnage concerné
			// console.log(chars.indexOf(clickedItem));
			var colorIndexNumber = chars.indexOf(clickedItem)
			var nextColor = colors[colorIndexNumber];
			spanCouleur.innerHTML = colors[colorIndexNumber];
			spanChar.innerHTML = chars[colorIndexNumber];
			// useless ?
			//e.stopPropagation();

			// var currentColor = colorPicker.current();
			var currentColor = ColorLuminance(colors[colorIndexNumber], 0.2);
			// var nextColor = colorPicker.next();
			var targetR = calcPageFillRadius(e.pageX, e.pageY);
			var rippleSize = Math.min(200, (cW * .4));
			var minCoverDuration = 750;

			var pageFill = new Circle({
				x: e.pageX,
				y: e.pageY,
				r: 0,
				fill: nextColor
			});
			var fillAnimation = anime({
				targets: pageFill,
				r: targetR,
				duration:  Math.max(targetR / 2 , minCoverDuration ),
				easing: "easeOutQuart",
				complete: function(){
					bgColor = pageFill.fill;
					removeAnimation(fillAnimation);
				}
			});

			var ripple = new Circle({
				x: e.pageX,
				y: e.pageY,
				r: 0,
				fill: currentColor,
				stroke: {
					width: 3,
					color: currentColor
				},
				opacity: 1
			});
			var rippleAnimation = anime({
				targets: ripple,
				r: rippleSize,
				opacity: 0,
				easing: "easeOutExpo",
				duration: 900,
				complete: removeAnimation
			});

			var particles = [];
			for (var i=0; i<32; i++) {
				var particle = new Circle({
					x: e.pageX,
					y: e.pageY,
					fill: currentColor,
					r: anime.random(24, 48)
				})
				particles.push(particle);
			}
			var particlesAnimation = anime({
				targets: particles,
				x: function(particle){
					return particle.x + anime.random(rippleSize, -rippleSize);
				},
				y: function(particle){
					return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
				},
				r: 0,
				easing: "easeOutExpo",
				duration: anime.random(1000,1300),
				complete: removeAnimation
			});
			animations.push(fillAnimation, rippleAnimation, particlesAnimation);
		}

	}

	function extend(a, b){
		for(var key in b) {
			if(b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}

	var Circle = function(opts) {
		extend(this, opts);
	}

	Circle.prototype.draw = function() {
		ctx.globalAlpha = this.opacity || 1;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
		if (this.stroke) {
			ctx.strokeStyle = this.stroke.color;
			ctx.lineWidth = this.stroke.width;
			ctx.stroke();
		}
		if (this.fill) {
			ctx.fillStyle = this.fill;
			ctx.fill();
		}
		ctx.closePath();
		ctx.globalAlpha = 1;
	}

	var animate = anime({
		duration: Infinity,
		update: function() {
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, cW, cH);
			animations.forEach(function(anim) {
				anim.animatables.forEach(function(animatable) {
					animatable.target.draw();
				});
			});
		}
	});

	var resizeCanvas = function() {
		cW = window.innerWidth;
		cH = window.innerHeight;
		c.width = cW * devicePixelRatio;
		c.height = cH * devicePixelRatio;
		ctx.scale(devicePixelRatio, devicePixelRatio);
	};

	(function init() {
		resizeCanvas();
		// NO NEED POUR MOI
		// if (window.CP) {
		// 	// CodePen's loop detection was causin' problems
		// 	// and I have no idea why, so...
		// 	window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
		// }
		window.addEventListener("resize", resizeCanvas);
		addClickListeners();
		// NO NEED POUR MOI
		// if (!!window.location.pathname.match(/fullcpgrid/)) {
		// 	startFauxClicking();
		// }
		// NO NEED POUR MOI
		//handleInactiveUser();
	})();

	// NO NEED //
	// function handleInactiveUser() {
	// 	var inactive = setTimeout(function(){
	// 		fauxClick(cW/2, cH/2);
	// 	}, 2000);
	//
	// 	function clearInactiveTimeout() {
	// 		clearTimeout(inactive);
	// 		document.removeEventListener("mousedown", clearInactiveTimeout);
	// 		document.removeEventListener("touchstart", clearInactiveTimeout);
	// 	}
	//
	// 	document.addEventListener("mousedown", clearInactiveTimeout);
	// 	document.addEventListener("touchstart", clearInactiveTimeout);
	// }

	// NO NEED //
	// function startFauxClicking() {
	// 	setTimeout(function(){
	// 		fauxClick(anime.random( cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
	// 		startFauxClicking();
	// 	}, anime.random(200, 900));
	// }

	// NO NEED //
	// function fauxClick(x, y) {
	// 	var fauxClick = new Event("mousedown");
	// 	fauxClick.pageX = x;
	// 	fauxClick.pageY = y;
	// 	document.dispatchEvent(fauxClick);
	// }

	// Custom truc
	// https://www.sitepoint.com/javascript-generate-lighter-darker-color/
	function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}


});
