// welcome to this italian resturant cause all we got is spaghetti

let mainEL = document.querySelector("body");
let startBtn = mainEL.querySelector("#startbutton");
console.log(startBtn)

const WIDTH = mainEL.querySelector("#disp").clientWidth;
const HEIGHT = mainEL.querySelector("#disp").clientHeight;

console.log(WIDTH, HEIGHT);


let cxt = document.querySelector("#disp").getContext("2d"); //lager et canvas å tegne på



class GameObject{  //base game objuect klasse
    type = ""; //type navn
    x = 0; //x kordinatet spriten skal tegner til 
    y = 0; //y kordinatet spriten skal tegner til
    tx = 0; //x kordinatet till sentrum av objektet (true x)
    ty = 0; //y kordinatet till sentrum av objektet (true y)
    dead = false; //er objektet dødt?
    radius = 0; //hitboxens radius 
    sprite = null; //sprite objektet

    constructor(x,y,d,t){ //setter statistikk, x = tegne x, y = tegne y, d = diameter, t = type
        this.x = x;
        this.y = y;
        this.radius = d/2;
        this.tx = x + this.radius;
        this.ty = y + this.radius;
        this.type = t;
        
        this.sprite = new Sprite(t);//setter sprite av type, se lenger neded for definisjon
    }

    check_hit(obj){ //sjekker om objektet kolliderer med at annet objekt (obj) og returnerer bool
        if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) < obj.radius + this.radius){
            return true;
        } else {
            return false;
        }
        
    }

    draw(){ //tegner objektet
        this.sprite.draw(this.x,this.y);
    }
};

class Vector{ //egen vektor klasse for 2dimenjonal bevegelse
    constructor(x,y){ //setter x,y komponenter
        this.x = x;
        this.y = y;
    }
    norm(){ //normaliserer vektoren slik at lengden er 1
        let d = this.mag();
        this.x /= d;
        this.y /= d;
        return this; //retunerer en pointer til samme objektet slik at instrukser kan settes i lenke
    }
    mag(){ //returnerer lengden
        return Math.sqrt(this.x**2 + this.y**2);
    }
    get(){ //hent vektoren som et array
        return [this.x,this.y];
    }
    mult(num){ //multipliser lendgen med en verdi 
        this.x *= num;
        this.y *= num;
        return this; //retunerer en pointer til samme objektet slik at instrukser kan settes i lenke
    }
    chDirr(ch){ //enderer retiningen tilfeldig innenfor en rad verdi
        let mag = this.mag();
        let curdeg = Math.acos(this.x/mag) - ch/2;
        curdeg += Math.random()*ch;
        this.x = Math.cos(curdeg)*mag;
        this.y = Math.sin(curdeg)*(this.y/Math.abs(this.y))*mag;
        return this;
    }

    set(x,y,len=1){ //endrer vektoren med nye komponenter (retning) og ønsket lendge
        this.x = x;//setter x y komponenter
        this.y = y;
        this.norm().mult(len); //normaliser vektoren og ganger med ønsket lendge
    }

    log(){
        console.log(this.x, this.y); //Skriver ut vektoren
    }
};

class Weapon{ //base våpenklasse som tar ett objekt med våpenets statikk og typen på objektet som styrer våpenet
    constructor(obj,own){
        this.type = obj.name; //setter type
        this.last_shot = Date.now();
        this.cooldown = Date.now();
        this.stats = obj;
        this.owner = own;
        }

    set(name,obj){ //endrer type og statistikk for våpenet 
        this.type = name;
        this.stats = obj;
    }

    can_shoot(){ //fuksjon som sjekker om våpenet kan skyte ved å sammelikne med skuddraten, returnerer true om et slkudd kan sjke og false om ikke
        if((this.cooldown - this.last_shot) >= this.stats.rate){
            this.last_shot = this.cooldown;
            this.cooldown = Date.now();
            return true;
        } else {
            this.cooldown = Date.now();
            return false;
        }
    }

