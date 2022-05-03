/* --------------------------------------------------------------
-----------------------------------------------------------------
---------------------THE PARTICLE FACTORY------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------*/

const createParticle = function(

    position = vec(),
    direction = vec(0,-1),
    inertialMass = 1,
    momentInertia = 1000,

    movement = 'static',

    maxForce = 20,
	maxSpeed = 0.1,
    maxAngVel = 0.3,
    translationDamping = 0.9,
    rotationDamping = 0.8,

    behaviours = [
        {
            type: 'gravity',
            G: 10
        }
        ,
        {
            type: 'magnet',
            mdipole: (pos) => {return vec(pos.x, 0).setMag(1)},
            mdipoleDependencies: ['pos']
        }
    ],
    
    display = {
        scale: 10, 
        displayFunction: (p5instance, pos, radius) => {
            p5instance.ellipse(pos.x, pos.y, radius, radius);
        },
        dependencies: ["pos", "display.scale"]
    }

) {

    const self = {
        pos: position,
        dir: direction,
        inertialMass,
        momentInercia,
        movement,
        physics,

        //getters for x and y for quadTree
        get x () {
            return this.body.pos.x
        },

        get y (){
            return this.body.pos.y
        }

    }

    //behaviours assignment
    for (const behaviour of behaviours) {
        let behaviourName = behaviour.type;
        let factoryName = "create"+behaviourName.charAt(0).toUpperCase()+behaviourName.slice(1);
        self.physics[behaviourName] = executeFunctionByName(factoryName, window, self, ...Object.values(behaviour).slice(1));
    }

    let behaviourKeys = Object.keys(self.physics);

    //the engine behind the dynamic type
    if(self.movement == 'dynamic'){
        //translation
        self.vel = vec();
        self.acl = vec();
        //rotation        
        self.angvel = vec();
        self.angacl = vec();
        
        self.applyForces = (agents) => { //implement if i only want to select one or more behaviour phenomenon
            for(const f of behaviourKeys){
                self[f].forces(agents);
            }
        }
        
        self.move = (p5inst) => {
            //translation
            if(p5inst){
                p5inst.stroke(0);
                //let tempF = vec(self.acl.x, self.acl.y);
                let tempF = vec().copy(self.acl);
                //tempF.mult(1000000);
                //tempF.limit(maxForce);
                //console.log(tempF); //debugg
                p5inst.stroke(0,255,0);
                tempF.setMag(p5inst.width*0.1);
                p5inst.line(self.pos.x, self.pos.y, self.pos.x + tempF.x, self.pos.y + tempF.y);
                //p5inst.line(self.pos.x, self.pos.y, self.pos.x + tempF.x*100, self.pos.y + tempF.y*100);
            }
            self.vel.add(self.acl);
            self.vel.mult(translationDamping); //translation damping
            self.vel.limit(maxSpeed);

            self.pos.add(self.vel);
            self.acl.mult(0);
            //rotation
            self.angacl.limit(maxForce);
            self.angvel.add(self.angacl);
            self.angvel.mult(rotationDamping); //rotational damping
            self.angvel.limit(maxAngVel);
            deltadir = self.angvel.cross(self.dir);
            self.dir.add(deltadir).limit(1);
            self.angacl.mult(0);
            
            //notify all behaviours
            for(const f of behaviourKeys){
                self[f].hasMoved(self);
            }
        }


        //merge function
        self.merge = (particleForMerge) => {
            //console.log(particleForMerge); //debugg
            let p1 = self;
            let m1 = p1.inertialMass;
            let x1 = vec().copy(p1.pos);
            let v1 = vec().copy(p1.vel);
            let I1 = p1.momentInercia;
            let w1 = vec().copy(p1.angvel);

            let p2 = particleForMerge.body;
            //1.mass
            let m2 = p2.inertialMass;
            let mcm = m1 + m2;
            //2.position                
            let x2 = vec().copy(p2.pos);
            let xcm = vec().copy(x1.mult(m1)).add(x2.mult(m2)).div(mcm);
            //3.velocity
            let v2 = vec().copy(p2.vel);
            let vcm = vec().copy(v1.mult(m1)).add(v2.mult(m2)).div(mcm);
            //4.moment od inercia
            let I2 = p2.momentInercia;
            let Icm = I1 + I2;
            //5.angular velocity
            let w2 = vec().copy(p2.angvel);
            let wcm = vec().copy(w1.mult(I1)).add(w2.mult(I2)).div(Icm);
            
            //now attribute this do particle
            self.inertialMass = mcm;
            self.pos = vec().copy(xcm);
            self.vel = vec().copy(vcm);
            self.momentInercia = Icm;
            self.angvel = vec().copy(wcm);

            //notify the merge to all behaviours
            for(const f of behaviourKeys){
                self[f].merge(particleForMerge[f]);
            }

            //console.log(self); //debugg
        }
    }

    let displayDependencies = display.dependencies.map((item) => {
        //item can be stuff like display.scale so we have to split of '.' and nest eah one like particle['display']['scale']
        particle[item]
    })

    self['display'] = (p5inst, dirVector) => {
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

    return self;
};

