
var cvs = document.querySelector("canvas");
var ctx = cvs.getContext("2d");

var ctrldef = document.querySelector("#ctrldef");
var ctrlmap = document.querySelector("#ctrlmap");

var ctrls = [document.querySelector("#in1"),
            document.querySelector("#in2"),
            document.querySelector("#in3"),
            document.querySelector("#in4"),
            document.querySelector("#in5"),
            document.querySelector("#in6"),
            document.querySelector("#in7"),
            document.querySelector("#in8"),
            document.querySelector("#in9"),
            document.querySelector("#in10")];

var rmpbutt = document.querySelector("#rmp");
var confbutt = document.querySelector("#conf");

var HEIGHT = (window.innerHeight) - 40;
var WIDTH = (window.innerWidth) - 20;

var LOW = 0;
if (HEIGHT > WIDTH) {
    LOW = WIDTH;
}
if (WIDTH >= HEIGHT) {
    LOW = HEIGHT;
}

// U = UNIT
var U = LOW/900;

cvs.height = LOW;
cvs.width = LOW;

cvs.setAttribute("tabindex", 0);
cvs.focus();

var keys = ["ArrowUp", "w", "ArrowRight", "d", "ArrowDown", "s", "ArrowLeft", "a", "k", "j"];
for (let i = 0; i < keys.length; i++) {
    ctrls[i].value = keys[i];
}

rmpbutt.addEventListener("click", rmp_open);
confbutt.addEventListener("click", rmp_conf);

cvs.addEventListener("keydown", key_down);
cvs.addEventListener("keyup", key_up);





class Player {
    constructor (x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.dx = 0;
        this.dy = 0;
        this.ddx = 0;
        this.ddy = 0;
        this.angle = 0;
        this.da = 0;
        this.size = 5*U;
        this.pts = [[3*this.size, 60], [3*this.size, 120], [3*this.size, 240], [3*this.size, 300]];
        this.inv = 80;
        this.air = 0;
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2*U;

        ctx.beginPath();
        ctx.moveTo(render("x", this.x, this.pts[0][0], this.angle + this.pts[0][1]), render("y", this.y, this.pts[0][0], this.angle + this.pts[0][1]));
        for (let i = 1; i < this.pts.length; i++) {
            ctx.lineTo(render("x", this.x, this.pts[i][0], this.angle + this.pts[i][1]), render("y", this.y, this.pts[i][0], this.angle + this.pts[i][1]));
        }
        ctx.lineTo(render("x", this.x, this.pts[0][0], this.angle + this.pts[0][1]), render("y", this.y, this.pts[0][0], this.angle + this.pts[0][1]));
        if (this.inv < 80) {
            ctx.fillStyle = "cyan";
            ctx.fill();
        } else {
            ctx.stroke();
        }
        ctx.closePath();
    }

    update() {
        this.dx += this.ddx;
        this.dy += this.ddy;
        this.x += this.dx;
        this.y += this.dy;
        this.angle += this.da;

        if ((input[3] === true && input[1] === true) || (input[3] === false && input[1] === false)) {
                p1.dx = 0;
            } else if (input[1] === true) {
                p1.dx = 5*U;
            } else if (input[3] === true) {
                p1.dx = -5*U;
            }

        if (this.air === 2) {
            this.ddy = 0.8*U;
        } else if (this.air === 1) {
            this.ddy = U/2;
        } else {
            this.ddy = 0;
        }

        if (this.inv <= 0) {
            this.inv = 80;
        }
        if (this.inv < 80) {
            this.inv -= 1;
        }
    }
}

class Ground {
    constructor (x, y, width, height, color, platform) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.color = color;
        this.plat = platform;
        if (this.plat === "t") {
            this.pts = [[0, 0], [this.w, 0]];
        } else if (this.plat === "r") {
            this.pts = [[this.w, 0], [this.w, this.h]];
        } else if (this.plat === "b") {
            this.pts = [[this.w, this.h], [0, this.h]];
        } else if (this.plat === "l") {
            this.pts = [[0, this.h], [0, 0]];
        } else {
            this.pts = [[0, 0], [this.w, 0], [this.w, this.h], [0, this.h]];
        }
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2*U;
        ctx.beginPath();
        ctx.moveTo(this.x + this.pts[0][0], this.y + this.pts[0][1]);
        for (let i = 1; i < this.pts.length; i++) {
            ctx.lineTo(this.x + this.pts[i][0], this.y + this.pts[i][1]);
        }
        ctx.lineTo(this.x + this.pts[0][0], this.y + this.pts[0][1]);
        ctx.stroke();
        ctx.closePath();
    }
}

class Room {
    constructor (mapx, mapy, doors, configuration, color) {
        this.mx = mapx;
        this.my = mapy;
        this.d = doors;
        this.conf = configuration;
        this.color = color;
        this.sp = false;
        this.en = [];
        this.vis = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(13*LOW/15 + 20*U*(this.mx+0.5), 13*LOW/15 + 20*U*(this.my+0.5), 16*U, 16*U);
        if (this.d[0] === true) {
            ctx.fillRect(13*LOW/15 + 20*U*(this.mx+0.7), 13*LOW/15 + 20*U*(this.my+0.4), 8*U, 8*U);
        }
        if (this.d[1] === true) {
            ctx.fillRect(13*LOW/15 + 20*U*(this.mx+1), 13*LOW/15 + 20*U*(this.my+0.7), 8*U, 8*U);
        }
        if (this.d[2] === true) {
            ctx.fillRect(13*LOW/15 + 20*U*(this.mx+0.7), 13*LOW/15 + 20*U*(this.my+1), 8*U, 8*U);
        }
        if (this.d[3] === true) {
            ctx.fillRect(13*LOW/15 + 20*U*(this.mx+0.4), 13*LOW/15 + 20*U*(this.my+0.7), 8*U, 8*U);
        }
    }
}

class Words {
    constructor (x, y, t, color) {
        this.x = x;
        this.y = y;
        this.t = t;
        this.color = color;
    }

    draw(ctx) {
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.color;
        ctx.fillText(this.t, this.x, this.y);
    }
}

class Heart {
    constructor (x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.s = size;
        this.full = true;
        this.pts = [[4*this.s*U, 90], [12*this.s*U, 120], [16*this.s*U, 150], [15*this.s*U, 180], [12*this.s*U, 240], [16*this.s*U, 270], [12*this.s*U, 300], [15*this.s*U, 0], [16*this.s*U, 30], [12*this.s*U, 60]];
    }

    draw(ctx) {

        ctx.beginPath();
        ctx.moveTo(render("x", this.x, this.pts[0][0], this.pts[0][1]), render("y", this.y, this.pts[0][0], this.pts[0][1]));
        for (let i = 1; i < this.pts.length; i++) {
            ctx.lineTo(render("x", this.x, this.pts[i][0], this.pts[i][1]), render("y", this.y, this.pts[i][0], this.pts[i][1]));
        }
        ctx.lineTo(render("x", this.x, this.pts[0][0], this.pts[0][1]), render("y", this.y, this.pts[0][0], this.pts[0][1]));
        if (this.full === true) {
            ctx.fillStyle = this.color;
            ctx.fill();
        } else {
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        ctx.closePath();
    }
}

class Spikes {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.l = length;
    }

