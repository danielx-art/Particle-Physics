//generate a function wich returns a position on a grid index by index
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