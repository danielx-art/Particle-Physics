/*ROTATIONAL WIND*/

const createRotational = (
    //default params
    m = [1,() => vec().random2D(1)],
    body = this
    ) => {



    const self = {
        
        kind: 'rotational',
        m,
        body,

        field: (x=0,y=0,z=0) => {
            let vecr = createVector(x - body.pos.x, y-body.pos.y, z-body.pos.z);
            let versorr = createVector().copy(vecr).setMag(1);
            let r = vecr.mag();
            //console.log("here"); //debugg
            if(r > 10) { //security measure
                let F = m[1](vecr.x,vecr.y,vecr.z);
                F.mult(m[0]).div(r);
                return F;
            }
            return vec();
        },

        forces: (agents) => {

            let Fres = vec();

            agents.forEach(function(agent, i){


                if(!agent[self.kind]){
                    return;
                }

                let F = agent.rotational.field(body.pos.x, body.pos.y, body.pos.z);

                Fres.add(F);

            });

            body.acl.add(Fres.div(body.inertialMass));

        },

        takenote: (newbody) => {
            
        },

        merge: (other) => {

        }
    };

    return self;

};

// Here the wind should get into particles as something like this
// let newPhysics = physics.kind([physics.param, physics.generator]);
// self[newPhysics.kind] = newPhysics.create(newPhysics.m, self.body);

const rotational = (args) => {
    const self = {
        kind: "rotational",
        create: createRotational,
    };

    if(Array.isArray(args)){
        self['m'] = args;
    }

    return self;
}

