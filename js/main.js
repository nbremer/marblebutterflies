var width = document.body.clientWidth; 
var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);

var canvas = document.getElementById("canvas-lines");
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

// let sf = 3
// d3.select("#canvas-lines")
//     .attr("width", sf * width)
//     .attr("height", sf * height)
//     .style("width", `${width}px`)
//     .style("height", `${height}px`)
// ctx.scale(sf, sf)

//Should the fronts of the paths be shown
var showMarker = false;
if(showMarker) {
	//Second canvas for the markers only
	var canvas_markers = document.getElementById("canvas-markers");
	canvas_markers.width = width;
	canvas_markers.height = height;
	var ctxm = canvas_markers.getContext("2d");
}//if

//From https://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-1
var devicePixelRatio = window.devicePixelRatio || 1;
var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1;
var ratio = devicePixelRatio / backingStoreRatio;

// // upscale the canvas if the two ratios don't match
// if (devicePixelRatio !== backingStoreRatio) {
//     canvas.width = width * ratio;
//     canvas.height = height * ratio;
// 		canvas.style.width = width + 'px';
// 		canvas.style.height = height + 'px';
//     // now scale the context to counter
//     // the fact that we've manually scaled our canvas element
//     ctx.scale(ratio, ratio);
// }//if

// //Actually downscale the canvas to have a bit of a blurry effect on non-retina screens
// if (devicePixelRatio === 1) {
// 	width = width/2;
// 	height = height/2;
//     canvas.width = width;
//     canvas.height = height;
//     canvas.style.width = (2*width) + 'px';
// 	canvas.style.height = (2*height) + 'px';
//     // now scale the context to counter the fact that we've manually scaled our canvas element
//     //ctx.scale(0.5, 0.5);
// }//if

//For scaling if line thickness, forces and such based on screen size
var scaling = Math.min(1, +round2(Math.max(width/2500, height/1500)));
//console.log(scaling);

//Should the white logo on top be shown?
var showLogo = getQueryVariable("logo") === "no" ? false : true;

//Randomly choose to start from the center or outside the screen
var originCenter = Math.random() > 0.5 ? 1 : 0;

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

ctx.globalCompositeOperation = "screen";
ctx.lineCap = "round";

var ID = 0;
var bf = [];
var timer;

var colorMap = [];
colorMap["red"] 	= "#CE1836";
colorMap["copper"] 	= "#E14B18";
colorMap["orange"] 	= "#FA6900";
colorMap["yellow"] 	= "#FABE28";
colorMap["green"] 	= "#8FBE00";
colorMap["blue"] 	= "#00A8C6";
colorMap["purple"] 	= "#6E1E62";
colorMap["white"] 	= "#ffffff";
colorMap["grey"] 	= "#BDB8AD";
colorMap["black"] 	= "#000000";

var radius = Math.max(200*scaling, width/10, height/6);
var hex = hexArray(width, height, radius);

//Is the credit rect shown
var shown = false;
d3.select(".credit-rect").style("opacity", 0);

var fontScale = d3.scaleLinear()
	.domain([100,200])
	.range([40,90]);

//Path for the title
var fontPath,
	letters = [],
	fontSize = fontScale(radius);

//Path for the butterfly in the center
var imageWidth = 90.7,
	imageHeight = 60,
	imageScale = 1.25*radius/imageWidth;
