var sketch = function(s){

	/*GLOBAL PARAMETERS*/

	//canvas controls
	let PAUSE = false;
	let RECORDING = false;

	let res = 5;
	let width;
	let height;
	let grid;
	let spacialSpeed = 0.03;
	let timeSpeed = 0.1;

	s.setup = () => {

		pcanvas = s.createCanvas(800,800); //square
		s.background(0);
		width = pcanvas.width;
		height = pcanvas.height;

		grid = createGridCells({dimensions: [width, height], res: [res,res]});
		grid.show2D(s, [255,0,255, 255], 1);
		grid.setCellProp("color", (cell)=>{ 
			let r = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 1);
			let g = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 2);	
			let b = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 3);	
			return [r, g, b];
		});

		//grid.cell(grid.cols/2, grid.rows/2).color = [255,255,255];

		grid.setCellProp("show", (cell)=>{
			return () => {
				s.noStroke();
				s.fill(...cell.color)
				s.rect(cell.x, cell.y, grid.resx, grid.resy);
			}
		});

	};

	s.draw = () => {

		//s.background(255);
		
		s.noStroke();
		s.fill(250,250,250,s.frameCount);
		//s.ellipse(pcanvas.width/2, pcanvas.height/2, 2, 2);
		
		grid.setCellProp("dright", ()=> 0); 
		grid.setCellProp("dbottom", ()=> 0); 
		grid.setCellProp("dleft", ()=> 0); 
		grid.setCellProp("dtop", ()=> 0);

		grid.cells.forEach((cell)=>{

			let speedFactor = 0.05;

			//examine the right
			let dif1 = [0,0,0], dif2 = [0,0,0], dif3 = [0,0,0], dif4 = [0,0,0];
			let j = cell.j;
			let i = cell.i;
			if(j < grid.cols-1) {
				let rightc = grid.cell(j+1,i);
				dif1 = cell.color.map((value, i)=>{ 
					let dif = value - rightc.color[i];
					dif = dif > 0 ? dif : 0;
					return dif;
				});
			}
			//examine the bottom
			if(i < grid.rows-1) {
				let bottomc = grid.cell(j,i+1);
				dif2 = cell.color.map((value, i)=>{ 
					let dif = value - bottomc.color[i];
					dif = dif > 0 ? dif : 0;
					return dif;
				});
			}
			//examine the left
			if(j > 0) {
				let leftc = grid.cell(j-1,i); 
				dif3 = cell.color.map((value, i)=>{ 
					let dif = value - leftc.color[i];
					dif = dif > 0 ? dif : 0;
					return dif;
				});
			}
			//examine the top
			if(i > 0) {
				let topc = grid.cell(j,i-1);
				dif4 = cell.color.map((value, i)=>{ 
					let dif = value - topc.color[i];
					dif = dif > 0 ? dif : 0;
					return dif;
				});
			}

			let difsSum = dif1.map((el, i)=>{
				return dif1[i] + dif2[i] + dif3[i] + dif4[i] + 1
			});

			let contrastDifs = difsSum[0]+difsSum[1]+difsSum[2];


			// cell.dright = cell.color.map((value,i)=>{return speedFactor*(value*dif1[i]/difsSum[i])});
			// cell.dbottom = cell.color.map((value,i)=>{return speedFactor*(value*dif2[i]/difsSum[i])});
			// cell.dleft = cell.color.map((value,i)=>{return speedFactor*(value*dif3[i]/difsSum[i])});
			// cell.dtop = cell.color.map((value,i)=>{return speedFactor*(value*dif4[i]/difsSum[i])});

			cell.dright = cell.color.map((value,i)=>{return speedFactor*(dif1[i])});
			cell.dbottom = cell.color.map((value,i)=>{return speedFactor*(dif2[i])});
			cell.dleft = cell.color.map((value,i)=>{return speedFactor*(dif3[i])});
			cell.dtop = cell.color.map((value,i)=>{return speedFactor*(dif4[i])});
		
		});

		//now aplly
		grid.cells.forEach((cell)=>{
			let j = cell.j;
			let i = cell.i;

			//examine the right
			if(j < grid.cols-1) {
				let rightc = grid.cell(j+1,i);
				cell.color = cell.color.map((value, index)=>{ return value - cell.dright[index] });
				rightc.color = rightc.color.map((value, index)=>{ return value + cell.dright[index]});
			}
			//examine the bottom
			if(i < grid.rows-1) {
				let bottomc = grid.cell(j,i+1);
				cell.color = cell.color.map((value, index)=>{ return value - cell.dbottom[index] });
				bottomc.color = bottomc.color.map((value, index)=>{ return value + cell.dbottom[index]});
			}
			//examine the left
			if(j > 1) {
				let leftc = grid.cell(j-1,i); 
				cell.color = cell.color.map((value, index)=>{ return value - cell.dleft[index] });
				leftc.color = leftc.color.map((value, index)=>{ return value + cell.dleft[index]});
			}
			//examine the top
			if(i > 0) {
				let topc = grid.cell(j,i-1);
				cell.color = cell.color.map((value, index)=>{ return value - cell.dtop[index] });
				topc.color = topc.color.map((value, index)=>{ return value + cell.dtop[index]});
			}
		});


		grid.cells.forEach((cell) => cell.show());

		//introduce some noise
		grid.cells.forEach((cell)=>{
			let r = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 1+s.frameCount*timeSpeed);
			let g = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 2+s.frameCount*timeSpeed);	
			let b = 255*s.noise(cell.i*spacialSpeed, cell.j*spacialSpeed, 3+s.frameCount*timeSpeed);
			if(s.random(1) < 0.4){
				cell.color = [
					cell.color[0]/2+r/2,
					cell.color[1]/2+g/2,
					cell.color[2]/2+b/2
				]
			}
		})
		

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