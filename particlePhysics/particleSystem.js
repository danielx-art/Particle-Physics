const createParticleSystem = function({
    
    num = 1,

    boundary = rectangle(0,0,720,720),

    posGenerator = (i)=>{ return vec(Math.random()*(boundary.width-200)+100, Math.random()*(boundary.height-200)+100) },

    dirGenerator = (i)=>{ return vec().random2D()},

    inertialMass = (i)=>{return 1},
    momentInertia = (i)=>{return 1000},

    movement = "dynamic",

    initialVelocity = (i) => {return vec()},
    initialAngularVelocity = (i) => {return vec()},
    maxForce = (i)=>{return 10},
    maxTorque = (i)=>{return 0.5},
    maxSpeed = (i)=>{return 0.1},
    maxAngVel = (i)=>{return 0.1},
    translationDamping = (i)=>{return 0},
    rotationDamping = (i)=>{return 0},

    wrap = "torus",

    collisionDetection = 'QUADTREE',

    queryRadius = 50,

    safeRadius = 5,

    merge = false,

    behaviours = (i) => {return [{
        type: 'externalForce',
        intensity: 10,
        field: () => {return vec(0,1)} //just a constant vertical gravity
    }]},

    display = (i) => {
        return {
            scale: 10, 
            displayFunction: (p5instance, radius, pos) => {
                p5instance.ellipse(pos.x, pos.y, radius, radius);
            },
            displayDependencies: ["pos"],
    
            displayForce: (p5instance, scale, pos, inertialMass, acl) => {
                p5instance.stroke(0);
                let aclTemp = vec().copy(acl).mult(scale/inertialMass);
                p5instance.line(pos.x, pos.y, pos.x + aclTemp.x, pos.y + aclTemp.y)
            },
            displayForceDependencies: ["pos","inertialMass","acl"], //has to be in the same order than in the arguments
    
            displayDirection: (p5instance, scale, pos, dir) => {
                p5instance.stroke(10);
                let dirTemp = vec().copy(dir).mult(scale);
                p5instance.line(pos.x, pos.y, pos.x + dirTemp.x, pos.y + dirTemp.y)
            },
            displayDirectionDependencies: ["pos","dir"] //has to be in the same order than in the arguments
        }
    },

}={}) {

    //Initialize all the particles
    const self = {
        num,
        boundary,
        movement,
        wrap,
        queryRadius,
        safeRadius,
        particles: [],
    }

    for(let i=0; i<num; i++){
        

        let newParticle = createParticle({
            position: (posGenerator instanceof Function ) ? posGenerator(i) : posGenerator, 
            direction: (dirGenerator instanceof Function ) ? dirGenerator(i) : dirGenerator,
            inertialMass: (inertialMass instanceof Function ) ? inertialMass(i) : inertialMass,
            momentInertia: (momentInertia instanceof Function ) ? momentInertia(i) : momentInertia,
            
            movement: movement,

            initialVelocity: (initialVelocity instanceof Function ) ? initialVelocity(i) : initialVelocity,
            initialAngularVelocity: (initialAngularVelocity instanceof Function ) ? initialAngularVelocity(i) : initialAngularVelocity,

            maxForce: (maxForce instanceof Function ) ? maxForce(i) : maxForce,
            maxTorque: (maxTorque instanceof Function ) ? maxTorque(i) : maxTorque,
            
            maxSpeed:(maxSpeed instanceof Function ) ? maxSpeed(i) : maxSpeed,
            maxAngVel: (maxAngVel instanceof Function ) ? maxAngVel(i) : maxAngVel,
            translationDamping: (translationDamping instanceof Function ) ? translationDamping(i) : translationDamping,
            rotationDamping: (rotationDamping instanceof Function ) ? rotationDamping(i) : rotationDamping,
            behaviours: (behaviours instanceof Function ) ? behaviours(i) : behaviours,
            display: (display instanceof Function ) ? display(i) : display
        });

        self.particles.push(newParticle);

        //Collision Detection
        if(collisionDetection == 'SPACE_HASH_2D'){

        }
        if(collisionDetection == 'QUADTREE'){
            self.collisionDetection = quadTree(boundary, 8)
            self.collisionDetection.insert(newParticle);
        }
    }


    //interactions
    self.update = (

    ) => {

        if(movement == 'dynamic'){
            for(let i =0; i < num; i++){
                let range = circle(self.particles[i].x, self.particles[i].y, queryRadius);
                let safeRange = circle(self.particles[i].x, self.particles[i].y, safeRadius);
                let forMerge = self.collisionDetection.query(safeRange);
                let inRange = self.collisionDetection.query(range);
                
                let indexThis = forMerge.indexOf(self.particles[i]);
                if(indexThis > -1){
                    forMerge.splice(indexThis, 1); 
                }

                let agents = inRange.filter(x => !forMerge.includes(x) );

                self.particles[i].applyForces(agents);
                self.particles[i].move(); 

                /*-------------------
                ----Merging stuff----
                --------------------*/
                if(merge == true){
                    let numMerge = forMerge.length;

                    for(let j=0; j<numMerge; j++){  
                        self.particles[i].merge(forMerge[j]); //There is a problem here! Sebugg
                        indexToRemove = self.particles.indexOf(forMerge[j]);

                        //delete the second particle from particles
                        if(indexToRemove > -1){
                            self.particles.splice(indexToRemove, 1);
                            num--;
                            if(indexToRemove < i){
                                i--;
                            }
                        }

                        //delete the second particle from quadTree

                        self.collisionDetection.remove(forMerge[j]);
                    }
                }
                
                
            }

            self.collisionDetection = quadTree(boundary, 8);
            for(let i=0; i<self.particles.length; i++){
                self.collisionDetection.insert(self.particles[i]);
            }
        }
    };

    self.display = (
        p5inst,
        particles = true,
        forces = false,
        direction = false
    ) => {
        for(p of self.particles){
            particles ? p.display.show(p5inst) : null;
            forces ? p.display.force(p5inst) : null;
            direction ? p.display.direction(p5inst) : null;
        }
    }

    return self;
}