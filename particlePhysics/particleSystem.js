const createParticleSystem = function(
    
    num = 1,

    boundary = rectangle(0,0,720,720),

    posGenerator = (i)=>{ return vec(Math.random()*(boundary.width-200)+100, Math.random()*(boundary.height-200)+100) },

    dirGenerator = (i)=>{ return vec().random2D()},

    inertialMass = (i)=>{return 1},
    momentInertia = (i)=>{return 1000},

    movement = "dynamic",

    initialVelocity = (i) => {return vec()},
    initialAngularVelocity = (i) => {return vec()},
    maxForce = (i)=>{return 1},
    maxSpeed = (i)=>{return 0.5},
    maxAngVel = (i)=>{return 0.5},
    translationDamping = (i)=>{return 1},
    rotationDamping = (i)=>{return 1},

    wrap = "torus",

    collisionDetection = 'QUADTREE',

    queryRadius = 50,

    safeRadius = 5,

    merge = true,

    behaviours = (i) => {return [{
        type: 'externalForce',
        intensity: 10,
        field: () => {return vec(0,1)} //just a constant vertical gravity
    }]},

    display = (i) => {return {
        scale: 10, 
        displayFunction: (p5instance, radius, pos) => {
            p5instance.ellipse(pos.x, pos.y, radius, radius);
        },
        dependencies: ["pos"]
    }},

) {

    
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
        
        let newPos = (posGenerator instanceof Function ) ? posGenerator(i) : posGenerator;
        let newDir = (dirGenerator instanceof Function ) ? dirGenerator(i) : dirGenerator;
        let newInertialMass = (inertialMass instanceof Function ) ? inertialMass(i) : inertialMass;
        let newMomentInertia = (momentInertia instanceof Function ) ? momentInertia(i) : momentInertia;
        let newMovement = movement;
        let newVelocity = (initialVelocity instanceof Function ) ? initialVelocity(i) : initialVelocity;
        let newAngVelocity = (initialAngularVelocity instanceof Function ) ? initialAngularVelocity(i) : initialAngularVelocity;
        let newMaxForce = (maxForce instanceof Function ) ? maxForce(i) : maxForce;
        let newMaxSpeed = (maxSpeed instanceof Function ) ? maxSpeed(i) : maxSpeed;
        let newMaxAngVel = (maxAngVel instanceof Function ) ? maxAngVel(i) : maxAngVel;
        let newTranslationDamping = (translationDamping instanceof Function ) ? translationDamping(i) : translationDamping;
        let newRotationDamping = (rotationDamping instanceof Function ) ? rotationDamping(i) : rotationDamping;
        let newBehaviours = (behaviours instanceof Function ) ? behaviours(i) : behaviours;
        let newDisplay = (display instanceof Function ) ? display(i) : display;

        let newParticle = createParticle(
            newPos, 
            newDir,
            newInertialMass,
            newMomentInertia,
            newMovement,
            newVelocity,
            newAngVelocity,
            newMaxForce,
            newMaxSpeed,
            newMaxAngVel,
            newTranslationDamping,
            newRotationDamping,
            newBehaviours,
            newDisplay
        );

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
                let forMerge = self.quadTree.query(safeRange);
                let inRange = self.quadTree.query(range);
                
                let indexThis = forMerge.indexOf(self.particles[i]);
                if(indexThis > -1){
                    forMerge.splice(indexThis, 1); 
                }

                let agents = inRange.filter(x => !forMerge.includes(x) );

                self.particles[i].body.applyForces(agents);
                self.particles[i].body.move(); 

                /*-------------------
                ----Merging stuff----
                --------------------*/
                if(merge == true){
                    let numMerge = forMerge.length;

                    for(let j=0; j<numMerge; j++){  
                        self.particles[i].body.merge(forMerge[j]); //There is a problem here! Sebugg
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

                        self.quadTree.remove(forMerge[j]);
                    }
                }
                
                
            }

            self.collisionDetection = quadTree(boundary, 8);
            for(let i=0; i<self.particles.length; i++){
                self.collisionDetection(self.particles[i]);
            }
        }
    };

    self.display = (

    ) => {
        for(p of self.particles){
            p.display.show();
        }
    }

    return self;
}