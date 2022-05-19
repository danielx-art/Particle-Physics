var sketch = function(s){

	/*GLOBAL PARAMETERS*/

	//canvas controls
	let PAUSE = false;
	let RECORDING = false;
	let p;
	let number = 6;
	let maxForce = 10;
	let maxSpeed = 0.5;
	let merge = false;
	let stepsToDraw = 5;
	let width;
	let height;
	let displayRadi = 3;

	s.setup = () => {

		pcanvas = s.createCanvas(400,200); //square
		s.background(0);
		width = pcanvas.width;
		height = pcanvas.height;

		p = createParticleSystem({
			num: number,
			boundary: rectangle(0.1*width,0.1*height,0.8*width, 0.8*height),
			posGenerator: 
				putIndexOnEvenGrid(number, 0.8*height, 0.8*width, 0.1*width, 0.1*height)
			,
			movement: 'dynamic',
			initialVelocity: (i) => {
				return vec().random2D(maxSpeed/5);
			},
			maxForce,
			maxSpeed,
			queryRadius: 60,
			safeRadius: 20, //bug
			merge,
			behaviours: (i)=>{return[
				// {
				// 	type:'gravity',
				// 	G: 70,
				// 	safeRadius: 10
				// }
				// ,
			]},
			display: (i) => {return {
				scale: displayRadi, 
				displayFunction: (s, radius, pos) => {
					s.ellipse(pos.x, pos.y, radius, radius);
				},
				displayDependencies: ["pos"]
			}}
		});

	};

	s.draw = () => {

		s.background(41);
		//s.background(255);
		
		s.noStroke();
		s.fill(250,250,250,250);
		//s.ellipse(pcanvas.width/2, pcanvas.height/2, 2, 2);
		for(let k=0; k<stepsToDraw; k++){
			p.update();
			p.display(s);
		}

		//IF PAUSED DO NOT RECORD
		if(!PAUSE && RECORDING){
			capturer.capture(pcanvas.canvas);
		}

		pcanvas.mouseClicked(s.PlayPause);
	};

	/*------------------------------------------------------------------------------
	--------------------------------------------------------------------------------
	--------------------------------PLAYER CONTROLS---------------------------------
	--------------------------------------------------------------------------------
	------------------------------------------------------------------------------*/


	s.keyPressed = () => {
		if(s.key == "R") {				//PRESS R TO START RECORDING OR TO STOP AND SAVE
			if(RECORDING){
				console.log("stop rec, saving files...");
				capturer.stop();
				capturer.save();
			}else{
				console.log("recording...");
				capturer.start();
			};
			RECORDING = !RECORDING;
		} else if(s.key =="F"){			//PRESS F JUST TO PRINT THE FRAME COUNT
			console.log(s.frameCount);
		} else if(s.key == "C"){		//SAVE JUST ONE FRAME
			s.saveCanvas(`particles_${pcanvas.width}_${pcanvas.height}_${s.frameCount}`, "png");
		}
	}

	//CLICK ON THE SCREEN TO PAUSE
	s.PlayPause = () => {
		PAUSE = PAUSE === false? true : false;
		if(PAUSE) {
			console.log("pause");
			s.noLoop();
		} else {
			console.log("play");
			s.loop();
		}
	};


};

var myp5 = new p5(sketch);