    draw(ctx) {
        ctx.fillStyle = "white";

        for (let i = 0; i < Math.floor(this.l/(U*10)); i++) {
            ctx.beginPath();
            ctx.moveTo(this.x+U*10*i, this.y);
            ctx.lineTo(this.x+U*10*(i+0.5), this.y-10*U);
            ctx.lineTo(this.x+U*10*(i+1), this.y);
            ctx.fill();
            ctx.closePath();
        }
    }
}

class Sword {
    constructor(x, y, length, color) {
        this.x = x;
        this.y = y;
        this.l = length;
        this.color = color;
        this.anseq = 0;
        this.dir = 1;
        this.pts = [[[this.l/1.25, 120], [this.l/1.75, 160], [this.l/1.6, 120]],
                    [[this.l, 90], [this.l/1.25, 120], [this.l/1.75, 160], [this.l/1.6, 120], [this.l/1.4, 90]],
                    [[this.l/1.6, 60], [this.l/1.25, 60], [this.l, 90], [this.l/1.25, 120], [this.l/1.75, 160], [this.l/1.6, 120], [this.l/1.4, 90]],
                    [[this.l/1.6, 60], [this.l/1.75, 20], [this.l/1.25, 60], [this.l, 90], [this.l/1.25, 120], [this.l/1.75, 160], [this.l/1.6, 120], [this.l/1.4, 90]],
                    [[this.l/1.6, 60], [this.l/1.75, 20], [this.l/1.25, 60], [this.l, 90], [this.l/1.25, 120], [this.l/1.6, 120], [this.l/1.4, 90]],
                    [[this.l/1.6, 60], [this.l/1.75, 20], [this.l/1.25, 60], [this.l, 90], [this.l/1.4, 90]],
                    [[this.l/1.6, 60], [this.l/1.75, 20], [this.l/1.25, 60]]];
    }

    draw(ctx) {
        if (this.anseq > 0) {
            if (this.anseq > this.pts.length) {
                if (input[4] === true) {
                    this.anseq = -1;
                } else {
                    this.anseq = 0;
                }
            } else {
                ctx.fillStyle = this.color;

                ctx.beginPath();
                ctx.moveTo(render("x", this.x, this.pts[this.anseq-1][0][0], this.pts[this.anseq-1][0][1] - 90*this.dir), render("y", this.y, this.pts[this.anseq-1][0][0], this.pts[this.anseq-1][0][1] - 90*this.dir));
                for (let i = 1; i < this.pts[this.anseq-1].length; i++) {
                    ctx.lineTo(render("x", this.x, this.pts[this.anseq-1][i][0], this.pts[this.anseq-1][i][1] - 90*this.dir), render("y", this.y, this.pts[this.anseq-1][i][0], this.pts[this.anseq-1][i][1] - 90*this.dir));
                }
                ctx.lineTo(render("x", this.x, this.pts[this.anseq-1][0][0], this.pts[this.anseq-1][0][1] - 90*this.dir), render("y", this.y, this.pts[this.anseq-1][0][0], this.pts[this.anseq-1][0][1] - 90*this.dir));
                ctx.fill();
                ctx.closePath();
                this.anseq += 1;
            }
        }
    }
}

class Enemy {
    constructor(x, y, type, size, ar) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.ddy = 0;
        this.type = type;
        this.s = size;
        this.a = 0;
        this.dir = 0;
        this.agr = false;
        this.color = "white";
        this.anseq = 0;
        if (this.type === "cr") {
            this.cycle = 0.1;
        } else {
            this.cycle = 1;
        }
        this.mv = [0, 0, 0, 0];
        this.inv = 15;
        this.hit = [false, 0];
        this.hp = 12 + Math.pow(2*ar, 2);
        if (this.type === "fl") {
            this.pts = [[[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/0.7, 95], [this.s/0.6, 50], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/0.75, 95], [this.s/0.6, 45], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/0.82, 97], [this.s/0.6, 40], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/0.9, 100], [this.s/0.7, 35], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s, 105], [this.s/0.8, 28], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.1, 113], [this.s/0.8, 26], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.2, 120], [this.s/0.8, 24], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.45, 125], [this.s/0.85, 22], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.7, 130], [this.s/0.9, 20], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.7, 140], [this.s/0.9, 15], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.7, 150], [this.s/0.9, 10], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.65, 155], [this.s/0.95, 5], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.6, 160], [this.s, 0], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.55, 170], [this.s, 353], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]],
                        [[this.s, 160], [this.s, 200], [this.s/2.3, 235], [this.s/2.3, 125], [this.s/1.5, 60], [this.s/1.5, 180], [this.s, 345], [this.s/1.5, 60], [this.s, 30], [this.s, 0], [this.s/1.7, 345], [this.s/3.7, 180], [this.s/2.3, 125]]];
        } else if (this.type === "cr") {
            this.pts = [[[this.s, 330], [this.s/3, 90], [this.s, 210]],
                        [[this.s*1.45, 340], [this.s/7, 90], [this.s*1.45, 200]]];
        } else if (this.type === "sh") {
            this.pts = [[[this.s, 120], [2*this.s/3, 139], [9*this.s/11, 147], [5*this.s/6, 180], [9*this.s/10, 220], [this.s/1.65, 250], [6*this.s/13, 115], [9*this.s/11, 147], [5*this.s/6, 180], [9*this.s/10, 220], [13.8*this.s/18, 229], [this.s, 240], [this.s, 300], [this.s, 60]]];
        }
    }

    draw(ctx) {
        if (this.anseq >= this.pts.length || this.anseq < 0) {
            this.cycle = -this.cycle;
            this.anseq += this.cycle;
        }
        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(render("x", this.x, this.pts[Math.floor(this.anseq)][0][0], this.pts[Math.floor(this.anseq)][0][1] - this.dir), render("y", this.y, this.pts[Math.floor(this.anseq)][0][0], this.pts[Math.floor(this.anseq)][0][1] - this.dir));
        for (let i = 1; i < this.pts[Math.floor(this.anseq)].length; i++) {
            ctx.lineTo(render("x", this.x, this.pts[Math.floor(this.anseq)][i][0], this.pts[Math.floor(this.anseq)][i][1] - this.dir), render("y", this.y, this.pts[Math.floor(this.anseq)][i][0], this.pts[Math.floor(this.anseq)][i][1] - this.dir));
        }
        ctx.lineTo(render("x", this.x, this.pts[Math.floor(this.anseq)][0][0], this.pts[Math.floor(this.anseq)][0][1] - this.dir), render("y", this.y, this.pts[Math.floor(this.anseq)][0][0], this.pts[Math.floor(this.anseq)][0][1] - this.dir));
        if (this.inv < 15) {
            ctx.strokeStyle = "red";
        }
        ctx.stroke();
        ctx.closePath();
        this.anseq += this.cycle;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.ddy;


        if (this.inv <= 0) {
            this.inv = 15;
        }
        if (this.inv < 15) {
            this.inv -= 1;
        }

        if (this.type === "cr") {
            if (this.x < this.mv[0]) {
                this.x = this.mv[0];
                this.dx = 0;
                this.dy = Math.sign(this.mv[2]-this.mv[3])*2*U;
                this.dir = 270;
            }
            if (this.x > this.mv[1]) {
                this.x = this.mv[1];
                this.dx = 0;
                this.dy = Math.sign(this.mv[3]-this.mv[2])*2*U;
                this.dir = 90;
            }
            if (this.y < this.mv[2]) {
                this.y = this.mv[2];
                this.dy = 0;
                this.dx = Math.sign(this.mv[1]-this.mv[0])*2*U;
                this.dir = 0;
            }
            if (this.y > this.mv[3]) {
                this.y = this.mv[3];
                this.dy = 0;
                this.dx = Math.sign(this.mv[0]-this.mv[1])*2*U;
                this.dir = 180;
            }
        } else if (this.type === "sh") {
            if (this.x < this.mv[0]) {
                this.dx = U;
            }
            if (this.x > this.mv[1]) {
                this.dx = -U;
            }
        }
    }
}

