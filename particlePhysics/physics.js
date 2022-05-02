


/*BEHAVIOURS*/

const createMagnet = (
    //default params
    m = createVector(),
    body = this
    ) => ({
       
    kind: 'magnet',
    m,
    body,

    field: (x=0,y=0, z=0) => {
        let vecr = createVector(x - body.pos.x, y-body.pos.y, z-body.pos.z);
        //console.log(vecr);
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

            //implement here test if agent has the same kind of behaviour

            let B = agent.magnet.field(body.pos.x, body.pos.y, body.pos.z);

            //translation, force
            //approximation of partial derivatives
            let dinf = 0.001;
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
    }

});

/*I think I have to use currying here to let the magnet behaviour 
access the particle's position, so I create the magnet behaviour 
only when attributing this behaviour to the particle's self.*/
const magnet = (m) =>  (subject) => {
    subject.dir.copy(m).setMag(1);
    return createMagnet(m, subject);
}

/*THE PARTICLE FACTORY*/

const createParticle = function(

    pos = vec(x,y),
    movement = 'static',
    ...args

) {

    const self = {
        //this is the 'body' of the behaviours
        body: 
        { 
            pos,
            inertialMass: 1,
            momentInercia: 1,
            movement: arguments[1],
        }

    }

    //set the direction heading at initialization
    self.body['dir'] = createVector(1,0);

    //behaviours assignment
    for (const physics of args) {
        self[physics(self.body).kind] = physics(self.body);
        //self[physics(self).kind] = physics(self);
    }
    let behaviours = Object.keys(self);
    behaviours.shift(); //take of the body

    //the engine behind the dynamic type
    if(self.body.movement == 'dynamic'){
        //translation
        self.body.vel = createVector();
        self.body.acl = createVector();
        //rotation        
        self.body.angvel = createVector();
        self.body.angacl = createVector();
        
        self.body.aplyForces = (agents) => { //implement if i only want to select one behaviour phenomenon
            for(const f of behaviours){
                self[f].forces(agents, self.body);
            }
        }
        
        self.body.move = () => {
            //translation
            self.body.vel.add(self.body.acl);
            self.body.vel.limit(0.5);
            self.body.pos.add(self.body.vel);
            self.body.acl.mult(0);
            //rotation
            self.body.angvel.add(self.body.angacl);
            self.body.angvel.limit(0.05);
            deltadir = self.body.angvel.cross(self.body.dir);
            self.body.dir.add(deltadir).limit(1);
            
            //notify all behaviours
            for(const f of behaviours){
                self[f].takenote(self.body);
            }
            
        }
    }

    self.body['show'] = (p5inst) => {
        p5inst.noStroke();
        p5inst.fill(255);
        p5inst.ellipse(self.body.pos.x, self.body.pos.y, 5, 5);
        p5inst.stroke(0);
        p5inst.line(self.body.pos.x, self.body.pos.y, self.body.pos.x + self.body.dir.x*10, self.body.pos.y + self.body.dir.y*10);
    }

    return self;
};


const particle = createParticle(  vec(40,30), 'dynamic', magnet(vec(-50,10)) );
//testing:
const particle2 =  createParticle(  vec(50,50), 'dynamic', magnet(vec(7,7)) );


