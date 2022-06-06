/*
Geometries Pseudo Code

from geometry coords to canvas coords function

from canvas coords to geometry coords function

distance function
*/

export function euclidean () {

    r = function(pointA, pointB){
        return vec().copy(pointB).sub(pointA) //vector pointing from A to B
    }

    versorr = function(pointA, pointB){ return r(pointA, pointB).setMag(1) }

    distance = function(pointA, pointB){ return r(pointA, pointB).mag() }

}