class Triangle {
    constructor (x, y, side, color) {
        this.x = x;
        this.y = y;
        this.s = side;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.x - this.s/2, this.y - this.s/2);
        ctx.lineTo(this.x + this.s/2, this.y - this.s/2);
        ctx.lineTo(this.x, this.y + this.s/2);
        ctx.fill();
        ctx.closePath();
    }
}





function rmp_open() {
    ctrldef.style.display = "none";
    ctrlmap.style.display = "inline";
}

function rmp_conf() {
    for (let i = 0; i < ctrls.length; i++) {
        keys[i] = ctrls[i].value;
    }
    ctrlmap.style.display = "none";
    ctrldef.style.display = "inline";
}

function hyp(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function hflip(dx, pts) {
    result = [[]];
    if ((dx < 0 && (pts[0][1] < 90 || pts[0][1] > 270)) || (pts[0][1] > 90 && pts[0][1] < 270 && dx > 0)) {
        for (let i = 0; i < pts.length; i++) {
            result.push([pts[i][0], 180 - pts[i][1]]);
            while (result[i][1] < 0) {
                result[i][1] += 360;
            }
            while (result[i][1] > 360) {
                result[i][1] -= 360;
            }
        }
        result.shift();
        return result;
    } else {
        return pts;
    }
}

function collide(x1, y1, x2, y2) {
    xcol = Math.sign(x2 - x1);
    ycol = Math.sign(y2 - y1);
    return [xcol, ycol];
}

function key_down(pressed) {
    if (pressed.key === keys[0] || pressed.key === keys[1]) {
        input[0] = true;
    }
    if (pressed.key === keys[2] || pressed.key === keys[3]) {
        input[1] = true;
    }
    if (pressed.key === keys[4] || pressed.key === keys[5]) {
        input[2] = true;
    }
    if (pressed.key === keys[6] || pressed.key === keys[7]) {
        input[3] = true;
    }
    if (pressed.key === keys[8]) {
        input[4] = true;
        
    }
    if (pressed.key === keys[9]) {
        input[5] = true;
    }
}

function key_up(pressed) {
    if (pressed.key === keys[0] || pressed.key === keys[1]) {
        input[0] = false;
    }
    if (pressed.key === keys[2] || pressed.key === keys[3]) {
        input[1] = false;
    }
    if (pressed.key === keys[4] || pressed.key === keys[5]) {
        input[2] = false;
    }
    if (pressed.key === keys[6] || pressed.key === keys[7]) {
        input[3] = false;
    }
    if (pressed.key === keys[8]) {
        input[4] = false;
        if (psword.anseq < 0) {
            psword.anseq = 0;
        }
        if (going === false) {
            start_over();
        }
    }
    if (pressed.key === keys[9]) {
        input[5] = false;
        jump = false;
    }
}

function returnRad(a) {
    return (a*Math.PI/180);
}

function returnDeg(a) {
    return (a*180/Math.PI);
}

function render(axis, pos, rad, angle) {
    if (axis === "x") {
        return(pos + rad*Math.cos(returnRad(angle)));
    }
    if (axis === "y") {
        return(pos - rad*Math.sin(returnRad(angle)));
    }
}

function gen_doors(tp, rt, bm, lf) {

    doors = [tp, rt, bm, lf];

    if (tp === true) {
        walls[0] = [new Ground(LOW/15, LOW/15, 5.5*LOW/15, 0, MAP_COL[area], "b"),
        new Ground(6.5*LOW/15, 0, 0, LOW/15, MAP_COL[area], "r"),
        new Ground(8.5*LOW/15, 0, 0, LOW/15, MAP_COL[area], "l"),
        new Ground(8.5*LOW/15, LOW/15, 5.5*LOW/15, 0, MAP_COL[area], "b")];
    } else {
        walls[0] = [new Ground(LOW/15, LOW/15, 13*LOW/15, 0, MAP_COL[area], "b")];
    }

    if (rt === true) {
        walls[1] = [new Ground(14*LOW/15, LOW/15, 0, 5.5*LOW/15, MAP_COL[area], "l"),
        new Ground(14*LOW/15, 6.5*LOW/15, LOW/15, 0, MAP_COL[area], "b"),
        new Ground(14*LOW/15, 8.5*LOW/15, LOW/15, 0, MAP_COL[area], "n"),
        new Ground(14*LOW/15, 8.5*LOW/15, 0, 5.5*LOW/15, MAP_COL[area], "l")];
    } else {
        walls[1] = [new Ground(14*LOW/15, LOW/15, 0, 13*LOW/15, MAP_COL[area], "l")];
    }

    if (bm === true) {
        walls[2] = [new Ground(LOW/15, 14*LOW/15, 5.5*LOW/15, 0, MAP_COL[area], "n"),
        new Ground(6.5*LOW/15, 14*LOW/15, 0, LOW/15, MAP_COL[area], "r"),
        new Ground(8.5*LOW/15, 14*LOW/15, 0, LOW/15, MAP_COL[area], "l"),
        new Ground(8.5*LOW/15, 14*LOW/15, 5.5*LOW/15, 0, MAP_COL[area], "n")];
    } else {
        walls[2] = [new Ground(LOW/15, 14*LOW/15, 13*LOW/15, 0, MAP_COL[area], "n")];
    }

    if (lf === true) {
        walls[3] = [new Ground(LOW/15, LOW/15, 0, 5.5*LOW/15, MAP_COL[area], "r"),
        new Ground(0, 6.5*LOW/15, LOW/15, 0, MAP_COL[area], "b"),
        new Ground(0, 8.5*LOW/15, LOW/15, 0, MAP_COL[area], "n"),
        new Ground(LOW/15, 8.5*LOW/15, 0, 5.5*LOW/15, MAP_COL[area], "r")];
    } else {
        walls[3] = [new Ground(LOW/15, LOW/15, 0, 13*LOW/15, MAP_COL[area], "r")];
    }

    for (let i = 0; i < walls.length; i++) {
        for (let k = 0; k < walls[i].length; k++) {
            terrain.unshift(walls[i][k]);
        }
    }
}

// s is the area number
function gen_map(s) {
    let rooms = 10 + s*5;
    map[s].unshift(new Room(0, Math.round(Math.random()*5), [false, true, false, true], [new Ground(75*U, 2*LOW/3, 750*U, U*50, MAP_COL[s], "n")], "#ff9900"));
    map[s][0].vis = true;
    map[s].unshift(new Room(1, map[s][0].my, [false, false, false, true], [], MAP_COL[s]));

    let check = false;
    while (map[s].length <= rooms) {
        let rnum = Math.floor(Math.random()*4);
        while (rnum === 3 && map[s][0].mx <= 0) {
            rnum = Math.floor(Math.random()*4);
        }
        check = false;
        map[s].unshift(new Room(map[s][0].mx, map[s][0].my, [false, false, false, false], [], MAP_COL[s]));
        for (let i = map[s].length-1; i > 0; i--) {
            if (rnum === 0 && (map[s][i].my === map[s][0].my-1 && map[s][i].mx === map[s][0].mx)) {
                check = true;
            } else if (rnum === 2 && (map[s][i].my === map[s][0].my+1 && map[s][i].mx === map[s][0].mx)) {
                check = true;
            } else if (rnum === 1 && (map[s][i].mx === map[s][0].mx+1 && map[s][i].my === map[s][0].my)) {
                check = true;
            } else if (rnum === 3 && (map[s][i].mx === map[s][0].mx-1 && map[s][i].my === map[s][0].my)) {
                check = true;
            }
        }

        if (check === false) {
            if (rnum === 0) {
                map[s][0].my -= 1;
                map[s][0].d[2] = true;
                map[s][1].d[0] = true;
            } else if (rnum === 2) {
                map[s][0].my += 1;
                map[s][0].d[0] = true;
                map[s][1].d[2] = true;
            } else if (rnum === 1) {
                map[s][0].mx += 1;
                map[s][0].d[3] = true;
                map[s][1].d[1] = true;
            } else if (rnum === 3) {
                map[s][0].mx -= 1;
                map[s][0].d[1] = true;
                map[s][1].d[3] = true;
            }
        } else {
            map[s].shift();
        }

        let adj = 0;

        for (let i = map[s].length-1; i > 0; i--) {
            if ((map[s][i].my === map[s][0].my-1 && map[s][i].mx === map[s][0].mx) || (map[s][i].my === map[s][0].my+1 && map[s][i].mx === map[s][0].mx) || (map[s][i].mx === map[s][0].mx+1 && map[s][i].my === map[s][0].my) || (map[s][i].mx === map[s][0].mx-1 && map[s][i].my === map[s][0].my)) {
                adj += 1;
                if (Math.random()*6 < 1) {
                    if (map[s][i].my === map[s][0].my-1 && map[s][i].mx === map[s][0].mx) {
                        map[s][i].d[2] = true;
                        map[s][0].d[0] = true;
                    }
                    if (map[s][i].my === map[s][0].my+1 && map[s][i].mx === map[s][0].mx) {
                        map[s][i].d[0] = true;
                        map[s][0].d[2] = true;
                    }
                    if (map[s][i].mx === map[s][0].mx+1 && map[s][i].my === map[s][0].my) {
                        map[s][i].d[3] = true;
                        map[s][0].d[1] = true;
                    }
                    if (map[s][i].mx === map[s][0].mx-1 && map[s][i].my === map[s][0].my) {
                        map[s][i].d[1] = true;
                        map[s][0].d[3] = true;
                    }
                }
            }
        }
        if (map[s][0].mx <= 0) {
            adj += 1;
        }

        if (adj >= 4) {
            for (let i = 1; i < map[s].length; i++) {
                check = false;
                for (let k = 0; k < map[s].length; k++) {
                    if (k != i && (map[s][k].mx === map[s][i].mx+2 || map[s][k].mx === map[s][i].mx+1) && map[s][k].my === map[s][i].my) {
                        check = true;
                    }
                }
                if (check === false) {
                    map[s][i].d[1] = true;
                    map[s].unshift(new Room(map[s][i].mx+1, map[s][i].my, [false, false, false, true], [], MAP_COL[s]));
                    break;
                }
            }
        }
    }

    for (let i = map[s].length-1; i > 0; i--) {
        if (map[s][i].mx === map[s][0].mx+1 && map[s][i].my === map[s][0].my) {
            check = true;
        }
    }

    if (check === false) {
        map[s][0].d[1] = true;
        map[s][0].conf = [];
    } else {
        for (let i = 1; i < map[s].length; i++) {
            check = false;
            for (let k = 0; k < map[s].length; k++) {
                if (k != i && (map[s][k].mx === map[s][i].mx+2 || map[s][k].mx === map[s][i].mx+1) && map[s][k].my === map[s][i].my) {
                    check = true;
                }
            }
            if (check === false) {
                map[s][i].d[1] = true;
                map[s].unshift(new Room(map[s][i].mx+1, map[s][i].my, [false, true, false, true], [], MAP_COL[s]));
                break;
            }
        }
    }

    for (let i = 1; i < map[s].length-1; i++) {
        map[s][i].conf = gen_terr(s, i);
    }
    map[s][0].conf.push(new Ground(2*LOW/3 - 60*U, 2*LOW/3, LOW/3, 0, MAP_COL[s], "t"), new Ground(5*LOW/6, 29*LOW/36, LOW/6 - 60*U, 0, MAP_COL[s], "t"));
    if (map[s][0].d[0] === true) {
        map[s][0].conf.push(new Ground(2*LOW/3, 23*LOW/48, LOW/6, 0, MAP_COL[s], "t"), new Ground(LOW/3, LOW/3, 2*LOW/3 - 60*U, 0, MAP_COL[s], "t"), new Ground(5*LOW/12, LOW/6, LOW/6, 0, MAP_COL[s], "t"));
    }
    if (map[s][0].d[3] === true) {
        map[s][0].conf.push(new Ground(60*U, 2*LOW/3, LOW/3, 0, MAP_COL[s], "t"), new Ground(60*U, 29*LOW/36, LOW/6 - 60*U, 0, MAP_COL[s], "t"));
    }


    while (true) {
        check = false;
        for (let i = 0; i < map[s].length; i++) {
            if (map[s][i].my > 4) {
                check = true;
            }
        }
        if (check === true) {
            for (let i = 0; i < map[s].length; i++) {
                map[s][i].my -= 1;
            }
        } else {
            break;
        }
    }
    while (true) {
        check = false;
        for (let i = 0; i < map[s].length; i++) {
            if (map[s][i].my === 4) {
                check = true;
            }
        }
        if (check === false) {
            for (let i = 0; i < map[s].length; i++) {
                map[s][i].my += 1;
            }
        } else {
            break;
        }
    }

    while (true) {
        check = false;
        for (let i = 0; i < map[s].length; i++) {
            if (map[s][i].mx > 4) {
                check = true;
            }
        }
        if (check === true) {
            for (let i = 0; i < map[s].length; i++) {
                map[s][i].mx -= 1;
            }
        } else {
            break;
        }
    }
    while (true) {
        check = false;
        for (let i = 0; i < map[s].length; i++) {
            if (map[s][i].mx === 4) {
                check = true;
            }
        }
        if (check === false) {
            for (let i = 0; i < map[s].length; i++) {
                map[s][i].mx += 1;
            }
        } else {
            break;
        }
    }
}

function gen_terr(ar, rm) {

    let array = [];
    do {
        map[ar][rm].en = [];
        array = [];
        for (let i = 0; i < 6; i++) {
            for (let k = 0; k < 6; k++) {
                if (Math.random()*3 < 1 && (i != 2 || (k != 0 && k != 5))) {
                    array.push(new Ground(U*(70 + 130*k + Math.random()*10), U*(160 + 120*i), U*(100 - Math.random()*10), U*30, MAP_COL[ar], "n"));
                }
                if (Math.random()*(15 - ar*2) < 1) {
                    map[ar][rm].en.push(new Enemy(U*(130 + 130*k), U*(120 + 120*i), "fl", U*(15 + 10*Math.random()), ar));
                }
            }
        }
    } while (check_terr(ar, rm, array) === true);

    for (let i = 0; i < array.length; i++) {
        if (Math.random()*(12 - ar*2) < 1) {
            let crawler_s = U*(10 + 10*Math.random());
            map[ar][rm].en.push(new Enemy(0, 0, "cr", crawler_s, ar));
            let x1 = array[i].x - crawler_s/2;
            let x2 = array[i].x + array[i].w + crawler_s/2;
            let y1 = array[i].y - crawler_s/2;
            let y2 = array[i].y + array[i].h + crawler_s/2;
            let final = map[ar][rm].en.length - 1;

            map[ar][rm].en[final].mv = [x1, x2, y1, y2];

            map[ar][rm].en[final].x = array[i].x + Math.random()*(array[i].w);
            map[ar][rm].en[final].y = y1;
        } else if (Math.random()*(10 - ar*2) < 1 && ar > 1) {
            map[ar][rm].en.push(new Enemy(LOW/2, LOW/2, "sh", U*20, ar));
            let x1 = array[i].x + U*10;
            let x2 = array[i].x + array[i].w - U*10;
            let final = map[ar][rm].en.length - 1;

            map[ar][rm].en[final].mv = [x1, x2];
            map[ar][rm].en[final].x = array[i].x + Math.random()*(array[i].w);
            map[ar][rm].en[final].y = array[i].y - U*20/0.95;
        }
    }

    if (map[ar][rm].d[2] === false && (array[array.length-1].y < U*760 || Math.random()*5 < 1)) {
        map[ar][rm].sp = true;
    }

    return array;

}

function check_terr(ar, rm, array) {
    let check = true;
    let groups = [];
    let d_acc = [false, false, false, false];
    let count = 1;
    for (let i = 0; i < array.length; i++) {
        groups.push(0);
    }
    for (let i = 0; i < array.length; i++) {
        let origin = array[i];
        check = true;
        for (let k = 0; k < array.length; k++) {
            if (k != i) {
                let checked = array[k];
                if (Math.abs(origin.x - checked.x) < U*320 && Math.abs(origin.y - checked.y) < U*130 && (origin.y > U*160 || checked.y > U*160 || Math.abs(origin.x - checked.x) < U*100)) {
                    check = false;
                    if (groups[i] === 0) {
                        if (groups[k] === 0) {
                            groups[k] = count;
                            count += 1;
                        }
                        groups[i] = groups[k];
                    } else if (groups[k] === 0) {
                        groups[k] = groups[i];
                    } else {
                        if (groups[i] < groups[k]) {
                            for (let j = 0; j < array.length; j++) {
                                if (j != k && groups[j] === groups[k]) {
                                    groups[j] = groups[i];
                                }
                            }
                            groups[k] = groups[i];
                        } else {
                            for (let j = 0; j < array.length; j++) {
                                if (j != i && groups[j] === groups[i]) {
                                    groups[j] = groups[k];
                                }
                            }
                            groups[i] = groups[k];
                        }
                    }


                    if (map[ar][rm].d[0] === true && (origin.x <= 9*LOW/15 && origin.x >= 5*LOW/15) && origin.y === U*160) {
                        d_acc[0] = true;
                    }
                    if (map[ar][rm].d[1] === true && ((origin.x >= 9*LOW/15 && origin.y === U*640) || (origin.x >= 11*LOW/15 && origin.y === U*520))) {
                        d_acc[1] = true;
                    }
                    if (map[ar][rm].d[2] === true && origin.y === U*760) {
                        d_acc[2] = true;
                    }
                    if (map[ar][rm].d[3] === true && (origin.y === U*640 && origin.x <= 4*LOW/15) || (origin.x <= 2*LOW/15 && origin.y === U*520)) {
                        d_acc[3] = true;
                    }


                }
            }
        }
        if (check === true) {
            break;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (map[ar][rm].d[i] === true && d_acc[i] === false) {
            check = true;
        }
    }

    if (check === false) {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i] != 1) {
                check = true;
            }
        }
    }

    return check;

}

