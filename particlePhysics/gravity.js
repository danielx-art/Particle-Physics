/*BEHAVIOURS*/

const createGravity = (
    //default params
    m = 10, 
    body = this //this is the particle body or itself
    ) => {

    const self = {
        
        kind: 'gravity',
        m,
        body,

        field: (x=0,y=0,z=0) => {
            let vecr = createVector(x - body.pos.x, y-body.pos.y, z-body.pos.z);
            let versorr = createVector().copy(vecr).setMag(1);
            let r = vecr.mag();
            if(r > 1) { //security measure
                let g = createVector().copy(versorr);
                g.mult(-m*body.inertialMass);
                g.div(r*r);
                //console.log(g); //debugg
                return g;
            }
            return createVector();
        },

        forces: (agents) => {
            Array.isArray(agents) ? true : agents = [agents]; //if only one is passed
            
            let Fgres = createVector();

            agents.forEach(function(agent, i){

                if(!agent[self.kind]){
                    return;
                }

                let g = agent.gravity.field(body.pos.x, body.pos.y, body.pos.z);
                //console.log(g); //debugg
                let Fg = g.mult(body.inertialMass);
                Fgres.add(Fg);

            });
         
            body.acl.add(Fgres.div(body.inertialMass));
        },

        takenote: (newbody) => {
            //no changes on the body need to be done
        },

        merge: (other) => {
            //mass merges by itself
        }
    };

    return self;

};

// Here the physicsw should get into particles as something like this
// let newPhysics = physics.kind([physics.param, physics.generator]);
// self[newPhysics.kind] = newPhysics.create(newPhysics.m, self.body);

const gravity = (g) => {
    const self = {
        kind: "gravity",
        create: createGravity,
    };


    if(Array.isArray(g)){
        self['m'] = g[1](g[0]);
    } else {
        self['m'] = g;
    }

    return self;
}