    shoot(x,y,start_x,start_y){ //fukejon som legger til et nytt skudd i entity listen
        if(this.can_shoot()){
            for(let i = 0; i < this.stats.multi; i++){
                let retVec = new Vector(x, y);
                entities.push(new Shot(retVec.norm(), start_x - this.stats.bsize/2, start_y - this.stats.bsize/2, this.stats, this.owner));
            }
            
        }
    }
}

/*array med våpen statestikk 
range er hvor langt våpenet kan nå i pixler
speed er pixler per frame
rate er milliskeunder mellom skudd
spread er hvor spredt skuddene er i radianer
bsize er skuddspritens størrelse i pixeler
multi er hvor mange kuler hvert skudd gir
og damage er hvor mye skade våpenet kan gjøre i hit points (brukes også for å bestemme hvordan kulen går gjennom fiender)
*/

const playerWeapons = ["pistol","sniper","assault","smg","shotgun"];

const weapons = {
    "pistol":{name: "pistol", range: 850, speed: 16, rate: 500, spread: Math.PI/24, bsize: 16, multi: 1, damage: 1},
    "assault":{name: "pistol", range: 850, speed: 16, rate: 250, spread: Math.PI/24, bsize: 16, multi: 1, damage: 2},
    "smg":{name: "pistol", range: 850, speed: 24, rate: 100, spread: Math.PI/12, bsize: 16, multi: 2, damage: 1},
    "shotgun":{name: "pistol", range: 850, speed: 8, rate: 750, spread: Math.PI/6, bsize: 16, multi: 5, damage: 1},
    "sniper":{name: "pistol", range: 850, speed: 32, rate: 1000, spread: Math.PI/32, bsize: 16, multi: 1, damage: 5},//i don't have a sprite for a sniper shot so the pistol one it is
     
    "fists":{name: "fists", range: 32, speed: 32, rate: 500, spread: 0 ,bsize: 16, multi: 1, damage: 1},
    "spit":{name: "spit", range: 150, speed: 8, rate: 1000, spread: Math.PI, bsize: 16, multi: 1, damage: 1}, //god i hate javascript error detection
   
};

class Sprite{ //sprite klasse
    constructor(path){
        this.img = document.getElementById(`${path}`); //henter img element fra html koden 
    }
    draw(x,y){ //tegner elementet på gitte kordinater
        this.img.onload = cxt.drawImage(this.img,x,y);
    }
};

class Shot extends GameObject{ //kule objekt
    constructor(retvec,x,y,type, owner){ //retvec er bevegelses retningen normalisert, x og y er start kordinatene, type er et våpenobjekt, owner er eier typen
        super(x,y,type.bsize,type.name); //konstruerer gameobject delen

        this.range = type.range; //setter hvor langt skuddet kan gå
        this.speed = type.speed; //Setter prosjektil hastighet
        this.damage = type.damage; //setter skade, 
        this.owner = owner; //setter eier
    
        this.mVec = retvec.chDirr(type.spread).mult(this.speed); //enderer tetnig basert på våpen spread og enderer retingen

        this.x -= this.radius; //setter kulas sentrum likt med eierens setrum
        this.y -= this.radius; 
    }

    update(){ //returnerer hvorvidt kula har stoppet eller gått utenfor range enda
        for(let i = 0; i < entities.length; i++){ //for alle objekter sjekker om objektet er i kontakt med kula
            if(this.check_hit(entities[i]) && (entities[i].type != this.owner) && (entities[i].type != this.type)){ //gøyal bug hvis man ikke inkuderer siste condition (kula treffer seg selv)
                let oldHp = entities[i].hp; //Setter gammel hp

                if(entities[i].type == "player"){
                    if (entities[i].iframes < 0){ //hvis objektet er pleryer og den ikke har invincible frames 
                        entities[i].iframes = 100; //gir iframes
                        entities[i].hp -= this.damage; //trekker damage fra hp
                        this.damage -= oldHp; 
                    }
                } else {
                    entities[i].hp -= this.damage;
                    this.damage -= oldHp;
                }

            }
            if(entities[i].hp <= 0){
                break;
            }
        }
        if(this.damage <= 0){//ved å trekke oldhp fra damage og sjekke om damage er mindre enn eller lik 0 skaper jeg en penetrating effekt
            return true;
        }
        return this.move();
    }