var butterflyPath = 
[ 
	{ marker: "M", values: [ 45.4,50.6 ] }, 
	{ marker: "c", values: [ -15.9,24.7, -27.1,16.6, -31,9.4 ] },
	{ marker: "C", values: [ 2.3,37.3, 28.2,34.5, 28.2,34.5 ] },
	{ marker: "C", values: [ 2.3,41.9, 1.9,26.7, 1.1,19.6 ] },
	{ marker: "C", values: [ -1,1.5, 7.4,0.8, 11.9,1.7 ] },
	{ marker: "c", values: [ 19.9,4, 33.5,30.4, 33.5,30.4 ] },
	{ marker: "c", values: [ 0.2,0, 13.6,-26.5, 33.5,-30.4 ] },
	{ marker: "c", values: [ 4.5,-0.9, 12.9,-0.2, 10.8,17.9 ] },
	{ marker: "c", values: [ -0.8,7.1, -1.3,22.3, -27.1,14.9 ] },
	{ marker: "c", values: [ 0,0, 25.9,2.8, 13.8,25.4 ] },
	{ marker: "C", values: [ 72.5,67.1, 61.3,75.3, 45.4,50.6 ] }
];
var butterflyPoints = [
	// {x: 45.4, y: 50.6}, 
	// {x: 14.5, y: 60}, 
	// {x: 28.2, y: 34.5}, 
	// {x: 1.1,  y: 19.6}, 
	// {x: 11.9, y: 1.7}, 
	// {x: 45.4, y: 32.1}, 
	// {x: 78.9, y: 1.7}, 
	// {x: 89.7, y: 19.6}, 
	// {x: 62.6, y: 34.5}, 
	// {x: 76.4, y: 59.9}, 
	// {x: 45.4, y: 50.6}, 
	// {x: 45.4, y: 32.6, fixed: true},
	// {x: 33.4, y: 15.6, fixed: false},
	// {x: 17.4, y: 3.6, fixed: false},
	// {x: 5.4, y: 2.6, fixed: false},
	// {x: 0.4, y: 12.6, fixed: false},
	// {x: 5.4, y: 32.6, fixed: false},
	// {x: 27.4, y: 34.6, fixed: true},
	// {x: 12.4, y: 44.6, fixed: false},
	// {x: 17.4, y: 63.6, fixed: false},
	// {x: 25.4, y: 67.6, fixed: false},
	// {x: 45.4, y: 50.6, fixed: true},
	// {x: 66.4, y: 67.6, fixed: false},
	// {x: 73.4, y: 63.6, fixed: false},
	// {x: 78.4, y: 44.6, fixed: false},
	// {x: 62.4, y: 34.6, fixed: true},
	// {x: 85.4, y: 32.6, fixed: false},
	// {x: 90.4, y: 12.6, fixed: false},
	// {x: 85.4, y: 2.6, fixed: false},
	// {x: 72.4, y: 3.6, fixed: false},
	// {x: 57.4, y: 15.6, fixed: false},
	// {x: 45.4, y: 32.6, fixed: true},
	{x: 45.4, y:32.6, fixed: true},
	{x: 41.4, y:25.6, fixed: false},
	{x: 33.4, y:15.6, fixed: false},
	{x: 26.4, y:8.6, fixed: false},
	{x: 17.4, y:3.6, fixed: false},
	{x: 5.4, y:2.6, fixed: true}, //
	{x: 0.4, y:12.6, fixed: false},
	{x: 1.4, y:23.6, fixed: false},
	{x: 5.4, y:32.6, fixed: false},
	{x: 15.4, y:36.6, fixed: false},
	{x: 27.4, y:34.6, fixed: true},
	{x: 14.4, y:40.6, fixed: false},
	{x: 11.4, y:48.6, fixed: false},
	{x: 12.4, y:56.6, fixed: false},
	{x: 17.4, y:63.6, fixed: false},
	{x: 25.4, y:67.6, fixed: true},//
	{x: 34.4, y:63.6, fixed: false},
	{x: 41.4, y:56.6, fixed: false},
	{x: 45.4, y:50.6, fixed: true},
	{x: 49.4, y:56.6, fixed: false},
	{x: 56.4, y:63.6, fixed: false},
	{x: 66.4, y:67.6, fixed: true},//
	{x: 73.4, y:63.6, fixed: false},
	{x: 78.4, y:56.6, fixed: false},
	{x: 79.4, y:48.6, fixed: false},
	{x: 76.4, y:40.6, fixed: false},
	{x: 62.4, y:34.6, fixed: true},
	{x: 75.4, y:36.6, fixed: false},
	{x: 85.4, y:32.6, fixed: false},
	{x: 89.4, y:23.6, fixed: false},
	{x: 90.4, y:12.6, fixed: false},
	{x: 85.4, y:2.6, fixed: true},//
	{x: 72.4, y:3.6, fixed: false},
	{x: 64.4, y:8.6, fixed: false},
	{x: 57.4, y:15.6, fixed: false},
	{x: 49.4, y:25.6, fixed: false},
	{x: 45.4, y:32.6, fixed: true},
];
//Transform the points to the center and correct size
butterflyPoints = transformPath(butterflyPoints);
//var butterflyPointsExtr = getCurvePoints(butterflyPoints, 0.5);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Read in the data /////////////////////////////
///////////////////////////////////////////////////////////////////////////

