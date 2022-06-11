# Welcome!
## Presenting myself

Hi! My name is Daniel and I am a Physics and Maths teacher or instructor or educator, however you wanna call it, by profession, meaning I sustain myself financially by teaching these disciplines to people all ages who are interested for some reason (the majority of my students are high school level preparing theirselves for entrance examinations on universities in Brazil) ***but*** I am also an artist by heart in my freetime and in my view coding is a great place to also make some artsy stuff.
_So..._ I have been creating educational illustrations, animations and presentations since I was myself in high school and for some years now I've been messing with Processing and p5.js creating, most of the time, particle systems. That said I naively decided to "speed up my workflow" by constructing a more general way to design and render particle systems animations, wich is this project you are on right now that I've been working on sporadically for the past maybe couple of years.

## Important!
Please note that this is a ***work in progress project*** and there are a lot of bugs to fix, things to add (like error handling) and documentation to write, and I'm doing this all by myself. If you wanna help, please let me know how (I'm new to git and Idk how this should work) by sending me an e-mail (metacarpo10@gmail.com) so we can talk, and alternatively If you wanna motivate me financially so I can direct more of my time to this I'm also providing a PayPal donation link [HERE].

[HERE]: https://www.paypal.com/donate/?hosted_button_id=C7659JA4NE4U6

## **GENERAL OBJECTIVES AND NOT**

- Build a simple and easy way to create and manage a virtual particle system. 
- Build a sistematic way to design and custom your own physical behaviour from scratch, instead of using just pre  built ones that simulate actual real physics, like gravity or electrostatic forces.
- **Not** implement the drawing on the canvas html object, this can be done via other libraries such as [p5.js] and [TREE.js].
- **Not** build a game engine.
- Learn some stuff, make some art and have **FUN**!


[p5.js]: https://p5js.org/
[TREE.js]: https://threejs.org/


## **SPECIFIC OBJECTIVES**
My goal here is to create a base code in wich one could easily create a particle system in wich one can:
- create the particles in a system or individually
- give each particle a list of physical behaviours that it will interact trough.
- build the basis of a physical behaviour that one can populate with its own laws and "physics"
- let the particles exist in a virtual space that does NOT need to be the rectangular space of the canvas, a space equipped with its own geometry/topology (and distance formula) that can eventually (in the final steps) be mapped into the retangular space of the canvas for us to visualzie. 
    - this geometry can be bounded, polygonal, in wich the particles can collide and bounce with a specific elasticity
    - this geometry can be closed onto itself in a higher dimension, enclosing a volume, such that particles can go "around" it, as for example on a torus, on a sphere or on an amoeba shaped thing.
    - this geometry can be opened and infinite so the particles either can go so far as to not be shown on the canvas, or alternatively be located at the borders of the canvas asymptotically (at the limit) as they approach "Infinity".
- detect collisions between particles (in the specified geometry) with reasonable speed and physical accuracy (my goal is for it to be able to handle a million particles like a kinectic fluid simulation if I want to)
- organize particles in graphs in order to customize behaviours even more by detecting connected particles and so on
- customize how the particles will be shown (a circle, a shape, an image or make them invisible)
- vizualise ***EVERYTHING***:
    - trace particles trajectories
    - draw force vector fields and tendencies
    - draw connections between particles
    - see collision detection algorythims at work
    - color pixels or regions of the canvas based on particles properties or mean values, such as temperature, density, velocity etc

## **ALGORITHMS AND IDEAS FOR FURTHER IMPLEMENTATION** (*or how to overcomplicate things*)
- Implement Runge Kutta order 4 for solving dynamics
- Option for a quadtree (or k-tree) to handle collision detection between particles (O(n.log(n))) ***OR*** space hashing, in wich we divide the particles' space in cells and search for interactions or collisions of a particle only in specified cells (for example in neighbour cells within a certain distance from the mentioned particle).
- GJK algorithm for detecting polygon intersection, that can be useful for:
    - customize querying shapes for particle detection of interactions with others
    - implementing custom interactions and collisions between different particle systems, maybe
- Implement substepping for optimizing accuracy, dividing the frame into sub calculations.
- Implement helper functions to sort arrays (like distances from a particle and the particles in its query region or the velocities off all particles etc). 
This would be useful for designing springs, cloth simulations or soft bodies - the better algorithm here would probably be Tim Sort.
- Implement a particle's life time: it is destroyed after some time (and maybe also introduce some variance trough an error property as well) and then maybe be recreated (using the same initial properties?) or replaced.
- Maybe implement a "source", or a region in wich the particles will be generated -> This could be done via the generator of initial positions and velocities, so maybe just create some helper functions to use as prebuilt parameters. 

## TODO (for developers use only)

- Reimplement the space hash algorithm
- prebuilt some helper functions to generate initial positions
- let the particle system have the option to get the number from the initial positions generator
- check and update the tracing mekanisms

# Creating a particle system

