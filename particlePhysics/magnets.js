/*BEHAVIOURS*/

const createMagnet = (
    //default params
    m = createVector(),
    body
    ) => {

    body.dir.copy(m).setMag(1);

    const self = {
        
        kind: 'magnet',
        m,
        body,

        field: (x=0,y=0, z=0) => {
            let vecr = createVector(x - body.pos.x, y-body.pos.y, z-body.pos.z);
            let versorr = createVector().copy(vecr).setMag(1);
            let r = vecr.mag();
            if(r > 1) { //security measure
                let B = createVector().copy(versorr);
                B.mult(3*( m.dot(versorr) ));
                B.sub(m);
                B.div(r*r*r);
                return B;
            }
            return createVector();
        },

        forces: (agents) => {
            Array.isArray(agents) ? true : agents = [agents]; //if only one is passed
            
            let Fmagres = createVector();
            let Tmagres = createVector();

            agents.forEach(function(agent, i){

                if(!agent[self.kind]){
                    return;
                }

                let B = agent.magnet.field(body.pos.x, body.pos.y, body.pos.z);

                //translation, force
                //approximation of partial derivatives
                let dinf = 0.000000001;
                let Bx = agent.magnet.field(body.pos.x + dinf, body.pos.y, body.pos.z).sub(B).div(dinf).mult(m.x);
                let By = agent.magnet.field(body.pos.x, body.pos.y + dinf, body.pos.z).sub(B).div(dinf).mult(m.y);
                let Bz = agent.magnet.field(body.pos.x, body.pos.y, body.pos.z + dinf).sub(B).div(dinf).mult(m.z);
                let Fmag = Bx.add(By).add(Bz);
                Fmagres.add(Fmag);

                //rotation, alignment, torque
                Tmagres.add(m.cross(B));
            });

            body.acl.add(Fmagres.div(body.inertialMass));
            body.angacl.add(Tmagres.div(body.momentInercia));
        },

        takenote: (newbody) => {
            let mmag = m.mag();
            m.copy(newbody.dir).setMag(mmag);
        },

        merge: (otherMagnet) => {
            // let m2 = vec().copy(otherMagnet.m);
            // m.add(m2);
        }
    };

    return self;

};

const magnet = (newM) => {

    const self = {
        kind: "magnet",
        create: createMagnet,
    };

    if(Array.isArray(newM)){
        self['m'] = newM[1](newM[0]);
    } else {
        self['m'] = newM;
    }

    return self;
}