    move(){//flytter kula med en vektor
        this.x += this.mVec.x; 
        this.y += this.mVec.y;

        this.ty = this.y + this.radius;
        this.tx = this.x + this.radius;
        this.range -= this.speed; //trekker vektorlendgen fra gjennværende range
        if(this.range < 0){
            return true; //returnerer hvorvidt kula har gått ut av range
        } else {
            return false;
        }
    }
};

/*
aray med enemy types
speed er hastighet i pixler
detect er radiusen de kan se spilleren
weapon er indexen for våpen typen typen bruker
*/

const enemyTypes = [
    {name: "zombie" ,speed: 2, detect: 150, hp: 2, weapon: "fists"},
    {name: "spitter" ,speed: 2, detect: 300, hp: 1, weapon: "spit"},
];

class Enemy extends GameObject{
    constructor(x,y,type){//x, y er tegne kordinatet type er et objekt
        super(x,y,64,type.name);
        this.maxHp = type.hp; //setter hp
        this.hp = this.maxHp;
        this.weapon = new Weapon(weapons[type.weapon],type.name); //lager våpenet
        this.speed = type.speed; //setter hastighet
        this.sight = type.detect + Math.floor(Math.random()*100) - 50; //setter detection radius med litt slark
        this.mVec = new Vector(WIDTH/2 - x, -64-y); //setter retning på movement vector
        this.mVec.norm().mult(this.speed); //setter banefart
    }

    move(){ //oppdaterer alle kordinater
        this.x += this.mVec.x;
        this.y += this.mVec.y;
        this.ty = this.y + this.radius;
        this.tx = this.x + this.radius;
    }

    update(){ //opdaterer alt
        this.detect(entities[player]);
        this.move();
        this.HPmanager();
        if((this.x <= WIDTH/2 + 64)&&(this.x >= WIDTH/2 - 64)&&(this.y <= -64)){
            return true;
        } else {
            return this.dead;
        }
    }

    detect(obj){ //sjekker om et objekt er innenfor sysvidde om ikke setter gate som mål
        if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) <= this.sight){
            this.mVec.set(obj.tx - this.tx, obj.ty - this.ty, this.speed);
            this.Target(obj);//skyter mot målet
        } else {
            this.mVec.set(entities[gate].tx - this.tx ,entities[gate].ty - this.ty , this.speed);
            this.Target(entities[gate]);
        }
    }

    HPmanager(){ //sjekker om fienden er død eller på en eller annen måte har mer liv enn den skal ha
        if(this.hp > this.maxHp){
            this.hp = this.maxHp; 
        }
        if(this.hp <= 0){
            this.dead = true;
        }
    }

    Target(obj){ //sikter måt mål og skyter om innenfor rekkevidde
        if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) <= this.weapon.stats.range){
            this.weapon.shoot(obj.tx-this.tx, obj.ty-this.ty, this.tx, this.ty);
        }
    }

    
}

class Player extends GameObject{
    speed = 3;
    maxHp = 3;
    iframes = 0;

    constructor(){
        super(WIDTH/2-32, HEIGHT/2-32, 64, "player");//konsturerer base
        this.pressed = [false,false,false,false]; //bool array med taster som er nede; index 0 = w, index 1 = a, index 2 = s, index 3 = d
        this.weapon = new Weapon(weapons["pistol"],"player");
        this.target_x = this.tx; //x kordinat det siktes på
        this.target_y = this.ty; //y kordinat det siktes på
        this.shooting = false;
        this.hp = this.maxHp;
    }
    move(){
        let vec = new Vector(this.speed*this.pressed[3] - this.speed*this.pressed[1], this.speed*this.pressed[2] - this.speed*this.pressed[0]); //lager en vektor basert på summen av beveglensen

        if(vec.x&&vec.y){//om det både er x bevegelse og y bevegelse setter riktig fart 
            vec.set(vec.x,vec.y,this.speed);
        }

        this.x += vec.x; //oppdaterer posijonen
        this.y += vec.y;


        //sjekker om spiller er på vei ut av arenaen
        if(this.x >= WIDTH-2*this.radius){
            this.x = WIDTH-2*this.radius;
        }else if(this.x <= 0){
            this.x = 0;
        }
        if(this.y >= HEIGHT-2*this.radius){
            this.y = HEIGHT-2*this.radius;
        }else if(this.y < 0){
            this.y = 0;
        }
        
        //oppdaterer tx og ty
        this.ty = this.y + this.radius;
        this.tx = this.x + this.radius;
    }

