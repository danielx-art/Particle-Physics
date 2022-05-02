/*ANALYTIC GEOMETRY*/
/*LINES*/

const createLine = function(x1,y1,x2,y2){
    const self = {
        a: y1-y2,
        b: x2-x1,
        c: x1*y2 - x2*y1,
    };
    return self;
};

const createEdge = function(x1,y1,x2,y2){
    const self={
        x1,
        y1,
        x2,
        y2,
    };
    self['line'] = createLine(self.x1, self.y1, self.x2, self.y2);
    return self;
}

const createMediatrix = function(edge){

    const xm = (edge.x1 + edge.x2)/2;
    const ym = (edge.y1 + edge.y2)/2;

    const self={
        xm,
        ym,
        a: -edge.line.b,
        b: edge.line.a,
        c: -xm*(-edge.line.b) - ym*(edge.line.a),
    };

    return self;
}

const findIntersection = function(line1, line2){
    if(-line1.a*line2.b == -line2.a*line1.b){
        return null;
    }
    const self={
        x: -(line2.b*line1.c - line1.b*line2.c)/(line1.a*line2.b - line2.a*line1.b),
		y: -(line2.a*line1.c - line1.a*line2.c)/(line2.a*line1.b - line1.a*line2.b),	
    };
    return self;
}

/*CIRCLE*/

const circumcentre = function(x1,y1,x2,y2,x3,y3) {
    let edge1 = createEdge(x1,y1,x2,y2);
    let edge2 = createEdge(x1,y1,x3,y3);
    let mediatrix1 = createMediatrix(edge1);
    let mediatrix2 = createMediatrix(edge2);
    return findIntersection(mediatrix1, mediatrix2);
}