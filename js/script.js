class Mouse{
    constructor(){
        ;
    }
    X;
    Y;
}

class Dot{
    constructor(x,y){
        this.origX = x;
        this.origY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
    Draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,2,0,2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}

class Jelly{
    constructor(x,y,color,radius){
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        //const section
        this.interactRadius = 75;
        this.interactFactor = .25;
        this.spring = .2;
        this.inertiaFactor = .92;
        this.tensionFactor = .2;
        //generate dots for our jelly!
        for(var i = 0; i < 200;i++){
            var alpha = 2*Math.PI*i/200;
            this.dots.push(new Dot(this.x + Math.cos(alpha) * radius ,this.y + Math.sin(alpha) * radius))
            console.log(this.x + Math.cos(alpha) * radius,this.y + Math.sin(alpha) * radius);
        }
    }
    dots = [];

    Simulate(m){
        for(var i = 0; i<this.dots.length;i++){
            //simulate inertia: speed is slowing down
            this.dots[i].vx *= this.inertiaFactor;
            this.dots[i].vy *= this.inertiaFactor;
            //mouse calculations
            let dx = this.dots[i].x - m.X;
            let dy = this.dots[i].y - m.Y;
            let dist = Math.sqrt(dx*dx+dy*dy);
            if(dist < this.interactRadius){
                this.dots[i].vx = (this.interactRadius - dist)* dx / dist * this.interactFactor;//m.X + this.interactRadius* dx / dist;
                this.dots[i].vy = (this.interactRadius - dist)* dy / dist * this.interactFactor;//m.Y + this.interactRadius* dy / dist;
            } 
            //dots are tending to return to their origin
            this.dots[i].vx += (this.dots[i].origX - this.dots[i].x) * this.spring;
            this.dots[i].vy += (this.dots[i].origY - this.dots[i].y) * this.spring;
            //surface tension
            //!!!HEAVY!!!
            var dp = (i>0? this.dots[i-1] : this.dots[this.dots.length-1]);
            var dn = (i<this.dots.length - 1? this.dots[i+1]:this.dots[0]);
            var distanceP = Math.sqrt((this.dots[i].x - dp.x)*(this.dots[i].x - dp.x) + (this.dots[i].y - dp.y)*(this.dots[i].y - dp.y));
            var distanceN = Math.sqrt((this.dots[i].x - dn.x)*(this.dots[i].x - dn.x) + (this.dots[i].y - dn.y)*(this.dots[i].y - dn.y));
            if(distanceN>distanceP){
                this.dots[i].vx+= Math.sign(dn.x - this.dots[i].x)*this.tensionFactor*(distanceN-distanceP)/Math.max(1,(distanceN+distanceP));
                this.dots[i].vy+= Math.sign(dn.y - this.dots[i].y)*this.tensionFactor*(distanceN-distanceP)/Math.max(1,(distanceN+distanceP));
            } else {
                this.dots[i].vx+= Math.sign(dp.x - this.dots[i].x)*this.tensionFactor*(distanceP-distanceN)/Math.max(1,(distanceN+distanceP));
                this.dots[i].vy+= Math.sign(dp.y - this.dots[i].y)*this.tensionFactor*(distanceP-distanceN)/Math.max(1,(distanceN+distanceP));
            }
            //this.dots[i].vx += ()*this.tensionFactor;
            //move the dot
            this.dots[i].x += this.dots[i].vx;
            this.dots[i].y += this.dots[i].vy;
            
        }
    }

    Draw(context) {
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        for(var i= 0;i<=this.dots.length;i++){
            var d1 = this.dots[i >= this.dots.length ? i - this.dots.length : i];
            var d2 = this.dots[i + 1 >= this.dots.length ? i+1 - this.dots.length : i+1];
            ctx.quadraticCurveTo(d1.x,d1.y,(d1.x+d2.x)*.5,(d1.y+d2.y)*.5);
        }
        context.fillStyle = '#00a0a0'
        context.stroke();
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        context.fillStyle = '#00a0a0'
        this.dots.forEach(element => {
            //element.Draw(context);
        });
        context.restore();
    }
}
//==========================================================================


var canvas = document.getElementById('jelly');
var ctx = canvas.getContext('2d');
var jelly = new Jelly(250,250,'#00ff00',200)
var m = new Mouse();


function Render(){
    window.requestAnimationFrame(Render);
    
    ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    ctx.fillStyle = '#000000'
    ctx.rect(0,0,canvas.clientWidth,canvas.clientHeight);
    ctx.fill();
    jelly.Simulate(m);
    jelly.Draw(ctx);
    //debug
    //Circle(m.X,m.Y,30)
}

function Circle(x,y,r){
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fillStyle = '#f06090';
    ctx.fill();
    //ctx.stroke();
    ctx.closePath();
}

//circle(100,100,100);
canvas.onmousemove = (e)=>{
    var rect = canvas.getBoundingClientRect();
    m.X= e.clientX-rect.left;
    m.Y = e.clientY - rect.top;
}

Render();