d3.csv('data/butterflies.csv', function (error, data) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Final data prep /////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	if (error) throw error;

	//Take out some butterflies based on color
	data = data.filter(function(d) { return d.color !== "brown"; }); //&& d.color !== "black" && d.color !== "grey"

	//Get the wingspan size: small, medium or large
	data.forEach(function(d) {
		d.size = d.wingspan.split(" ")[0].toLowerCase();
	})//for each

	if(!showLogo) {
		d3.select(".with-logo").style("display", "none");
	}

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Let the butterflies loose ////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//spawn(data[Math.round(getRandomNumber(0, data.length-1))]);
	//console.log(bf[0].opacity, bf[0].markerSize);

	timer = d3.interval(function(elapsed) {

		//Remove the marker canvas
		if(showMarker) ctxm.clearRect(0, 0, width, height);

		//Stop after 30 seconds
		//if (elapsed > 60000) { timer.stop(); } 
		if (elapsed > 30000 && !shown) {
			d3.select(".credit-rect").transition().duration(4000).style("opacity", 1);
			shown = true;
		}//else if

		//Create new butterflies
		for (var i = 0; i < Math.round(Math.random()*2); i++) spawn(data[Math.round(getRandomNumber(0, data.length-1))]);
		//spawn(data[Math.round(getRandomNumber(0, data.length-1))]);

		//Remove non-alive butterflies
		bf = bf.filter(function(d) { return d.alive; });

		for (var i = 0; i < bf.length; i++) {

	      	ctx.setLineDash([]);
	      	ctx.strokeStyle = bf[i].color;

	      	if(bf[i].species === "Skippers") { //Create circles
	      		//ctx.fillStyle = bf[i].color;
	      		ctx.globalAlpha = bf[i].opacity*0.3;
	      		var start = 0 ;//bf[i].pos.length - 3;
	      		//if(bf[i].pos.length < 10) start = 0;
    			for(var j = start; j < bf[i].pos.length-1; j++) {
    				ctx.beginPath();
    				ctx.arc(bf[i].pos[j].x + (Math.random()>0.5 ? 1 : -1) * Math.random()*bf[i].lineWidth, 
    						bf[i].pos[j].y + (Math.random()>0.5 ? 1 : -1) * Math.random()*bf[i].lineWidth, 
    						bf[i].pos[j].radius, 0, 2*Math.PI, 1);
    				ctx.closePath();
    				ctx.stroke();
    			}//for j
	      	} else { //Create curved lines
	      		ctx.globalAlpha = bf[i].opacity;
	      		ctx.lineWidth = bf[i].lineWidth;
		      	if(bf[i].lineWidth <= 1.5*scaling) {
		      		ctx.setLineDash([bf[i].lineWidth/8, bf[i].lineWidth*4]); /*dashes are Xpx and spaces are Ypx*/
		      	}//if

				//Draw a smooth curve through the points
	      		drawCurve(ctx, bf[i].pos, Math.random());	     		
	      	}//else

			//Adjust the path of the butterflies a bit
			jitter(bf[i].pos, bf[i].jitter);

			//Add a new point to the butterfly if it is still inside the screen
			if(!bf[i].outside) {
				move(bf[i]);
				bf[i].pos.push({x: +round2(bf[i].x), y: +round2(bf[i].y), radius: +round2(bf[i].radius)});

				//Check if the butterfly is outside of the canvas area
				if(bf[i].pos[bf[i].pos.length-1].x < 0 || bf[i].pos[bf[i].pos.length-1].x > width ||
				   bf[i].pos[bf[i].pos.length-1].y < 0 || bf[i].pos[bf[i].pos.length-1].y > height ) {
					bf[i].outside = true;
				}//if

				if(showMarker) {
					//Add a marker point to the top of the path
					ctxm.fillStyle = bf[i].color;
		      		ctxm.globalAlpha = 1; //bf[i].opacity*4;
		      		ctxm.beginPath();
					ctxm.arc(bf[i].pos[bf[i].pos.length-1].x, bf[i].pos[bf[i].pos.length-1].y, 
							 bf[i].markerSize, 0, 2*Math.PI, 1);
					ctxm.closePath();
					ctxm.fill();
				}//if
			}//if

		}//for i

		//"Kill" the oldest butterflies if more than X exist already
		if(bf.length > 300) {
			for (var i = 0; i < bf.length-300; i++) {
				bf[i].alive = false;
			}//for i
		}//if

		if(showLogo) {
			//Draw the hexagon
			ctx.strokeStyle = "white";
	      	ctx.globalAlpha = 0.05;
	      	ctx.lineWidth = 2*scaling;
	      	ctx.beginPath();
	      	ctx.moveTo(hex[0].x + twitch(), hex[0].y + twitch());
			for (var i = 1; i < hex.length; i++) {
				ctx.lineTo(hex[i].x + twitch(), hex[i].y + twitch());
			}//for i
			ctx.closePath();
			ctx.stroke();
			//Draw the circle
	      	ctx.globalAlpha = 0.03;
			ctx.beginPath();
	      	ctx.arc(width/2 + twitch()*0.75, height/2 + twitch()*0.75, radius*1.2, 0, 2*Math.PI, 1);
			ctx.closePath();
			ctx.stroke();
			//Draw the butterfly
			ctx.globalAlpha = 0.015;
			ctx.lineWidth = 1;
			drawSvgPath(ctx, width, height, imageScale, imageWidth, imageHeight, butterflyPath);
			ctx.globalAlpha = 0.015;
			drawCurve(ctx, butterflyPoints, Math.random());
			jitterFixed(butterflyPoints, 0.3);
			//Draw the title
			ctx.globalAlpha = 0.015;
			letters.forEach(function(l) {
				drawCurve(ctx, l[0], Math.random());
				jitter(l[0], Math.random()/4);
			});//forEach
		}//if

	}, 50);//timer

})//d3.csv

