var sketch = function(s){

	/*GLOBAL PARAMETERS*/

	//canvas controls
	let PAUSE = false;
	let RECORDING = false;
	let p;
	let number = 100;
	let maxForce = 0.1;
	let maxSpeed = 0.5;
	let merge = false;
	let stepsToDraw = 1;
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
			boundary: rectangle(0,0,width, height),
			//boundary: rectangle(0.2*width,0.2*height,0.8*width, 0.8*height),
			posGenerator: 
				putIndexOnEvenGrid(number, 0.8*height, 0.8*width, 0.1*width, 0.1*height)
				//(i) => {return vec(width/2 -10 + i*20, height/2)}
			,
			movement: 'dynamic',
			initialVelocity: (i) => {
				//return (i%2 == 0 ? vec(0, 0.5) : vec(0 , -0.5) );
				//return vec(-(Math.sin(i*2*Math.PI/3)), (Math.cos(i*2*Math.PI/3)));
				//return vec(maxSpeed,0).add(vec().random2D(0.1));
				return vec().random2D(maxSpeed/5);
				//return vec() 
			},
			maxForce: ()=>{return maxForce},
			maxSpeed: ()=>{return maxSpeed},
			queryRadius: 60,
			safeRadius: 20, //bug
			merge,
			behaviours: (i)=>{return[
				// {
				// 	type: 'externalForce',
				// 	intensity: 300, //60,
				// 	field: attractive_force,
				// }
				// ,
				// {
				// 	type:'gravity',
				// 	G: 70,
				// 	safeRadius: 10
				// }
				//,
				{
					type: 'latchHooke',
					elasticConstant: 0.01
				}
				,
				{
					type: 'coulombsLaw',
					electricCharge: 1
				}
				
			]},
			display: (i) => {return {
				scale: displayRadi, 
				displayFunction: (s, radius, pos) => {
					s.ellipse(pos.x, pos.y, radius, radius);
				},
				dependencies: ["pos"]
			}}
		});

		// // JUST ONE PARTICLE:
		// s.noFill();
		// s.stroke(255);
		// s.line(pcanvas.width/2,0,pcanvas.width/2, pcanvas.height);

		// p = createParticle({
		// 	pos: vec(100,200),
		// 	inertialMass: 1,
		// 	momentInercia: 1000,
		// 	movement: 'dynamic',
		// 	initialVelocity: vec(),
		// 	maxForce: 1,
		// 	maxSpeed: 0.5,
		// 	maxAngVel: 0.5,
		// 	translationDamping : 1,
		// 	rotationDamping : 1,
		// 	behaviours: [{
		// 		type: 'externalForce',
		// 		intensity: 10,
		// 		field: attractive_force,
		// 	}]
		// });


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

		// p.applyForces();
		// s.stroke(255,0,0);
		// s.noFill();
		// p.displayForce(s,10,100);
		// p.move();
		// s.noStroke();
		// s.fill(0);
		// p.display.show(s);

		//s.noStroke();
		//s.fill(0);
		//s.ellipse(pcanvas.width/2, pcanvas.height/2, 5, 5);

		//IF PAUSED DO NOT RECORD
		if(!PAUSE && RECORDING){
			capturer.capture(pcanvas.canvas);
		}

		pcanvas.mouseClicked(s.PlayPause);
	};

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