    update(){ //oppdaterer spiller
        this.move();
        this.HPmanager();
        if(this.shooting){
            this.player_shoot();
        }
    }

    HPmanager(){
        this.iframes--; //dektementerer ifames
        if(this.hp > this.maxHp){
            this.hp = this.maxHp;
        }
        if(this.hp <= 0){
            this.dead = true;
        }
        
    }

    player_shoot(){ //skyter mot target x og y fra tx og ty
        this.weapon.shoot(this.target_x-this.tx, this.target_y-this.ty, this.tx, this.ty);
    }

};

class Pickup extends GameObject{
    constructor(x,y,c){
        super(x,y,16,"pickup");
        this.content = playerWeapons[c]; //string med våpen navn
    }

    update(){//returnerer true om den ble plukket opp
        if(Math.sqrt((entities[player].tx - this.tx)**2 + (entities[player].ty - this.ty)**2) <= this.radius){
            entities[player].weapon.set(this.content,weapons[this.content]);
            console.log("picked up thing")
            return true;
        }        
        return false;
    }

}

class Gate extends GameObject{
    width = 128; 
    height = 48;
    maxHp = 1e3;
    constructor(){
        super(WIDTH/2-64, 0, 64, "gate");
        this.hp = this.maxHp;
        this.tx += this.width/4; //trenger spessiell initialisering siden gate ikke er kvadratisk
        this.ty += this.height/2;
    }
    update(){
        if(this.hp <= 0){
            this.dead = true;
        }
    }
};

class Map{ //kartet i bakgrunnen
    constructor(){
        this.set = [];//set er et grid med tall som viser hva som skal tegnes
        for(let i = 0; i < Math.floor(WIDTH/32); i++){
            let temp = [];
            for(let j = 0; j < Math.floor(WIDTH/32); j++){
                temp.push(i); 
                if(i >= 2) temp[j] = Math.floor(Math.random()*7) + 2; // den ikke er på de to øverte radene last et tilfelfig bilde
            }
            this.set.push(temp);
        }

        this.sprites = [new Sprite("wall"), //hver sprite er 32px per side
                        new Sprite("wallGround")];
        for(let i = 1; i <= 7; i++){
            this.sprites.push(new Sprite(`ground${i}`))
        }
                        
    }

    draw(){ //tegner kartet et segment om gangen
        for(let i = 0; i < this.set.length; i++){
            for(let j = 0; j < this.set[i].length; j++){
                this.sprites[this.set[j][i]].draw(i*32, j*32);
            }
        }
    }
};

class Timer{ //klokke klasse
    constructor(){
        this.start = Date.now(); //setter start tid
        this.current = this.start;
        this.display = 0;
        this.running = true;
    }
    update(){
        if(this.running){
            this.current = Date.now(); //oppdaterer tidene
            this.display = Math.round((this.current-this.start)/1000);
        }
        
    }
    get(){
        return this.display;
    }
    stop(){
        this.running = false;
    }
};

cxt.font = "24px Aleo"; //setter font størrelse

class UI{ //lager UI
    constructor(){
        this.pHealth = new Sprite("health");
    }