///////////////////////////////////////////////////////////////////////////
/////////////////////// Create & move the butterfly ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Jitter the existing path a bit
function jitter(d, jitter) {
	for(var i = 0; i < d.length; i++) {
		d[i].x = +d[i].x + jitter * (Math.random() > 0.5 ? 1 : -1);
		d[i].y = +d[i].y + jitter * (Math.random() > 0.5 ? 1 : -1);
	}//for i
}//jitter

//Calculates the new path to draw
function move(d) {

	d.radius = d.lineWidth*Math.random()*4*scaling;

	d.x += d.vx;
	d.y += d.vy;

	d.vx *= d.drag;
	d.vy *= d.drag;

	if(Math.random() > 0.9) d.direction = -1*d.direction;

	d.theta += d.direction * getRandomNumber( 0, 0.4 ); //getRandomNumber( -1, 1 ) * d.wander;
	d.vx += Math.sin( d.theta ) * d.wander
	d.vy += Math.cos( d.theta ) * d.wander;
}//move

function spawn(d) {

	//Some variables depend on the "size" of the butterfly
	var lineWidth = round2(getRandomNumber( 1, 1.5 ));
	var opacity = getRandomNumber( 0.02, 0.08 )
	var jitter = getRandomNumber( 0.4, 1.4 );
	var force = getRandomNumber( 3, 8 );
	var markerSize = getRandomNumber(1,2);
	if(d.size === "medium") {
		lineWidth = round2(getRandomNumber( 1.25, 2.5 ));
		opacity = getRandomNumber( 0.006, 0.025 );
		jitter = getRandomNumber( 0.5, 2 );
		force = getRandomNumber( 4, 9 );
		markerSize = getRandomNumber(2,3);
	} else if (d.size === "large") {
		lineWidth = round2(getRandomNumber( 1.5, 3 ));
		opacity = getRandomNumber( 0.006, 0.01 ); //lower than 0.006 isn't visible...
		jitter = getRandomNumber( 1, 2);
		force = getRandomNumber( 6, 10 );
		markerSize = getRandomNumber(3,4);
	}//else if

	//But brighter whites
	//if(d.color === "white") opacity = 1.5*opacity;

	var startLoc = findstartLoc(width, height);

	//Create the butterfly
	butterfly = {
		id: ID,			
		
		lineWidth: lineWidth*scaling,
		radius: lineWidth*3*scaling,
		opacity: opacity,
		color: colorOffset(colorMap[d.color]),
		species: d.species,
		markerSize: markerSize*scaling,

		x: startLoc[0], //width/2,
		y: startLoc[1], //height/2,
		wander: getRandomNumber( 1.5, 4 ),
		drag: getRandomNumber( 0.85, 0.99 ),
		theta: startLoc[2], //getRandomNumber( -Math.PI,  Math.PI ),
		force: force*scaling,
		jitter: jitter*scaling,

		outside: false,
		alive: true
	};

	//Set the speed of the butterfly
	butterfly.vx = Math.sin( butterfly.theta ) * butterfly.force;
	butterfly.vy = Math.cos( butterfly.theta ) * butterfly.force;
	butterfly.direction = d.theta >= 0 ? 1 : -1;

	var pos = [];
	//Create some starting positions for butterfly
	for(var i = 0; i < 6; i++) {
		move(butterfly);
		pos.push({x: +round2(butterfly.x), y: +round2(butterfly.y), radius: +round2(butterfly.radius)});
	}//for i
	butterfly.pos = pos;

	ID += 1;

	bf.push( butterfly );
}//spawn