function damage(s, d, k) {
    if (p1.inv === 80) {
        for (let i = 0; i < d; i++) {
            if (curhealth > 0) {
                curhealth -= 1;
            }
        }
    }

    if (hearts.length > 0) {
        if (s === "sp" && hearts.length > 0) {
            p1.x = grounded[0];
            p1.y = grounded[1];
            p1.dy = 0;
        } else if (s === "en" && p1.inv === 80) {
            p1.dx = -30*U*Math.cos(plebs[k].a);
            p1.dy = -10*U*Math.sin(plebs[k].a);
            if (plebs[k].type != "cr") {
                plebs[k].dx = 5*U*Math.cos(plebs[k].a);
                plebs[k].dy = 5*U*Math.sin(plebs[k].a);
            }
        }
        p1.inv -= 1;
    }
}

function game_over() {
    going = false;
}

function loadzone() {

    det = [0, 0];

    if (area === 3 && room === 0 && p1.x > LOW/2) {
        game_over();
    } else {

        map[area][room].color = MAP_COL[area];

        if (p1.x < 0) {
            det[0] = -1;
            det[1] = 0;
        }
        if (p1.x > LOW) {
            det[0] = 1;
            det[1] = 0;
        }
        if (p1.y < LOW/30) {
            det[0] = 0;
            det[1] = -1;
            if (p1.dy > -12*U) {
                p1.dy = -12*U;
            }
        }
        if (p1.y > LOW) {
            det[0] = 0;
            det[1] = 1;
            if (p1.dy > 5*U) {
                p1.dy = 5*U;
            }
        }

        if (p1.x <= 7*LOW/15 || p1.x >= 8*LOW/15) {
            p1.x = (LOW/2) * (1 - det[0]) + LOW*(det[0])/30;
        }
        if (p1.y <= 6.5*LOW/15 || p1.y >= 8.5*LOW/15) {
            p1.y = (LOW/2) * (1 - det[1]) + LOW*(det[1])/30;
        }

        grounded = [p1.x, p1.y];

        for (let count = 0; count < map[area].length; count++) {
            if (room + count < map[area].length && map[area][room + count].mx === map[area][room].mx + det[0] && map[area][room + count].my === map[area][room].my + det[1]) {
                room = room + count;
                terrain = [];
                gen_doors(map[area][room].d[0], map[area][room].d[1], map[area][room].d[2], map[area][room].d[3]);
                for (let i = 0; i < map[area][room].conf.length; i++) {
                    terrain.push(map[area][room].conf[i]);
                }
                break;
            } else if (room - count >= 0 && map[area][room - count].mx === map[area][room].mx + det[0] && map[area][room - count].my === map[area][room].my + det[1]) {
                room = room - count;
                terrain = [];
                gen_doors(map[area][room].d[0], map[area][room].d[1], map[area][room].d[2], map[area][room].d[3]);
                for (let i = 0; i < map[area][room].conf.length; i++) {
                    terrain.push(map[area][room].conf[i]);
                }
                break;
            } else if (room === 0 && det[0] === 1) {
                area += 1;
                if (map[area].length === 0) {
                    gen_map(area);
                }
                room = map[area].length - 1;
                terrain = [];
                gen_doors(map[area][room].d[0], map[area][room].d[1], map[area][room].d[2], map[area][room].d[3]);
                for (let i = 0; i < map[area][room].conf.length; i++) {
                    terrain.push(map[area][room].conf[i]);
                }
                break;
            } else if (room === map[area].length - 1 && det[0] === -1) {
                area -= 1;
                room = 0;
                terrain = [];
                gen_doors(map[area][room].d[0], map[area][room].d[1], map[area][room].d[2], map[area][room].d[3]);
                for (let i = 0; i < map[area][room].conf.length; i++) {
                    terrain.push(map[area][room].conf[i]);
                }
                break;
            }
        }

        map[area][room].color = "#ff9900";
        map[area][room].vis = true;


        if (map[area][room].sp === true) {
            spikers = [new Spikes(LOW/15, 14*LOW/15, 13*LOW/15)];
        } else {
            spikers = [];
        }


        plebs = [];
        for (let i = 0; i < map[area][room].en.length; i++) {
            plebs.push(new Enemy(map[area][room].en[i].x, map[area][room].en[i].y, map[area][room].en[i].type, map[area][room].en[i].s, area));
            plebs[i].mv = map[area][room].en[i].mv;
            if (plebs[i].type === "cr") {
                plebs[i].dx = 2*U;
            } else if (plebs[i].type === "sh") {
                plebs[i].dx = U*Math.sign(Math.random() - 0.5);
            }
            plebs[i].anseq = Math.floor(Math.random()*plebs[i].pts.length);
        }
        for (let i = 0; i < plebs.length; i++) {
            if (area < 2 && plebs[i].type === "fl" && hyp(p1.x - plebs[i].x, p1.y - plebs[i].y) < LOW/3) {
                plebs.splice(i, 1);
                i -= 1;
            }
        }

        drops_h = [];
        drops_uh = [];
        drops_ud = [];


    }
}

