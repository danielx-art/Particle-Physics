/* --------------------------------------------------------------
-----------------------------------------------------------------
---------------------THE PARTICLE FACTORY------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------*/

const createParticle = function({

    position = vec(),
    direction = vec(0,-1),
    inertialMass = 1,
    momentInertia = 1000,

    movement = "static",
    initialVelocity = vec(),
    initialAngularVelocity = vec(),

    maxForce = 10,
    maxTorque = 0.1,
	maxSpeed = 0.1,
    maxAngVel = 0.3,
    translationDamping = 0.9,
    rotationDamping = 0.8,

    behaviours = [
        {
            type: "gravity",
            G: 10
        }
        ,
        {
            type: "magnet",
            mdipole: (pos) => {return vec(pos.x, 0).setMag(1)},
            mdipoleDependencies: ["pos"]
        }
    ],
    
    display = {
        scale: 10, 
        displayFunction: (p5instance, radius, pos) => {
            p5instance.noStroke();
            p5instance.fill(255);
            p5instance.ellipse(pos.x, pos.y, radius, radius);
        },
        displayDependencies: ["pos"],

        displayForce: (p5instance, scale, pos, inertialMass, acl) => {
            p5instance.stroke(255,0,0);
            let aclTemp = vec().copy(acl).mult(scale/inertialMass);
            p5instance.line(pos.x, pos.y, pos.x + aclTemp.x, pos.y + aclTemp.y)
        },
        displayForceDependencies: ["pos","inertialMass","acl"], //has to be in the same order than in the arguments

        displayDirection: (p5instance, scale, pos, dir) => {
            p5instance.stroke(10,50,20);
            let dirTemp = vec().copy(dir).mult(scale);
            p5instance.line(pos.x, pos.y, pos.x + dirTemp.x, pos.y + dirTemp.y)
        },
        displayDirectionDependencies: ["pos","dir"] //has to be in the same order than in the arguments
    }

}={}) {

    const self = {
        pos: position,
        dir: direction,
        inertialMass,
        momentInertia,
        movement,
        physics: {},

        get x () {
            return this.pos.x
        },

        get y (){
            return this.pos.y
        }

    }

    /*
    BEHAVIOURS ASSIGNMENT
    */

    for (const behaviour of behaviours) {
        let behaviourName = behaviour.type;
        let factoryName = "create"+behaviourName.charAt(0).toUpperCase()+behaviourName.slice(1);
        self.physics[behaviourName] = executeFunctionByName(factoryName, window, self, ...Object.values(behaviour).slice(1));
    }

    let behaviourKeys = Object.keys(self.physics);

    //the engine behind the dynamic type
    if(self.movement == 'dynamic'){
        //translation
        self.vel = initialVelocity;
        self.acl = vec();
        //rotation        
        self.angvel = initialAngularVelocity;
        self.angacl = vec();
        
        self.applyForces = (agents) => {
            for(const f of behaviourKeys){
                self.physics[f].forces(agents);
            }
        }
        
        self.move = () => {

            //translation - Euler - maybe implement runge kutta 4th?
            self.acl.limit(maxForce/inertialMass);
            self.vel.add(self.acl);
            self.vel.mult(translationDamping);
            self.vel.limit(maxSpeed);

            self.pos.add(self.vel);
            self.acl.mult(0);

            //rotation
            self.angacl.limit(maxTorque/momentInertia);
            self.angvel.add(self.angacl);
            self.angvel.mult(rotationDamping)
            self.angvel.limit(maxAngVel);
            deltadir = self.angvel.cross(self.dir);
            self.dir.add(deltadir).limit(1);
            self.angacl.mult(0);
            
            //notify all behaviours
            for(const f of behaviourKeys){
                self.physics[f].hasMoved(self);
            }
        }


        //merge function
        self.merge = (particleForMerge) => {
            //console.log(particleForMerge); //debugg
            let p1 = self;
            let m1 = p1.inertialMass;
            let x1 = vec().copy(p1.pos);
            let v1 = vec().copy(p1.vel);
            let I1 = p1.momentInertia;
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
            let I2 = p2.momentInertia;
            let Icm = I1 + I2;
            //5.angular velocity
            let w2 = vec().copy(p2.angvel);
            let wcm = vec().copy(w1.mult(I1)).add(w2.mult(I2)).div(Icm);
            
            //now attribute this do particle
            self.inertialMass = mcm;
            self.pos = vec().copy(xcm);
            self.vel = vec().copy(vcm);
            self.momentInertia = Icm;
            self.angvel = vec().copy(wcm);

            //notify the merge to all behaviours
            for(const f of behaviourKeys){
                self[f].merge(particleForMerge[f]);
            }
        }
    }

    /*
    DISPLAY LOGIC - YET TO TEST
    */
    self.display = {
        scale: display.scale,
    }

    self.display.show = function(args){

        let displayDependencies = display.displayDependencies.map((item) => 
        {
            let thisDependency = item.split(".");
            let lastDependency = thisDependency.pop();
            let context = self;
            for (let i = 0; i < thisDependency.length; i++) {
                context = context[thisDependency[i]];
            }
            return context[lastDependency];
        });



        return display.displayFunction(args, self.display.scale, ...displayDependencies)
    }

    self.display.force = function(args){

        let displayForceDependencies = display.displayForceDependencies.map((item) => 
        {
            let thisDependency = item.split(".");
            let lastDependency = thisDependency.pop();
            let context = self;
            for (let i = 0; i < thisDependency.length; i++) {
                context = context[thisDependency[i]];
            }
            return context[lastDependency];
        });

        return display.displayForce(args, self.display.scale, ...displayForceDependencies)
    }

    self.display.direction = function(args){

        let displayDirectionDependencies = display.displayDirectionDependencies.map((item) => 
        {
            let thisDependency = item.split(".");
            let lastDependency = thisDependency.pop();
            let context = self;
            for (let i = 0; i < thisDependency.length; i++) {
                context = context[thisDependency[i]];
            }
            return context[lastDependency];
        });

        return display.displayDirection(args, self.display.scale, ...displayDirectionDependencies)
    }

 
    return self;
};