//Get a random starting location that is just outside the screen
function findstartLoc(width, height) {

	//Start from the center
	if(originCenter) {
		return [width/2, height/2, getRandomNumber(0, 2*Math.PI)];
		
		//var pos = Math.floor(Math.random()*butterflyPointsExtr.length);
		//return [butterflyPointsExtr[pos].x, butterflyPointsExtr[pos].y, getRandomNumber(0, 2*Math.PI)];
		//var pos = Math.floor(Math.random()*hex.length);
		//return [hex[pos].x, hex[pos].y, getRandomNumber(0, 2*Math.PI)];
	} else {
		//Start from just outside the screen
		if(Math.random() > 0.5) {
			if(Math.random() > 0.5) {
				//before x axis
				return [-10, getRandomNumber(0, height), getRandomNumber(0, Math.PI)];
			} else {
				//after x axis
				return [width+10, getRandomNumber(0, height), getRandomNumber(Math.PI, 2*Math.PI)];
			}//else
		} else {
			if(Math.random() > 0.5) {
				//above y axis
				return [getRandomNumber(0, width), -10, getRandomNumber(-Math.PI/2, Math.PI/2)];
			} else {
				//below y axis
				return [getRandomNumber(0, height), height + 10, getRandomNumber(Math.PI/2, Math.PI*3/2)];
			}//else
		}//else
	}//else
}//function findstartLoc

///////////////////////////////////////////////////////////////////////////
///////////////////////// Get the hexagon points //////////////////////////
///////////////////////////////////////////////////////////////////////////