    draw(){
        for(let i = 0; i < entities[player].hp; i++){ //tegner hjerter til skjermen
            this.pHealth.draw(i*32+8*(i+1),16);
        }
        //tegner health bar for døra
        cxt.beginPath();
        cxt.fillStyle = "#f00";
        cxt.fillRect(WIDTH - 20, 10, 10, (HEIGHT/(1.05*entities[gate].maxHp))*entities[gate].hp);
        cxt.stroke();

        cxt.fillText(`score: ${timer.get()}`, WIDTH-128-32, 32, 128);

        cxt.fillStyle = "#000";
        cxt.fillText(`weapon: ${entities[player].weapon.type}`, 8, HEIGHT-8, 128);

    }
};


let entities = [new Gate(), new Player()];
let misc = [];
let player = 1;//players index i entities
let gate = 0;//gates index i entities
let map = new Map();//lager kart
let ui = new UI();//lager UI
let keys = {"w":0, "a":1, "s":2, "d":3}; //kartleger taster med indexene i Player.pressed
let mode = 0;
let timer = new Timer();



function reset(){
    entities = [new Gate(), new Player()]; //entities innholder alle gameObjects
    timer = new Timer();
    misc = [];
    mode = 1; //setter mode til å kjøre
}

startBtn.addEventListener('click', (e) => {
    document.getElementById("start").style.display="none";
    reset();
});

mainEL.addEventListener("keydown",(e) => { //om en bevegelses kanpp blir trukket på setter korespodenede player.pressed til true
    entities[player].pressed[keys[e.key]] = true;
    if(e.key == " "){ //om det er space setter player.shooting til true
        entities[player].shooting = true;
    }
});

mainEL.addEventListener("keyup",(e) => { //om en knapp blir sluppet setter koreponderende variabel til false
    entities[player].pressed[keys[e.key]] = false;
    if(e.key == " "){
        entities[player].shooting = false;
    }
});

mainEL.addEventListener("mousemove",(e) => { //oppdaterer sikte kordinatene
    entities[player].target_x = e.clientX - (innerWidth - WIDTH)/2; // siste delen av utrykket kompanserer
    entities[player].target_y = e.clientY - (innerHeight - HEIGHT)/2;

    
});
window.onload = function(){ //når alt har lastet begynn gameloop
window.requestAnimationFrame(loop);
};

function loop(){
    if(mode == 1){
        update();
        draw();
    } else if (mode == 0){
        document.getElementById("start").style.display = "flex"; //gjør knapp synlig igjen
    }
    if(entities[player].dead||entities[gate].dead){//om spiller eller gate er døde sett mode til 0
        mode = 0;
    } 
    window.requestAnimationFrame(loop);
}

function update(){
    spawner(); //spawn fiender
    for(let i = 0; i < entities.length; i++){ //om objektet er dødt slett det fra arrayen med mindre der er spiller eller gate
        if(entities[i].update() && (i != 0 || i != 1)){
            entities.splice(i,1);
            i--;
        };
    }
    for(let i = 0; i < misc.length; i++){
        if(misc[i].update()){
            misc.splice(i,1);
            i--;
        }
    }
    timer.update();
}

function draw(){ //tegn alt
    cxt.clearRect(0,0,WIDTH,HEIGHT); //klargjør skjermen
    map.draw();
    for(let i = 0; i < entities.length; i++){
        entities[i].draw();
    }
    for(let i = 0; i < misc.length; i++){
        misc[i].draw();
    }
    ui.draw();
}

function spawner(){
    let spawn = Math.random() * 100;
    let sy; //start y
    let sx; //start x
 
    //fiender kan bare spawne rett utenfor skjermen i nedere halvdel

    if(spawn >= 98){
        if(Math.floor(Math.random()*2)){
            sx = (Math.floor(Math.random()*2))? 0: WIDTH-64;
            sy = HEIGHT - Math.floor(Math.random()*HEIGHT/2);
        } else {
            sx = Math.floor(Math.random()*WIDTH);
            sy = HEIGHT-64;
        }
        entities.push(new Enemy(sx, sy, enemyTypes[Math.floor(Math.random()*enemyTypes.length)]));
    }
    if(spawn >= 99.9){
        misc.push(new Pickup(Math.random()*(WIDTH-32),Math.random()*(HEIGHT-32),Math.floor(Math.random()*5)));
    }
}