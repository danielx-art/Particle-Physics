/*
PUT PARTICLES ON A GIVEN SPACING GRID
*/ 
function putIndexOnASpacedGrid(rows, cols, colspacing, rowspacing, initialX = 0, initialY = 0) {

    let positionsByIndex = [];

    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            let position = vec(j*colspacing+initialX, i*rowspacing+initialY);
            positionsByIndex.push(position);
        }
    }

    return (i) => positionsByIndex[i];

}

/*
PUT PARTICLES ON A EVENLY SPACED GRID (NOT PERFECT)
*/ 
function putIndexOnEvenGrid(number, height, width, initialX=0, initialY=0){

    let delta = (width + height)^2 + 4*width*height*number;
    let rows = Math.round((width + height + Math.sqrt(delta))/(2*width));
    let cols = Math.round(number/rows);
    let spc = height/(rows-1);

    let positionsByIndex = [];

    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            let position = vec(j*spc+initialX, i*spc+initialY);
            positionsByIndex.push(position);
        }
    }

    return (i) => positionsByIndex[i];

}

/*
DISPLAY PARTICLES AS ORIENTED TRIANGLES
*/ 
displayTriangles = (p5inst, dirVector) => {
    p5inst.noStroke();
    p5inst.fill(0);
    //p5inst.ellipse(self.pos.x, self.pos.y, 15, 15);
    if(dirVector){
        p5inst.stroke(0);
        p5inst.line(self.pos.x, self.pos.y, self.pos.x + self.dir.x*100, self.pos.y + self.dir.y*100);
        p5inst.stroke(255,0,0);
        p5inst.line(self.pos.x, self.pos.y, self.pos.x + self.magnet.m.x/10, self.pos.y + self.magnet.m.y/10);
    }
    p5inst.beginShape();
    let rH = 20;
    let rW = 10;
    let tempH = vec().copy(self.dir).setMag(rH);
    let tempW = vec().copy(tempH).rotate(Math.PI/2).setMag(rW);
    let vertex1 = vec().copy(self.pos).add(tempH).add(tempW);
    p5inst.vertex(vertex1.x, vertex1.y);
    let vertex2 = vec().copy(self.pos).add(tempH).add(tempW.rotate(Math.PI));
    p5inst.vertex(vertex2.x, vertex2.y);
    let vertex3 = vec().copy(self.pos).add(tempH.rotate(Math.PI)).add(tempW);
    p5inst.vertex(vertex3.x, vertex3.y);
    let vertex4 = vec().copy(self.pos).add(tempH).add(tempW.rotate(Math.PI));
    p5inst.vertex(vertex4.x, vertex4.y);
    p5inst.endShape();
}