function hexArray(width, height, radius) {

	var SQRT3 = Math.sqrt(3),
    	hexRadius = radius;
	var hexagonPoly = [[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	
	//For SVG path
	//var hexagonPath = " m" + hexagonPoly.map(function(p){ return [+round2(p[0]*hexRadius), +round2(p[1]*hexRadius)].join(','); }).join(' l') + "z";
	//return "M" + (width/2) + "," + (height/2) + hexagonPath;
	
	//Return array of {x: x, y:y }
	var hexagonPath = hexagonPoly.map(function(p){ return {x: +round2(p[0]*hexRadius + width/2), y: +round2(p[1]*hexRadius + height/2)} });
	return hexagonPath;
}//function hexArray

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the curved lines //////////////////////////
///////////////////////////////////////////////////////////////////////////

//Adjusted from 
//http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
function drawCurve(ctx, ptsa, tension, isClosed, numOfSegments, showPoints) {

  	ctx.beginPath();
  	drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
  
  	if (showPoints) {
    	ctx.beginPath();
    	for(var i = 0; i < ptsa.length-1; i++) ctx.rect(ptsa[i].x - 2, ptsa[i].y - 2, 4, 4);
  	}//if

    ctx.stroke();
  	//ctx.closePath();
}//function drawCurve

function drawLines(ctx, pts) {
	ctx.moveTo(pts[0].x, pts[0].y);
	for(var i = 1; i < pts.length-1; i++) ctx.lineTo(pts[i].x, pts[i].y);
}//drawLines

function getCurvePoints(pts, tension, isClosed, numOfSegments) {

  // use input value if provided, or use a default value	 
  tension = (typeof tension != 'undefined') ? tension : 0.5;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [], res = [],	// clone array
      x, y,					// our x,y coords
      t1x, t2x, t1y, t2y,	// tension vectors
      c1, c2, c3, c4,		// cardinal points
      st, t, i;				// steps based on num. of segments

  // clone array so we don't change the original
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to beginning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 1]);
    _pts.push(pts[0]);
  } else {
    _pts.unshift(pts[1]);			//copy 1. point and insert at beginning
    _pts.push(pts[pts.length - 1]);	//copy last point and append
  }//else

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1st point before and after
  for (var i = 1; i < (_pts.length - 2); i++) {
    for (var t = 0; t <= numOfSegments; t++) {

      // calc tension vectors
      t1x = (_pts[i+1].x - _pts[i-1].x) * tension;
      t2x = (_pts[i+2].x - _pts[i].x) 	* tension;

      t1y = (_pts[i+1].y - _pts[i-1].y) * tension;
      t2y = (_pts[i+2].y - _pts[i].y) 	* tension;

      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 =   2 * Math.pow(st, 3) 	- 3 * Math.pow(st, 2) + 1; 
      c2 = -(2 * Math.pow(st, 3)) 	+ 3 * Math.pow(st, 2); 
      c3 = 	   	 Math.pow(st, 3)	- 2 * Math.pow(st, 2) + st; 
      c4 = 	   	 Math.pow(st, 3)	- 	  Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * _pts[i].x + c2 * _pts[i+1].x + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i].y + c2 * _pts[i+1].y + c3 * t1y + c4 * t2y;

      //store points in array
      res.push({x: x, y: y});

    }//for t
  }//for i

  return res;
}//function getCurvePoints

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Draw the title ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

opentype.load('css/WorkSans-Thin.ttf', function(err, font) {
    if (err) {
         alert('Font could not be loaded: ' + err);
    } else {
    	//First get an idea of the width
        fontPath = font.getPath('Marble Butterflies', 0, 0, fontSize);

        //Get ± the width of the text
        var textWidth = fontPath.commands[fontPath.commands.length-2].x;

        //Now put it in the right location
        fontPath = font.getPath('Marble Butterflies', width/2 - textWidth/2, height/2 - radius*1.4, fontSize);

        //Split into separate letters
        var letter = [];
        fontPath.commands.forEach(function(l) {
        	if(l.type !== "Z") {
        		letter.push(l);
        	} else {
        		letters.push([letter])
        		letter = [];
        	}//else
        });//forEach

		//font.drawPoints(ctx, 'Marble Butterflies', width/2 - textWidth/2, height/2 - radius*1.4, fontSize);
    }//else
});//openType

// function fontDraw(ctx, list, color, stroke, fill) {
//     ctx.beginPath();
//     for (var i = 0; i < list.length; i += 1) {
//         var cmd = list[i];
//         if (cmd.type === 'M') {
//             ctx.moveTo(cmd.x+tw2(), cmd.y+tw2());
//         } else if (cmd.type === 'L') {
//             ctx.lineTo(cmd.x+tw2(), cmd.y+tw2());
//         } else if (cmd.type === 'C') {
//             ctx.bezierCurveTo(cmd.x1+tw2(), cmd.y1+tw2(), cmd.x2+tw2(), cmd.y2+tw2(), cmd.x+tw2(), cmd.y+tw2());
//         } else if (cmd.type === 'Q') {
//             ctx.quadraticCurveTo(cmd.x1+tw2(), cmd.y1+tw2(), cmd.x+tw2(), cmd.y+tw2());
//         } else if (cmd.type === 'Z') {
//             ctx.closePath();
//         }
//     }

//     if (fill) {
//         ctx.fillStyle = color;
//         ctx.fill();
//     }
//     if (stroke) {
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 1;
//         ctx.stroke();
//     }
// }//fontDraw

//function tw2() { return (Math.random()>0.5 ? 1 : -1) * Math.random()*scaling*(Math.random() > 0.5 ? 20 : 1.5); }

///////////////////////////////////////////////////////////////////////////
///////////////////////// Draw complex canvas path ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Adjusted from https://gist.github.com/shamansir/6294f8cfdd555a9d1b9e182007dd0c2f
// take SVG commands and draw this path to HTML5 canvas