To create a particle system we use the function `createParticleSystem({})` wich receives as an argument an object with the following keys:

1. [num](#num): The number of particles to be created

2. [boundary](#boundary): 
The world boundary in wich the particles will coexist (usually a rectangle)

3. [posGenerator](#posGenerator):  
A function that tells the particle system how to populate the world initially by generating each particle's initial position given its index.

4. [dirGenerator](#dirGenerator): 
Similarly, a function to generate each particle's initial facing direction (in case we want to deal with turning motions).

5. [inertialMass](#inertialMass): 
The same for the mass of each particle.

6. [momentInertia](#momentInertia): 
The same for the moment of inercia of each particle.

7. [movement](#movement): 
That tells the particle system if you want the particles to actually move or to be static

8. [intialVelocity](#intialVelocity): Again, that's a function that gives the particle system the initial velocity vector of each particle

9. [maxForce](#maxForce): The same for generating the cap limit for the force each particle can experience

10. [maxSpeed](#maxSpeed): The same for each particle's maximum speed (pixels traveled each frame)

11. [maxAngVel](#maxAngVel): The same for each particle's maximum angular speed (change in direction by frame)

12. [translationDamping](#translationDamping): The same for giving each particle a damping effect on its speed each frame

13. [rotationDamping](#rotationDamping): And also a rotational damping

14. [wrap](#wrap): A keyworld that tells ow your particle system should deal with particles that would travel beyound your world bounders.

15. [collisionDetection](#collisionDetection): The collision detection algorythm to be used by the system.

16. [queryRadius](#queryRadius): The maximum distance between two particles bellow wich they are able to "see" or influence each other. 

17. [safeRadius](#safeRadius): A security measure. Particles that are closer to each other then this value do not "see" or influence each other, unless by merging if so.

18. [merge](#merge): A boolean value that if set to true make particles merge into one if they get too close.

19. [behaviours](#behaviours): In short, this is also a function that returns, for each particle, a list of all "behaviours" a particle should suffer from, for example gravity or magnetism.

20. [display](#display): Also a function that maps each particle into the instructions on how to display it on the screen, or canvas.

_Note that this is only meant to be an index list with all possible parameters of the particle system. In order to understand how they should be coded and see examples please click on the list above and go to each one's detailed section._

## Example

As a sneak peak, here's an example of the usage of createParticleSystem().

``` javascript
let p = createParticleSystem({
			num: 60,
			boundary: rectangle(0,0,400, 300),
			posGenerator: putIndexOnASpacedGrid(6,10,40,50,0,0),
			movement: 'dynamic',
			initialVelocity: (i) => {
				return vec();
			},
			maxForce: ()=>{return 0.1},
			maxSpeed: ()=>{return 0.5},
			queryRadius: 400,
			safeRadius: 20,
			merge: true,
			behaviours: (i)=>{return[
				{
				    type:'gravity',
				 	G: 70,
				 	safeRadius: 20
				}
			]},
			display:
            //here I'll use some functionality of p5.js
            (i) => {return {
				scale: 5, 
				displayFunction: (s, radius, pos) => {
					s.ellipse(pos.x, pos.y, radius, radius);
				},
				dependencies: ["pos"]
			}}
		});
```

## Default parameters of createParticleSystem()

```javascript
const createParticleSystem = function({

    num = 1,

    boundary = rectangle(0,0,720,720),

    posGenerator = (i)=>{ return vec(Math.random()*(boundary.width-200)+100, Math.random()*(boundary.height-200)+100) },

    dirGenerator = (i)=>{ return vec().random2D()},

    inertialMass = (i)=>{return 1},
    momentInertia = (i)=>{return 1000},

    movement = "dynamic",

    initialVelocity = (i) => {return vec()},
    maxForce = (i)=>{return 1},
    maxSpeed = (i)=>{return 0.5},
    maxAngVel = (i)=>{return 0.5},
    translationDamping = (i)=>{return 1},
    rotationDamping = (i)=>{return 1},

    wrap = "torus",

    collisionDetection = 'SPACE_HASH_2D',

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


}={})/*all the function code here*/.}
```
___


# The Particle

A particle is an object that can interact with other particles via its physics, for that pourpose it is divided into a ***basic body structure***, then ***movement parameters*** that are only initialized if the particle is set to dynamic, followed by ***a physics structure*** that list all of its behaviours and forms of interaction to one another, and ***display methods*** to show it on the screen:

- ### Basic body:

    * position
    * direction 
    * inertial mass
    * moment of inercia

- ### Movement related:

    * if it is ***static*** or ***dynamic***, meaning it can move, and if so it also is initialized with:
        - velocity
        - acceleration
        - angular velocity
        - angular acceleration
        - a method to apply the forces it can feel
        - a method to move
        - a method to merge with others

- ### [Display Object](#the-display-object-and-methods):

    * a method to display itself
    * a method to display the force vector it feels
    * a method to display the direction it is facing

- ### [Physics object](#the-physics-of-a-particle)

_The particle also have two getters, x and y, to quick get its position on the virtual world_

Let's now dive deep into each one:

# Basic body properties

- ***position***: am x, y, z vector named as `pos`
> particle.pos

# The Physics Of A Particle

A particle can interact with others and the world it is in by a list of phenomena stored in physics property that is in itself an object.

### Example

```
particle.physics
```

```
{
    gravity,
    magnet
}
```

## Initialization
All the physical properties of a particle are initially passed as an argument to `createParticle` in the form of an array of objects called behaviours that list all physical behaviours names in a "type" key and any other functionality.
Then, when created, the particle will execute a function with the name `create<Type>`, where \<Type> is the value associated with the key type on the behaviour with its first letter on uppercase ([more details](#more-details-in-a-physics-behaviour-assingnment)). Follow the example bellow:

```javascript
behaviours: [
    {
        type: 'gravity'
        G: 10,
        safeRadius: 10
    }
    ,
    {
        type: 'magnet'
        mdipole: (pos) => {return vec(pos.x, 0).setMag(1)},
        mdipoleDependencies: ['pos']
    }
]

```

would execute

```javascript
createGravity('gravity', 10, 10);

createMagnet('magnet', mdipole, mdipoleDependencies)
```
wich in the particle in question would result in the creation of a 'gravity' and a 'magnet' object inside the physics object, like in the [first example](#the-physics-of-a-particle).

## More details in a physics behaviour assingnment

As mentioned previously, behaviour assingment in a particle is done by reading the behaviours argument of `createParticle` and then executing a function `create<Type>` for each one. All the key values of the behaviour item in question are passed as arguments to `create<Type>` together with the `window` object and the particle itself.

```javascript
for (const behaviour of behaviours) {
        let behaviourName = behaviour.type;
        let factoryName = "create"+behaviourName.charAt(0).toUpperCase()+behaviourName.slice(1);
        self.physics[behaviourName] = executeFunctionByName(factoryName, window, self, ...Object.values(behaviour).slice(1));
}
```

where `executeFunctionByName` uses the `window` object as a context in wich to find `create<Type>` (`factoryName` above), and it can be found in the helpers.js file:

```javascript
function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    //get deeper into nested contexts
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}
```

# Creating Your Own Physics Behaviour

You can very easly create your own custom Physics behaviour that will be able to influence the properties of the particle it will be attatched to either automatically each frame or by interacting with other particles. 

To do that, **first you have to choose an unique behaviour name/type**, let's say for example "myBehaviour", and then creating a function named "create" followed by the type with the first letter to uppercase as shown:

>function createMyBehaviour(particle, args){...}

As a obligatory argument, you have to pass a generic particle that this behaviour will be later attached to so it can influence it and alter its properties like position, velocity,direction etc.

The function should return an object and this object **must have a type key with its name as you previously chose and three obligatory methods**:
- **forces**: a function that will be called when the particle experience this behaviour, and as an argument this function will receive an array of other particles, called agents, that are other particles with the same behaviour in a query range of this one (more details in the collision detection section).
- **hasMoved**: a function that will be called _after_ the particle experience the behavior, and has the particle as an argument
- **merge**: a function thas has another particle's same behaviour object as an argument and has to describe what happens to this behaviour when this particle merges with the reffered another particle.

***Note*** that these methods don't have to do anything at all if you don't want to, and you might fill them with whatever logic you want.

A very empty basic behaviour that wouldn't do anything would be:

```javascript
createMyBehaviour = function(particle){
    return {
        type: 'myBehaviour',
        forces: (agents) => {},
        hasMoved: (newState)=>{},
        merge: (otherThis)=>{}
    }
}
```

And this would be a simple gravity effect pulling down globaly (remember the y is upside down on the p5canvas):

```javascript
    createMyBehaviour = function(particle, intensity){
        return{
            type: 'myBehaviour',
            forces:(agents)=>{
                let g = vec(0,intensity);
                particle.acl.add(g);
            },
            hasMoved: (newState)=>{},
            merge: (otherThis)=>{}
        }
    }
```

***Note*** that you can access any of the properties the associated particle or the properties of other particles in range of this one, the `agents`, everyframe  inside the forces method, including other physical properties, but be sure you are not trying to access properties that doesn't exist, this will return an error.

# Prebuilt Physical Behaviours

## Gravity (Newton's)

## Electrostatic Force (Coulomb's Law)

## Magnetism

## Elastic (Hooke's Law)

# The Display Object And Methods

When creating a particle or a particle system, one should specify how the particles are to be showed on the screen by a display object, wich is informed in the arguments of `createParticle()` or `createParticleSystem()`, where in the latter you could also pass a function to generate for each particle index a different display object. This object can contain a scale property, a method called displayFunction, a method called displayForce and a method called displayDirection, each one self explanatory.

### Example

As an argument of `createParticle()`:

```javascript


```