function animate() {
    if (going === true) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let borne = true;

        if (pogo[0] === true) {
            if (pogo[1] === 0) {
                if (p1.dy > 0) {
                    p1.dy = 0;
                }
                p1.dy -= 10*U;
                pogo[1] = 1;
            } else {
                pogo[1] += 1;
            }
        }
        if (pogo[1] === 7) {
            pogo[0] = false;
            pogo[1] = 0;
        }

        p1.update();

        for (let i = 0; i < terrain.length; i++) {
            terrain[i].draw(ctx);
        }

        for (let i = 0; i < terrain.length; i++) {
            
            if (p1.y > terrain[i].y && p1.y < terrain[i].y + terrain[i].h) {
                if (p1.x + 10*U >= terrain[i].x && p1.x < terrain[i].x + p1.dx && (input[1] === true || p1.dx > 0) && (terrain[i].plat === "n" || terrain[i].plat === "l")) {
                    p1.x = terrain[i].x - 10*U;
                    p1.dx = 0;
                } else if (p1.x > terrain[i].x + terrain[i].w + p1.dx && p1.x - 10*U <= terrain[i].x + terrain[i].w && (input[3] === true || p1.dx < 0) && (terrain[i].plat === "n" || terrain[i].plat === "r")) {
                    p1.x = terrain[i].x + terrain[i].w + 10*U;
                    p1.dx = 0;
                }
            }
            if (p1.x + 10*U > terrain[i].x && p1.x - 10*U < terrain[i].x + terrain[i].w) {
                if (p1.y + 15*U > terrain[i].y && p1.y - p1.dy < terrain[i].y && (terrain[i].plat === "n" || (terrain[i].plat === "t" && input[2] === false))) {
                    p1.y = terrain[i].y - 15*U;
                    p1.dy = 0;
                    borne = false;
                } else if (p1.y - 15*U < terrain[i].y + terrain[i].h && p1.y - p1.dy > terrain[i].y + terrain[i].h && (terrain[i].plat === "n" || terrain[i].plat === "b")) {
                    p1.y = terrain[i].y + terrain[i].h + 15*U;
                    p1.dy = 0;
                }
            }
        }

        for (let i = 0; i < spikers.length; i++) {
            if (p1.x > spikers[i].x - 10*U && p1.x < spikers[i].x + spikers[i].l + 10*U && p1.y > spikers[i].y - 22*U && p1.y < spikers[i].y) {
                damage("sp", 1, -1);
            }
        }

        if (borne === true) {
            if (input[5] === true) {
                p1.air = 1;
            } else {
                p1.air = 2;
            }
        } else {
            if (input[5] === true) {
                if (jump === false) {
                    p1.dy = -12*U;
                    jump = true;
                }
                p1.air = 1;
            } else {
                p1.air = 0;
            }
        }


        if (p1.air === 0) {
            grounded = [p1.x, p1.y];
        }


        psword.x = p1.x;
        psword.y = p1.y;


        if (psword.anseq === 0) {
            if (input[3] === true) {
                psword.dir = 3;
            }
            if (input[1] === true) {
                psword.dir = 1;
            }
            if (input[0] === true) {
                psword.dir = 0;
            }
            if (input[2] === true) {
                psword.dir = 2;
            }
        }


        if (input[4] === true && psword.anseq === 0) {
            psword.anseq = 1;
        }


        for (let i = 0; i < spikers.length; i++) {
            spikers[i].draw(ctx);
        }


        if (p1.x < 0 || p1.x > LOW || p1.y < LOW/30 || p1.y > LOW) {
            loadzone();
        }


        p1.draw(ctx);


        for (let k = 0; k < plebs.length; k++) {
            plebs[k].a = Math.atan2((plebs[k].y - p1.y), (plebs[k].x - p1.x));

            if (plebs[k].type === "fl") {
                if (hyp(plebs[k].x - p1.x, plebs[k].y - p1.y) < LOW/3 || plebs[k].agr === true) {
                    if (hyp(plebs[k].dx, plebs[k].dy) <= 5*U) {
                        plebs[k].dx -= 0.2*U*Math.cos(plebs[k].a);
                        plebs[k].dy -= 0.2*U*Math.sin(plebs[k].a);
                    }
                    if (hyp(plebs[k].dx, plebs[k].dy) > 5*U) {
                        plebs[k].dx = -5*U*Math.cos(plebs[k].a);
                        plebs[k].dy = -5*U*Math.sin(plebs[k].a);
                    }

                    plebs[k].agr = true;
                }
            }

            if (plebs[k].type != "cr") {
                for (let j = 0; j < plebs[k].pts.length; j++) {
                    plebs[k].pts[j] = hflip(plebs[k].dx, plebs[k].pts[j]);
                }
            }

            plebs[k].update();

            let pleb_hit = [0, 0, 0, 0];

            if (plebs[k].type === "fl") {
                pleb_hit = [plebs[k].s/1.5, plebs[k].s*0.9, plebs[k].s/3, plebs[k].s*0.8];
            } else if (plebs[k].type === "cr") {
                pleb_hit = [plebs[k].s/4, plebs[k].s*0.8, plebs[k].s/2, plebs[k].s*0.8];
            } else if (plebs[k].type === "sh") {
                pleb_hit = [plebs[k].s*0.9, plebs[k].s/2, plebs[k].s*0.9, plebs[k].s/2];
            }

            if (psword.anseq > 1 && psword.anseq < 7) {
                if (psword.dir === 0 && (plebs[k].x > psword.x - psword.l/2 && plebs[k].x < psword.x + psword.l/2) && (plebs[k].y - pleb_hit[0] < psword.y + 15*U && plebs[k].y + pleb_hit[2] > psword.y - psword.l)) {
                    if (plebs[k].type === "fl") {
                        if (plebs[k].dy > 0) {
                            plebs[k].dy = 0;
                        }
                        plebs[k].y -= 30*U;
                    }
                    if (plebs[k].inv === 15) {
                        plebs[k].hp -= p_dmg;
                        plebs[k].inv -= 1;
                    }
                }
                if (psword.dir === 1 && (plebs[k].y > psword.y - psword.l/2 && plebs[k].y < psword.y + psword.l/2) && (plebs[k].x + pleb_hit[1] > psword.x - 10*U && plebs[k].x - pleb_hit[3] < psword.x + psword.l)) {
                    if (plebs[k].type === "fl") {
                        if (plebs[k].dx < 0) {
                            plebs[k].dx = 0;
                        }
                        plebs[k].x += 30*U;
                    }
                    if (plebs[k].inv === 15) {
                        if (plebs[k].type != "sh" || plebs[k].dx > 0) {
                            plebs[k].hp -= p_dmg;
                            plebs[k].inv -= 1;
                        } else {
                            plebs[k].x += 3*U;
                        }
                    }
                }
                if (psword.dir === 2 && (plebs[k].x > psword.x - psword.l/2 && plebs[k].x < psword.x + psword.l/2) && (plebs[k].y + pleb_hit[2] > psword.y - 15*U && plebs[k].y - pleb_hit[0] < psword.y + psword.l)) {
                    if (borne === false) {
                        p1.y -= 10*U;
                    } else if (plebs[k].type === "fl") {
                        if (plebs[k].dy < 0) {
                            plebs[k].dy = 0;
                        }
                        plebs[k].y += 20*U;
                    }
                    pogo[0] = true;
                    if (plebs[k].inv === 15) {
                        plebs[k].hp -= p_dmg;
                        plebs[k].inv -= 1;
                    }
                }
                if (psword.dir === 2) {
                    for (let i = 0; i < spikers.length; i++) {
                        if (psword.x + psword.l/2 > spikers[i].x && psword.x - psword.l/2 < spikers[i].x + spikers[i].l && psword.y <= spikers[i].y && psword.y + psword.l >= spikers[i].y) {
                            pogo[0] = true;
                        }
                    }
                }
                if (psword.dir === 3 && (plebs[k].y > psword.y - psword.l/2 && plebs[k].y < psword.y + psword.l/2) && (plebs[k].x - pleb_hit[3] < psword.x + 10*U && plebs[k].x + pleb_hit[1] > psword.x - psword.l)) {
                    if (plebs[k].type === "fl") {
                        if (plebs[k].dx > 0) {
                            plebs[k].dx = 0;
                        }
                        plebs[k].x -= 30*U;
                    }
                    if (plebs[k].inv === 15) {
                        if (plebs[k].type != "sh" || plebs[k].dx < 0) {
                            plebs[k].hp -= p_dmg;
                            plebs[k].inv -= 1;
                        } else {
                            plebs[k].x -= 3*U;
                        }
                    }
                }
            }

            if (plebs[k].hp <= 0) {
                if (curhealth < maxhealth && Math.random()*2.5 < 1) {
                    drops_h.push(new Heart(plebs[k].x, plebs[k].y, "red", 0.5));
                } else {
                    if (Math.random()*6 < 1) {
                        if (Math.random()*2 < 1 && maxhealth <= 18) {
                                drops_uh.push(new Heart(plebs[k].x, plebs[k].y, "yellow", 0.5));
                        } else {
                            drops_ud.push(new Triangle(plebs[k].x, plebs[k].y, 10*U, "yellow"));
                        }
                    }
                }
                plebs.splice(k, 1);
                break;
            }

            if (plebs[k].inv === 15 && ((plebs[k].y < p1.y && plebs[k].y + pleb_hit[2] > p1.y - 13*U) || (plebs[k].y > p1.y && plebs[k].y - pleb_hit[0] < p1.y + 13*U) || plebs[k].y === p1.y)) {
                if ((plebs[k].x < p1.x && plebs[k].x + pleb_hit[1] > p1.x - 13*U) || (plebs[k].x > p1.x && plebs[k].x - pleb_hit[3] < p1.x + 13*U) || plebs[k].x === p1.x) {
                    damage("en", 1, k);
                }
            }

            if (plebs[k].type != "cr") {
                for (let i = 0; i < terrain.length; i++) {
                    if (plebs[k].y > terrain[i].y && plebs[k].y < terrain[i].y + terrain[i].h) {
                        if (plebs[k].x + pleb_hit[1] >= terrain[i].x && plebs[k].x < terrain[i].x + plebs[k].dx && (terrain[i].plat === "n" || terrain[i].plat === "l")) {
                            plebs[k].x = terrain[i].x - pleb_hit[1];
                            plebs[k].dx = 0;
                        } else if (plebs[k].x > terrain[i].x + terrain[i].w + plebs[k].dx && plebs[k].x - pleb_hit[3] <= terrain[i].x + terrain[i].w && (terrain[i].plat === "n" || terrain[i].plat === "r")) {
                            plebs[k].x = terrain[i].x + terrain[i].w + pleb_hit[3];
                            plebs[k].dx = 0;
                        }
                    }
                    if (plebs[k].x + pleb_hit[1] > LOW) {
                        plebs[k].x = LOW - pleb_hit[1];
                    }
                    if (plebs[k].x - pleb_hit[3] < 0) {
                        plebs[k].x = pleb_hit[3];
                    }

                    if (plebs[k].x + 10*U > terrain[i].x && plebs[k].x - 10*U < terrain[i].x + terrain[i].w) {
                        if (plebs[k].y + pleb_hit[2] > terrain[i].y && plebs[k].y - plebs[k].dy < terrain[i].y && (terrain[i].plat === "n" || terrain[i].plat === "t")) {
                            plebs[k].y = terrain[i].y - pleb_hit[2];
                            plebs[k].dy = 0;
                            plebs[k].ddy = 0;
                        } else {
                            if (plebs[k].y - pleb_hit[0] < terrain[i].y + terrain[i].h && plebs[k].y - plebs[k].dy > terrain[i].y + terrain[i].h && (terrain[i].plat === "n" || terrain[i].plat === "b")) {
                                plebs[k].y = terrain[i].y + terrain[i].h + pleb_hit[0];
                                plebs[k].dy = 0;
                            }
                            if (plebs[k].type === "sh") {
                                plebs[k].ddy = 0.8*U;
                            }
                        }
                    }
                    if (plebs[k].y + pleb_hit[2] > LOW) {
                        plebs[k].y = LOW - pleb_hit[2];
                    }
                    if (plebs[k].y - pleb_hit[0] < 0) {
                        plebs[k].y = pleb_hit[0];
                    }
                }
            }

            if (plebs[k].x < 0) {
                plebs[k].x = 0;
            }
            if (plebs[k].y < 0) {
                plebs[k].y = 0;
            }
            if (plebs[k].x > LOW) {
                plebs[k].x = LOW;
            }
            if (plebs[k].y > LOW) {
                plebs[k].y = LOW;
            }

            for (let i = 0; i < plebs.length; i++) {
                let pleb2_hit = [0, 0, 0, 0];
                if (plebs[k].type === "fl") {
                    pleb2_hit = [plebs[i].s/1.5, plebs[i].s*0.9, plebs[i].s/3, plebs[i].s*0.8];
                }
                if (i != k) {
                    if (plebs[k].type === "fl") {
                        while (Math.abs(plebs[k].y - plebs[i].y) < Math.max(pleb_hit[0], pleb_hit[2]) && ((plebs[k].x - pleb_hit[3] < plebs[i].x + pleb2_hit[1] && plebs[k].x > plebs[i].x) || (plebs[k].x + pleb_hit[1] > plebs[i].x - pleb2_hit[3] && plebs[k].x < plebs[i].x))) {
                            if (plebs[k].x > plebs[i].x) {
                                plebs[k].x += U;
                            } else {
                                plebs[k].x -= U;
                            }
                        }
                    }
                }
            }

            plebs[k].draw(ctx);
        }

        psword.draw(ctx);

        for (let k = 0; k < map[area].length; k++) {
            if (map[area][k].vis === true) {
                map[area][k].draw(ctx);
            }
        }

        for (let k = 0; k < drops_h.length; k++) {
            drops_h[k].draw(ctx);
            if (drops_h[k].x + 10*U > p1.x - 10*U && drops_h[k].x - 10*U < p1.x + 10*U && drops_h[k].y + 10*U > p1.y - 15*U && drops_h[k].y - 10*U < p1.y + 15*U) {
                if (curhealth < maxhealth) {
                    hearts[curhealth].full = true;
                    curhealth += 1;
                }
                drops_h.splice(k, 1);
                break;
            }
        }
        for (let k = 0; k < drops_uh.length; k++) {
            drops_uh[k].draw(ctx);
            if (maxhealth <= 18 && drops_uh[k].x + 10*U > p1.x - 10*U && drops_uh[k].x - 10*U < p1.x + 10*U && drops_uh[k].y + 10*U > p1.y - 15*U && drops_uh[k].y - 10*U < p1.y + 15*U) {
                hearts.unshift(new Heart(40*U*(hearts.length + 0.5), LOW/30, "red", 1));
                while (hearts[0].x > 6*LOW/15) {
                    hearts[0].x -= U*400;
                    hearts[0].y += LOW/30;
                }
                maxhealth += 1;
                curhealth += 1;
                drops_uh.splice(k, 1);
                break;
            }
        }
        for (let k = 0; k < drops_ud.length; k++) {
            drops_ud[k].draw(ctx);
            if (drops_ud[k].x + 10*U > p1.x - 10*U && drops_ud[k].x - 10*U < p1.x + 10*U && drops_ud[k].y + 10*U > p1.y - 15*U && drops_ud[k].y - 10*U < p1.y + 15*U) {
                p_dmg += 1;
                atk.s += 2*U;
                drops_ud.splice(k, 1);
                break;
            }
        }

        for (let i = maxhealth-1; i >= 0; i--) {
            if (i >= maxhealth - curhealth) {
                hearts[i].full = true;
            } else {
                hearts[i].full = false;
            }
        }

        for (let k = 0; k < hearts.length; k++) {
            hearts[k].draw(ctx);
        }
        atk.draw(ctx);

        if (curhealth <= 0) {
            game_over();
        }

        requestAnimationFrame(animate);
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(LOW/4 - 3*U, 2*LOW/5 - 3*U, LOW/2 + 6*U, LOW/5 + 6*U);
        ctx.fillStyle = "black";
        ctx.fillRect(LOW/4, 2*LOW/5, LOW/2, LOW/5);

        goscreen1 = new Words(LOW/2, 5*LOW/11, "Game Over!", "white");
        if (area === 3 && room === 0) {
            goscreen1.t = "You have beaten the game!";
        }
        goscreen2 = new Words(LOW/2, 6*LOW/11, "Press " + keys[8].toUpperCase() + " to play again", "white");
        goscreen1.draw(ctx);
        goscreen2.draw(ctx);
    }
}

