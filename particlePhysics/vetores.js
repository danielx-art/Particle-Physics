//vetores
const createVector = function( x = 0, y = 0, z = 0 ) {

    var self = {
        x,
        y,
        z,
        copy: function(other){
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            return this;
        },
        add: function(other){
            this.x = this.x + other.x;
            this.y = this.y + other.y;
            this.z = this.z + other.z;
            return this;
        },
        sub: function(other){
            this.x = this.x - other.x;
            this.y = this.y - other.y;
            this.z = this.z - other.z;
            return this;
        },
        mult: function(escalar){
            this.x = this.x*escalar;
            this.y = this.y*escalar;
            this.z = this.z*escalar;
            return this;
        },
        div: function(escalar){
            if(escalar == 0) {
                escalar += 0.01;
            }
            return this.mult(1/escalar);
        },
        dot: function(other){
            return this.x*other.x + this.y*other.y + this.z*other.z;
        },
        cross: function(other) {
            const tempx = this.y * other.z - this.z * other.y;
            const tempy = this.z * other.x - this.x * other.z;
            const tempz = this.x * other.y - this.y * other.x;
            //this.x = tempx;
            //this.y = tempy;
            //this.z = tempz;
            return createVector(tempx, tempy, tempz);
        },
        mag: function(){
            return Math.sqrt(this.dot(this));
        },
        setMag: function(newmag){
            this.mult(newmag/this.mag());
            return this;
        },
        limit: function(uplimit){
            if(this.mag() > uplimit) {
                this.setMag(uplimit);
            }
            return this;
        },
        heading: function(){
            return Math.atan2(this.y, this.x);
        },
        rotate: function(a){
            let newHeading = this.heading() + a;
            const mag = this.mag();
            this.x = Math.cos(newHeading) * mag;
            this.y = Math.sin(newHeading) * mag;
            return this;
        },
        angleBetween: function angleBetween(v) {
            const dotmagmag = this.dot(v) / (this.mag() * v.mag());
            let angle;
            // Mathematically speaking: the dotmagmag variable will be between -1 and 1
            // inclusive. Practically though it could be slightly outside this range due
            // to floating-point rounding issues. This can make Math.acos return NaN.
            //
            // Solution: we'll clamp the value to the -1,1 range
            angle = Math.acos(Math.min(1, Math.max(-1, dotmagmag)));
            angle = angle * Math.sign(this.cross(v).z || 1);
            if (this.p5) {
              angle = this.p5._fromRadians(angle);
            }
            return angle;
          },

    }

    return self;

};

const vec = createVector;