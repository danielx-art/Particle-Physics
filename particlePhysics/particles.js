const createParticleSystem = function(
    //0.p5inst
    s,
    //1.number of particles
    num = 1,
    //2.boundary
    boundary = new Rectangle(0,0,500,500),
    //3.function to generate positions
    posGenerator,
    //4. particle properties
    inertialMass = 1,
    momentInercia = 1000,
    //5.type of movement
    movement = "dynamic",
    //6. merge true or false
    merge = true,
    //7.movement variables
    maxForce = 20,
    maxSpeed = 0.1,
    maxAngVel = 0.3,
    translationDamping = 0.9,
    rotationDamping = 0.8,
    wrapType = "torus",
    queryRadius = 50,
    safeRadius = 5,
    //8.list of behaviours
    behaviours, //THIS SHOULD BE AN ARRAY
    //9.display
    display = true //deal with this

) {

    //set default callback functions
    if(!(typeof posGenerator === 'function')){
        //console.log("Por favor passe uma função como argumento para gerar as posições das partículas");
        posGenerator = () => vec(Math.random()*(boundary.width-200)+100, Math.random()*(boundary.height-200)+100);
    }

    const self = {
        particles: [],
        quadTree: new QuadTree(boundary, 8)
    }


    //generate particles and quadTree
    for(let i=0; i<num; i++){
        let newPos = posGenerator(i,s);
        let newParticle = createParticle(
            newPos, 
            movement, 
            maxForce, 
            maxSpeed, 
            maxAngVel, 
            translationDamping, 
            rotationDamping, 
            behaviours
            );
        self.particles.push(newParticle);
        self.quadTree.insert(newParticle);
    }

    //interactions
    self['update'] = (

    ) => {

        if(movement == 'dynamic'){
            for(let i =0; i < num; i++){
                let range = new Circle(self.particles[i].x, self.particles[i].y, queryRadius);
                let safeRange = new Circle(self.particles[i].x, self.particles[i].y, safeRadius);
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

            if(display){
                for(let p of self.particles){
                    p.body.show(s, false);
                }
            }

            quadTree = new QuadTree(boundary, 8);
            for(let i=0; i<self.particles.length; i++){
                quadTree.insert(self.particles[i]);
            }
        }
    };

    return self;
}

/* --------------------------------------------------------------
-----------------------------------------------------------------
---------------------THE PARTICLE FACTORY------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------*/

const createParticle = function(

    pos = vec(x,y),
    movement = 'static',
    maxForce = 20,
	maxSpeed = 0.1,
    maxAngVel = 0.3,
    translationDamping = 0.9,
    rotationDamping = 0.8,
    behaviours

) {

    const self = {
        //this is the 'body' of the behaviours
        body: 
        { 
            pos,
            inertialMass: 1,
            momentInercia: 1000,
            movement: arguments[1],
        },

        //getters for x and y for quadTree
        get x () {
            return this.body.pos.x
        },

        get y (){
            return this.body.pos.y
        }

    }

    //set the direction heading at initialization
    self.body['dir'] = createVector(1,0);

    //behaviours assignment
    for (const physics of behaviours) {
        let newPhysics = physics.type([physics.intensity, physics.propertyGenerator]);
        self[newPhysics.kind] = newPhysics.create(newPhysics.m, self.body);
        //self[physics(self).kind] = physics(self);
    }
    let behaviourKeys = Object.keys(self);
    behaviourKeys.shift(); //take off the body
    behaviourKeys.shift(); //take off x getter
    behaviourKeys.shift(); //take off y getter

    //the engine behind the dynamic type
    if(self.body.movement == 'dynamic'){
        //translation
        self.body.vel = createVector();
        self.body.acl = createVector();
        //rotation        
        self.body.angvel = createVector();
        self.body.angacl = createVector();
        
        self.body.applyForces = (agents) => { //implement if i only want to select one or more behaviour phenomenon
            for(const f of behaviourKeys){
                self[f].forces(agents, self.body);
            }
        }
        
        self.body.move = (p5inst) => {
            //translation
            if(p5inst){
                p5inst.stroke(0);
                //let tempF = vec(self.body.acl.x, self.body.acl.y);
                let tempF = vec().copy(self.body.acl);
                //tempF.mult(1000000);
                //tempF.limit(maxForce);
                //console.log(tempF); //debugg
                p5inst.stroke(0,255,0);
                tempF.setMag(p5inst.width*0.1);
                p5inst.line(self.body.pos.x, self.body.pos.y, self.body.pos.x + tempF.x, self.body.pos.y + tempF.y);
                //p5inst.line(self.body.pos.x, self.body.pos.y, self.body.pos.x + tempF.x*100, self.body.pos.y + tempF.y*100);
            }
            self.body.vel.add(self.body.acl);
            self.body.vel.mult(translationDamping); //translation damping
            self.body.vel.limit(maxSpeed);
            //console.log(self.body.vel); //debugg -test
            self.body.pos.add(self.body.vel);
            self.body.acl.mult(0);
            //rotation
            self.body.angacl.limit(maxForce);
            self.body.angvel.add(self.body.angacl);
            self.body.angvel.mult(rotationDamping); //rotational damping
            self.body.angvel.limit(maxAngVel);
            deltadir = self.body.angvel.cross(self.body.dir);
            self.body.dir.add(deltadir).limit(1);
            self.body.angacl.mult(0);
            
            //notify all behaviours
            for(const f of behaviourKeys){
                self[f].takenote(self.body); //debugg <- here is the problem
            }
        }


        //merge function
        self.body.merge = (particleForMerge) => {
            //console.log(particleForMerge); //debugg
            let p1 = self.body;
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
            self.body.inertialMass = mcm;
            self.body.pos = vec().copy(xcm);
            self.body.vel = vec().copy(vcm);
            self.body.momentInercia = Icm;
            self.body.angvel = vec().copy(wcm);

            //notify the merge to all behaviours
            for(const f of behaviourKeys){
                self[f].merge(particleForMerge[f]);
            }

            //console.log(self); //debugg
        }
    }

    self.body['show'] = (p5inst, dirVector) => {
        p5inst.noStroke();
        p5inst.fill(0);
        //p5inst.ellipse(self.body.pos.x, self.body.pos.y, 15, 15);
        if(dirVector){
            p5inst.stroke(0);
            p5inst.line(self.body.pos.x, self.body.pos.y, self.body.pos.x + self.body.dir.x*100, self.body.pos.y + self.body.dir.y*100);
            p5inst.stroke(255,0,0);
            p5inst.line(self.body.pos.x, self.body.pos.y, self.body.pos.x + self.magnet.m.x/10, self.body.pos.y + self.magnet.m.y/10);
        }
        p5inst.beginShape();
        let rH = 20;
        let rW = 10;
        let tempH = vec().copy(self.body.dir).setMag(rH);
        let tempW = vec().copy(tempH).rotate(Math.PI/2).setMag(rW);
        let vertex1 = vec().copy(self.body.pos).add(tempH).add(tempW);
        p5inst.vertex(vertex1.x, vertex1.y);
        let vertex2 = vec().copy(self.body.pos).add(tempH).add(tempW.rotate(Math.PI));
        p5inst.vertex(vertex2.x, vertex2.y);
        let vertex3 = vec().copy(self.body.pos).add(tempH.rotate(Math.PI)).add(tempW);
        p5inst.vertex(vertex3.x, vertex3.y);
        let vertex4 = vec().copy(self.body.pos).add(tempH).add(tempW.rotate(Math.PI));
        p5inst.vertex(vertex4.x, vertex4.y);
        p5inst.endShape();
    }

    return self;
};