function start_over() {
    
    p1.x = LOW/2;
    p1.y = LOW/2;
    p1.dx = 0;
    p1.dy = 0;
    p1.inv = 80;
    jump = false;
    input = [false, false, false, false, false];
    maxhealth = 3;
    curhealth = 3;
    hearts = [];
    for (let i = 0; i < maxhealth; i++) {
        hearts.unshift(new Heart(40*U*(i + 0.5), LOW/30, "red", 1));
    }
    grounded = [LOW/2, LOW/2];
    pogo = [false, 0];
    p_dmg = 5;
    atk.s = p_dmg*2*U;

    doors = [4, false, false, false, false];
    walls = [[], [], [], []];

    terrain = [];
    spikers = [];
    plebs = [];
    drops_h = [];
    drops_uh = [];
    drops_ud = [];

    map = [[], [], [], []];
    area = 0;

    gen_map(0);
    gen_doors(false, true, false, false);
    room = map[0].length - 1;
    map[area][room].d[3] = false;
    terrain.push(map[0][room].conf[0]);

    going = true;

    requestAnimationFrame(animate);

}





var p1 = new Player(LOW/2, LOW/2, "#ff9900");
var jump = false;
var input = [false, false, false, false, false];
var maxhealth = 3;
var curhealth = 3;
var hearts = [];
for (let i = 0; i < maxhealth; i++) {
    hearts.unshift(new Heart(40*U*(i + 0.5), LOW/30, "red", 1));
}
var grounded = [LOW/2, LOW/2];
var psword = new Sword(p1.x, p1.y, 50*U, "white");
var pogo = [false, 0];
var p_dmg = 5;
var atk = new Triangle(29*LOW/30, LOW/30, p_dmg*2*U, "#cc00ff");

// Top, Right, Bottom, Left
var doors = [4, false, false, false, false];
var walls = [[], [], [], []];

var terrain = [];
var spikers = [];
var plebs = [];
var drops_h = [];
var drops_uh = [];
var drops_ud = [];

var map = [[], [], [], []];
var area = 0;
var MAP_COL = ["#00ff00", "#aaaaaa", "red", "blue"];

gen_map(0);
gen_doors(false, true, false, false);
var room = map[0].length - 1;
map[area][room].d[3] = false;
terrain.push(map[0][room].conf[0]);

var going = true;

requestAnimationFrame(animate);