// commandList should look like that: [ { marker: "M", values: [ 10, 10 ] }, 
//                                      { marker: "l", values: [ 5, 7 ] },
//                                      { marker: "C", values: [ -5, 7.2, .3, -16, 24, 10 ] },
//                                      . . .
//                                      { marker: "z", values: [ ] } ]

// there's another gist which has the code to parse SVG paths: 
// https://gist.github.com/shamansir/0ba30dc262d54d04cd7f79e03b281505
// 
// var ctx = canvas.getContext('2d');
// [ 'M10,10 l 5,7 C-5,7.2,.3-16,24,10  z', ... ].map(svgPathToCommands)
//                                               .forEach(function(commandList) { drawSvgPath(ctx, commandList); });

function drawSvgPath(ctx, width, height, s, imageWidth, imageHeight, commandList) {
	var w = width/2 - imageWidth/2*s,
		h = height/2 - imageHeight/2*s;
    ctx.save();
    ctx.beginPath();
    var lastPos = [ 0, 0 ]; 
    var pointOne, pointTwo, pointThree;
    commandList.forEach(function(command) {
	    if ((command.marker === 'z') || (command.marker === 'Z')) {
	        lastPos = [ 0, 0 ];
	        ctx.closePath();
	    } else if (command.marker === 'm') {
	        lastPos = [ lastPos[0] + command.values[0]*s, lastPos[1] + command.values[1]*s ];
	        pointOne = [ lastPos[0]+tw(), lastPos[1]+tw() ];
	        ctx.moveTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'l') {
	        lastPos = [ lastPos[0] + command.values[0]*s, lastPos[1] + command.values[1]*s ];
	        pointOne = [ lastPos[0]+tw(), lastPos[1]+tw() ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'h') {
	        lastPos = [ lastPos[0] + command.values[0]*s, lastPos[1] ];
	        pointOne = [ lastPos[0]+tw(), lastPos[1] ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'v') {
	        lastPos = [ lastPos[0], lastPos[1] + command.values[0]*s+tw() ];
	        pointOne = [ lastPos[0], lastPos[1]+tw() ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'c') {
	        pointOne =    [ lastPos[0] + command.values[0]*s+tw(),
	                     	lastPos[1] + command.values[1]*s+tw() ];
	        pointTwo = 	  [ lastPos[0] + command.values[2]*s+tw(),
	                     	lastPos[1] + command.values[3]*s+tw() ];
	        lastPos  = 	  [ lastPos[0] + command.values[4]*s,
	                     	lastPos[1] + command.values[5]*s ];
	        pointThree  = [ lastPos[0] + tw(),
	                     	lastPos[1] + tw() ];
	        ctx.bezierCurveTo(
	                pointOne[0], 	pointOne[1],
	                pointTwo[0], 	pointTwo[1],
	                pointThree[0], 	pointThree[1]);
	    } else if (command.marker === 'M') {
	    	lastPos = [ command.values[0]*s+w, command.values[1]*s+h ];
	    	pointOne = [ lastPos[0]+tw(), lastPos[1]+tw() ];
	        ctx.moveTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'L') {
	        lastPos = [ command.values[0]*s+w, command.values[1]*s+h ];
	        pointOne = [ lastPos[0]+tw(), lastPos[1]+tw() ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'H') {
	        lastPos = [ command.values[0]*s+w, lastPos[1] ];
	        pointOne = [ lastPos[0]+tw(), lastPos[1] ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'V') {
	        lastPos = [ lastPos[0], command.values[0]*s+h+tw() ];
	        pointOne = [ lastPos[0], lastPos[1]+tw() ];
	        ctx.lineTo(pointOne[0], pointOne[1]);
	    } else if (command.marker === 'C') {
	        pointOne = [ command.values[0]*s+w+tw(),
	                     command.values[1]*s+h+tw() ];
	        pointTwo = [ command.values[2]*s+w+tw(),
	                     command.values[3]*s+h+tw() ];
	        lastPos  = [ command.values[4]*s+w,
	                     command.values[5]*s+h ];
	        pointThree = [ lastPos[0]+tw(), lastPos[1]+tw() ];
	        ctx.bezierCurveTo(
	                pointOne[0], pointOne[1],
	                pointTwo[0], pointTwo[1],
	                pointThree[0], pointThree[1]);
	    }
	});//forEach
	ctx.stroke();        
    ctx.restore();
}//drawSvgPath

//Twitch the SVG path a bit
function tw() { return (Math.random()>0.5 ? 1 : -1) * Math.random()*scaling*5; }

//Jitter the non fixed points
function jitterFixed(d, jitter) {
	for(var i = 0; i < d.length; i++) {
		if(!d[i].fixed) {
			d[i].x = +d[i].x + jitter * (Math.random() > 0.5 ? 1 : -1);
			d[i].y = +d[i].y + jitter * (Math.random() > 0.5 ? 1 : -1);
		}
	}//for i
}//jitterFixed

// svgPathToCommands('M10,10 l 5,7 C-5,7.2,.3-16,24,10  z');
// produces:
//
// [ { marker: "M", values: [ 10, 10 ] }, 
//   { marker: "l", values: [ 5, 7 ] },
//   { marker: "C", values: [ -5, 7.2, 0.3, -16, 24, 10 ] },
//   { marker: "z", values: [ ] } ]

// function svgPathToCommands(str) {
// 	var markerRegEx = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g;
// 	var digitRegEx = /-?[0-9]*\.?\d+/g;
//     var results = []; 
//     var match; while ((match = markerRegEx.exec(str)) !== null) { results.push(match); };
//     return results
//         .map(function(match) {
//             return { marker: str[match.index], 
//                      index: match.index };
//         })
//         .reduceRight(function(all, cur) {
//             var chunk = str.substring(cur.index, all.length ? all[all.length - 1].index : str.length);
//             return all.concat([
//                { marker: cur.marker, 
//                  index: cur.index, 
//                  chunk: (chunk.length > 0) ? chunk.substr(1, chunk.length - 1) : chunk }
//             ]);
//         }, [])
//         .reverse()
//         .map(function(command) {
//             var values = command.chunk.match(digitRegEx);
//             return { marker: command.marker, values: values ? values.map(parseFloat) : []};
//         })
// }//function svgPathToCommands

// function drawStraight(ctx, pts, s) {
// 	var w = width/2 - imageWidth/2*s,
// 		h = height/2 - imageHeight/2*s;
// 	var sc = 2;
// 	var order = shuffleArray(d3.range(pts.length));
// 	ctx.beginPath();
// 	ctx.moveTo(pts[order[0]].x*s + w + tw()*sc, pts[order[0]].y*s + h + tw()*sc);
// 	for(var i = 1; i < pts.length; i++) ctx.lineTo(pts[order[i]].x*s + w + tw()*sc, pts[order[i]].y*s + h + tw()*sc);
// 	ctx.stroke();
// }//drawStraight

// //From http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// function shuffleArray(array) {
//     for (var i = array.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = array[i];
//         array[i] = array[j];
//         array[j] = temp;
//     }
//     return array;
// }

//Transform the path point to the center and correct height
function transformPath(pts) {
	var newPts = [];
	var w = width/2 - imageWidth/2*imageScale,
		h = height/2 - imageHeight/2*imageScale;
	pts.forEach(function(d) {
		newPts.push({
			x: d.x*imageScale + w,
			y: d.y*imageScale + h,
			fixed: d.fixed
		});
	})
	return newPts;
}//transformPath

///////////////////////////////////////////////////////////////////////////
////////////////////////////// Extra functions ////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Offset the hexagon and circle a bit
function twitch() { return (Math.random()>0.5 ? 1 : -1) * Math.random()*scaling*7; }

//https://github.com/bgrins/TinyColor
//Get a slightly different color, based on the provided color
function colorOffset(color) {
	var colors = tinycolor(color).analogous();
	colors = colors.map(function(t) { return t.toHexString(); }); 

	return colors[Math.floor(Math.random()*colors.length)];
}//function colorOffset

//Get a random number between start and end
function getRandomNumber(start, end) { return ((Math.random() * (end-start)) + start); }	

//Round number to 2 behind the decimal
function round2(num) { return (Math.round(num * 100)/100).toFixed(2); }//round2

//See if the no-white version is needed
//https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}//getQueryVariable
