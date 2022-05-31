
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCcxr66semR4pK7ga0PIZiAWqmukJNSdA",
    authDomain: "zombiebuster-71a61.firebaseapp.com",
    projectId: "zombiebuster-71a61",
    storageBucket: "zombiebuster-71a61.appspot.com",
    messagingSenderId: "1080993284413",
    appId: "1:1080993284413:web:b078d8d71f32f18ad3c554"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();


// welcome to this italian resturant cause all we got is spaghetti

let mainEL = document.querySelector("body");
let startBtn = mainEL.querySelector("#startbutton");
let DeathDv = mainEL.querySelector("#death");


const WIDTH = mainEL.querySelector("#disp").clientWidth;
const HEIGHT = mainEL.querySelector("#disp").clientHeight;

console.log(WIDTH, HEIGHT);

let cxt = document.querySelector("#disp").getContext("2d"); //lager et canvas å tegne på


class GameObject{  //base game objuect klasse
    type = ""; //type navn
    x = 0; //x kordinatet spriten skal tegner til 
    y = 0; //y kordinatet spriten skal tegner til
    tx = 0; //x kordinatet til sentrum av objektet (true x)
    ty = 0; //y kordinatet til sentrum av objektet (true y)
    dead = false; //er objektet dødt?
    width = 0;
    height = 0;
    sprite = null; //sprite objektet

    constructor(x,y,w,h,t){ //setter statistikk, x = tegne x, y = tegne y, d = diameter, t = type
        this.x = x;
        this.y = y;
        this.width = w/2;
        this.height = h/2;
        this.tx = x + this.width;
        this.ty = y + this.height;
        this.type = t;
        
        this.sprite = new Sprite(t);//setter sprite av type, se lenger neded for definisjon'
        this.animations = [];
        this.animationSelect = 0;

    }

    check_hit(obj){ //sjekker om objektet kolliderer med at annet objekt (obj) og returnerer bool
        /*if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) <= obj.radius + this.radius){
            return true;
        } else {
            return false; 
        }*/

        let dx = this.tx - obj.tx;
        let dy = this.ty - obj.ty;
        let minw = this.width + obj.width;
        let minh = this.height + obj.height;
        
        if(Math.abs(dx) <  minw && Math.abs(dy) < minh){
            return true
        }
        return false
        
    }

    check_hit_correction(obj){
        let dx = this.tx - obj.tx;
        let dy = this.ty - obj.ty;
        let minw = this.width + obj.width;
        let minh = this.height + obj.height;
        
        if(Math.abs(dx) <  minw && Math.abs(dy) < minh){
            let mvx = minw - Math.abs(dx);
            let mvy = minh - Math.abs(dy);

            if(mvx < mvy){
                if(dx < 0){
                    return new Vector(-mvx,0);
                }else{
                    return new Vector(mvx,0);
                } 
            }
            else{
                if(dy < 0){
                    return new Vector(0,-mvy);
                }else{
                    return new Vector(0,mvy);
                } 
            }
            

        }
        return new Vector(0,0);
    }

    addAnimation(path,frameTime){
        this.animations.push(new FrameAnimation(path,frameTime));
        //console.log(this.animations);
    }

    draw(){ //tegner objektet
        if(this.animations.length == 0 || this.animationSelect == 0){
            this.sprite.draw(this.x,this.y);
            return;
        }
        //console.log(this.animations[this.animationSelect-1].frames)
        this.animations[this.animationSelect-1].draw(this.x,this.y);

        
    }
};

class Vector{ //egen vektor klasse for 2dimenjonal bevegelse
    constructor(x,y){ //setter x,y komponenter
        this.x = x;
        this.y = y;
    }
    norm(){ //normaliserer vektoren slik at lengden er 1
        let d = this.mag();
        if(d != 0)
        {
            this.x /= d;
            this.y /= d;
        }
        
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
        //console.log(this.x,this.y)
        this.norm();
        //console.log(this.x,this.y)
        this.mult(len); //normaliser vektoren og ganger med ønsket lendge
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

const playerWeapons = ["firebolt","lightningbolt","icecicles","flamethrower","shockwave"];

const weapons = {
    "firebolt"     :{name: "firebolt", range: 850, speed: 1000, rate: 500,  spread: Math.PI/24, bsize: 16, multi: 1, damage: 1},
    "icecicles"    :{name: "icecicles", range: 500, speed: 600,  rate: 250,  spread: Math.PI/24, bsize: 16, multi: 1, damage: 2},
    "flamethrower" :{name: "flamethrower", range: 200, speed: 1200, rate: 100,  spread: Math.PI/6,  bsize: 16, multi: 2, damage: 1},
    "shockwave"    :{name: "shockwave", range: 150, speed: 1200, rate: 750,  spread: Math.PI/4,  bsize: 16, multi: 5, damage: 1},
    "lightningbolt":{name: "lightningbolt", range: 850, speed: 2000, rate: 1000, spread: Math.PI/32, bsize: 16, multi: 1, damage: 5},//i don't have a sprite for a sniper shot so the pistol one it is
     
    "fists"     :{name: "fists",  range: 32,  speed: 100,  rate: 500,  spread: 0,          bsize: 16, multi: 1, damage: 1},
    "spit"      :{name: "spit",   range: 150, speed: 800,  rate: 1000, spread: Math.PI,    bsize: 16, multi: 1, damage: 1}, //god i hate javascript error detection
   
};

class Sprite{ //sprite klasse
    constructor(path){
        this.img = document.getElementById(`${path}`); //henter img element fra html koden 
    }
    draw(x,y){ //tegner elementet på gitte kordinater
        this.img.onload = cxt.drawImage(this.img,x,y);
    }
};

class FrameAnimation{ // klasse for animasjon
    constructor(path, frametime){ // tar navnet på animasjonen og tiden mellom hver frame i milliskunder
        this.num = document.getElementsByClassName(path).length; //antall frames
        this.frames = [];
        for(let i = 1; i <= this.num; i++){
            this.frames.push(new Sprite(`${path}${i}`)); //lagerer frames
        }
        this.tracker = 0; //holder styr på frames
        this.frameTime = frametime;//the time for each frame in milliseconds
        this.lastTime = Date.now();

    }

    draw(x,y){ // tegner gjeldene frame og går videre til neste om nødvendig
        this.frames[this.tracker].draw(x,y);
        if(Date.now() >= this.lastTime + this.frameTime){
            this.tracker++;
            this.tracker %= this.num;
            this.lastTime = Date.now();
        }
    }
};

class Shot extends GameObject{ //kule objekt
    constructor(retvec,x,y,type, owner){ //retvec er bevegelses retningen normalisert, x og y er start kordinatene, type er et våpenobjekt, owner er eier typen
        super(x,y,type.bsize,type.bsize,type.name); //konstruerer gameobject delen

        this.range = type.range; //setter hvor langt skuddet kan gå
        this.speed = type.speed; //Setter prosjektil hastighet
        this.hp = type.damage; //setter skade, 
        this.owner = owner; //setter eier
    
        this.mVec = retvec.chDirr(type.spread).mult(this.speed); //enderer tetnig basert på våpen spread og enderer retingen

        this.x -= this.width; //setter kulas sentrum likt med eierens setrum
        this.y -= this.height; 
    }

    update(){ //returnerer hvorvidt kula har stoppet eller gått utenfor range enda
        for(let i = entities.length-1; i > -1; i--){ //for alle objekter sjekker om objektet er i kontakt med kula
            if(this.check_hit(entities[i]) && (entities[i].type != this.owner) && (entities[i].type != this.type)){ //gøyal bug hvis man ikke inkuderer siste condition (kula treffer seg selv)
                let oldHp = entities[i].hp; //Setter gammel hp

                if(isNaN(entities[i].hp)){
                    console.log(entities[i]);
                    throw new Error("object hp is nan 1");
                }

                if(entities[i].type == "player"){
                    if (entities[i].iframes < 0){ //hvis objektet er pleryer og den ikke har invincible frames 
                        entities[i].iframes = 100; //gir iframes
                        entities[i].hp -= this.hp; //trekker damage fra hp
                        this.hp -= oldHp; 
                    }
                } else {
                    entities[i].hp -= this.hp;
                    this.hp -= oldHp;
                }
                
                if(isNaN(entities[i].hp)){
                    //console.log(this);
                    //console.log(entities[i]);
                    throw new Error("object hp is nan 2");
                }

            }
            if(entities[i].hp <= 0){
                break;
            }
        }
        if(this.hp <= 0){//ved å trekke oldhp fra damage og sjekke om damage er mindre enn eller lik 0 skaper jeg en penetrating effekt
            return true;
        }
        return this.move();
    }

    move(){//flytter kula med en vektor

        this.x += this.mVec.x*dt; 
        this.y += this.mVec.y*dt;

        this.ty = this.y + this.height;
        this.tx = this.x + this.width;
        this.range -= this.mVec.mag()*dt; //trekker vektorlendgen fra gjennværende range
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
    {name: "skeleton" , width: 32, height: 48, speed: 100, detect: 150, hp: 2, weapon: "fists", animation: [["SkeletonMovingRight",1000/8],["SkeletonMovingLeft",1000/8]]},
    {name: "skull", width: 24, height: 24, speed: 120, detect: 300, hp: 1, weapon: "spit", animation: [["SkullAnim",1000/8],["SkullAnim",1000/8]]},
];

class Enemy extends GameObject{
    constructor(x,y,type){//x, y er tegne kordinatet type er et objekt
        super(x, y, type.width, type.height, type.name);
        this.maxHp = type.hp; //setter hp
        this.hp = this.maxHp;
        this.weapon = new Weapon(weapons[type.weapon],type.name); //lager våpenet
        this.speed = type.speed; //setter hastighet
        this.sight = type.detect + Math.floor(Math.random()*100) - 50; //setter detection radius med litt slark
        this.mVec = new Vector(WIDTH/2 - x, -64-y); //setter retning på movement vector
        this.mVec.norm().mult(this.speed); //setter banefart
       
        for(let anim of type.animation) this.addAnimation(anim[0],anim[1])
        this.animationSelect = 1;
    }

    move(){ //oppdaterer alle kordinate
        this.mVec.mult(dt);
        this.x += this.mVec.x;
        this.y += this.mVec.y;

        if(this.mVec.x > 0) this.animationSelect = 1;
        else if(this.mVec.x < 0) this.animationSelect = 2;
        else if(this.mVec.x == 0 && this.mVec.y == 0) this.animationSelect = 0; 

        this.ty = this.y + this.height;
        this.tx = this.x + this.width;

        for(let i = 2; i < entities.length; i++){
            for(let type of enemyTypes){
                if(type.name == entities[i].type && entities[i] != this){
                    let move = this.check_hit_correction(entities[i]).get();
                    this.x += move[0];
                    this.y += move[1];
                    break;
                }
            }
        }

        //console.log(this.x)
    }

    update(){ //opdaterer alt
        this.detect(entities[player]);
        this.move();
        this.HPmanager();
        return this.dead;
        
    }

    detect(obj){ //sjekker om et objekt er innenfor sysvidde om ikke setter gate som mål
        if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) <= this.sight){
            this.mVec.set(obj.tx - this.tx, obj.ty - this.ty, this.speed);
            this.Target(obj);//skyter mot målet
        } else {
            if(!this.check_hit(gateStopBox)){
                this.mVec.set(entities[gate].tx - this.tx ,entities[gate].ty - this.ty , this.speed);
            }
            else this.mVec.set(0,0,0);
            this.Target(entities[gate]);
        }
    }

    HPmanager(){ //sjekker om fienden er død eller på en eller annen måte har mer liv enn den skal ha
        if(this.hp > this.maxHp){
            this.hp = this.maxHp; 
        }
        if(this.hp <= 0){
            this.dead = true;
            enemyNum--;
            score += 25;
        }
    }

    Target(obj){ //sikter måt mål og skyter om innenfor rekkevidde
        if(Math.sqrt((obj.tx - this.tx)**2 + (obj.ty - this.ty)**2) <= this.weapon.stats.range){
            this.weapon.shoot(obj.tx-this.tx, obj.ty-this.ty, this.tx, this.ty);
        }
    }  
};

class Player extends GameObject{
    speed = 150;
    maxHp = 3;
    iframes = 0;

    constructor(){
        super(WIDTH/2-32, HEIGHT/2-32, 64, 64, "player");//konsturerer base
        this.pressed = [false,false,false,false]; //bool array med taster som er nede; index 0 = w, index 1 = a, index 2 = s, index 3 = d
        this.weapon = new Weapon(weapons[playerWeapons[0]],"player");
        this.target_x = this.tx; //x kordinat det siktes på
        this.target_y = this.ty; //y kordinat det siktes på
        this.shooting = false;
        this.hp = this.maxHp;

        this.addAnimation("PlayerRunningRight",1000/21);
        this.addAnimation("PlayerRunningLeft", 1000/21);
    }

    move(){
        let vec = new Vector(this.speed*this.pressed[3] - this.speed*this.pressed[1], this.speed*this.pressed[2] - this.speed*this.pressed[0]); //lager en vektor basert på summen av beveglensen

        if(vec.x && vec.y){//om det både er x bevegelse og y bevegelse setter riktig fart 
            vec.set(vec.x,vec.y,this.speed);
        }

        vec.mult(dt);

        if(vec.x > 0) this.animationSelect = 1;
        else if(vec.x < 0) this.animationSelect = 2;
        else if(vec.y) this.animationSelect = Math.floor(Math.random(2)) + 1;
        else if (!(this.pressed[0]||this.pressed[1]||this.pressed[2]||this.pressed[3])) this.animationSelect = 0;

        this.x += vec.x; //oppdaterer posijonen
        this.y += vec.y;

        //sjekker om spiller er på vei ut av arenaen
        if(this.x >= WIDTH-2*this.width){
            this.x = WIDTH-2*this.width;
        }else if(this.x <= 0){
            this.x = 0;
        }
        if(this.y >= HEIGHT-2*this.height){
            this.y = HEIGHT-2*this.height;
        }else if(this.y < 0){
            this.y = 0;
        }
        
        //oppdaterer tx og ty
        this.ty = this.y + this.width;
        this.tx = this.x + this.height;
    }

    update(){ //oppdaterer spiller
        this.move();
        this.HPmanager();
        if(this.shooting){
            this.player_shoot();
        }
    }

    HPmanager(){
        if(isNaN(this.hp)) console.log(weapons);
        this.iframes--; //dektementerer ifames
        if(this.hp > this.maxHp){
            this.hp = this.maxHp;
        }
        if(this.hp <= 0){
            this.dead = true;
            mode = 0;
            diedOnLastFrame = true;
        }
        
    }

    player_shoot(){ //skyter mot target x og y fra tx og ty
        this.weapon.shoot(this.target_x-this.tx, this.target_y-this.ty, this.tx, this.ty);
    }

};

class Pickup extends GameObject{
    constructor(x,y,c){
        super(x,y,32,32,c+"Icon");
        this.content = c; //string med våpen navn
    }2

    update(){//returnerer true om den ble plukket opp
        if(this.check_hit(entities[player])){
            console.log(this.content,weapons[this.content])
            entities[player].weapon.set(this.content,weapons[this.content]);
            //console.log("picked up thing")
            return true;
        }        
        return false;
    }

};

class Gate extends GameObject{

    maxHp = 2e2;
    constructor(){
        super(WIDTH/2-64, 0, 128, 48, "gate");
        this.hp = this.maxHp;
    }
    update(){
        if(this.hp <= 0){
            this.dead = true;
            mode = 0;
        }
    }
};

let gateStopBox = {
    tx: WIDTH/2,
    ty:       0,
    width:   64,
    height:  32
}

class GameMap{ //kartet i bakgrunnen
    constructor(){
        this.set = [];//set er et grid med tall som viser hva som skal tegnes
        for(let i = 0; i < Math.floor(WIDTH/32); i++){
            let temp = [];
            for(let j = 0; j < Math.floor(WIDTH/32); j++){
                temp.push(i); 
                if(i >= 2){
                    if(Math.random() > 0.95)
                        temp[j] = Math.floor(Math.random()*4) + 2; 
                    else temp[j] = 2;
                }// den ikke er på de to øverte radene last et tilfelfig bilde
            }
            this.set.push(temp);
        }

        this.sprites = [new Sprite("wall"), //hver sprite er 32px per side
                        new Sprite("wallGround")];
        for(let i = 1; i <= 4; i++){
            this.sprites.push(new Sprite(`ground${i}`));
        }
                        
    }

    draw(){ //tegner kartet et segment om gangen
        for(let i = 0; i < this.set.length; i++){
            for(let j = 0; j < this.set[i].length; j++){
                this.sprites[this.set[j][i]].draw(i*32, j*32,32,32,false);
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

cxt.font = "24px Trebuchet MS"; //setter font størrelse

class UI{ //lager UI
    constructor(){
        this.pHealth = new Sprite("health");
        this.l = 0;
        this.ui = new Sprite("UIdetails");
        this.weaponIcons = {
            "firebolt"      : new Sprite("fireboltIcon64"),
            "lightningbolt" : new Sprite("lightningboltIcon64"),
            "icecicles"     : new Sprite("iceciclesIcon64"),
            "flamethrower"  : new Sprite("flamethrowerIcon64"),
            "shockwave"     : new Sprite("shockwaveIcon64")
        }
    }

    draw(){
        for(let i = 0; i < entities[player].hp; i++){ //tegner hjerter til skjermen
            this.pHealth.draw(i*32+10*(i+1),8,32,32,false);
        }
        
        this.weaponIcons[entities[player].weapon.type].draw(0,HEIGHT-64);

        //tegner health bar for døra
        cxt.beginPath();
        cxt.fillStyle = "#fff";
        cxt.fillRect(WIDTH - 24, 55, 24, (HEIGHT*0.8/(entities[gate].maxHp))*entities[gate].hp);
        cxt.stroke();

        cxt.fillStyle = "#ac3232";
        cxt.font = "bold 24px Trebuchet MS";
        cxt.fillText(score, WIDTH-32, HEIGHT, 64);

        this.ui.draw(0,0);
    }
};

class Spawner{
    constructor(){
        this.waveTime = 0;
        this.wavNum = 0;
        this.activeTimer = false;
        this.nextPickups = 6;
    }

    spawn(){
        if(this.wavNum == this.nextPickups){ //kode for å spawne nye våpen hver femte runde
            misc.push(new Pickup(200,400, playerWeapons[Math.floor(Math.random()*playerWeapons.length)]));
            misc.push(new Pickup(400,400, playerWeapons[Math.floor(Math.random()*playerWeapons.length)]));
            while(misc[1].content == misc[0].content) misc[1] = new Pickup(400,400, playerWeapons[Math.floor(Math.random()*playerWeapons.length)]);
        
            this.nextPickups += 5;
        }

        if(misc.length != 0 && this.activeTimer) this.waveTime = timer.get(); //lager nye bølger om alle fiender er døde og alle våpen plukket opp
        if(misc.length == 0 && this.wavNum != this.nextPickups){
            if(enemyNum <= 0 && !this.activeTimer){
                this.waveTime = timer.get();
                this.activeTimer = true;
                score += 200;
                this.wavNum++;
                return true;
            }
            else if(this.activeTimer){


                if(this.waveTime + 5 == timer.get()){
                    this.createWave();
                    this.activeTimer = false;
                }
            }
        }
        return false;    
    }

    draw(){ //tegner bølge nummer mellom bølger
        if(this.activeTimer && misc.length == 0){
           cxt.textAlign = "center";
           cxt.font = "32px Trebuchet MS";
           cxt.fillStyle = "#b90000";
           cxt.fillText(`WAVE ${this.wavNum}`,WIDTH/2,HEIGHT/2);
        }
    }

    
    createWave(){ // lager en bølge 


        enemyNum = enemyCalc(this.wavNum);

        let sy, sx;

        for(let i = 0; i < enemyNum; i++){
                //fiender kan bare spawne rett utenfor skjermen i nedere halvdel
            if(Math.floor(Math.random()*2)){
                sx = (Math.floor(Math.random()*2))? 0: WIDTH-64;
                sy = HEIGHT - Math.floor(Math.random()*HEIGHT/2);
            } else {
                sx = Math.floor(Math.random()*WIDTH);
                sy = HEIGHT-64;
            }
            entities.push(new Enemy(sx, sy, enemyTypes[Math.floor(Math.random()*enemyTypes.length)]));
        }

        console.log(this.wavNum);

        return enemyNum;
    }
}

let entities = [new Gate(), new Player()];
let misc = [];
let spawner = new Spawner();
let enemyNum = 0;
const player = 1;//players index i entities
const gate = 0;//gates index i entities
let map = new GameMap();//lager kart
let ui = new UI();//lager UI
let keys = {"w":0, "a":1, "s":2, "d":3}; //kartleger taster med indexene i Player.pressed
let mode = 0;
let timer = new Timer();
let diedOnLastFrame = false; 
let score = -200;
let dt = 0;
let lastUpdate = Date.now();
const youName = "  <span style=\"font-size: 18px\">(<span style=\"color: red;\">YOU</span>)</span>";
let Username = youName;



addStart();
displayBoard();

function reset(){
    entities = [new Gate(), new Player()]; //entities innholder alle gameObjects
    timer = new Timer();
    spawner = new Spawner();
    misc = [];
    mode = 1; //setter mode til å kjøre
    waveNum = 0;
    enemyNum = 0;
    score = -200;
};

mainEL.addEventListener("keydown",(e) => { //om en bevegelses kanpp blir trukket på setter korespodenede player.pressed til true
    entities[player].pressed[keys[e.key.toLowerCase()]] = true;
    if(e.key == " "){ //om det er space setter player.shooting til true
        entities[player].shooting = true;
    }
});

mainEL.addEventListener("keyup",(e) => { //om en knapp blir sluppet setter koreponderende variabel til false
    entities[player].pressed[keys[e.key.toLowerCase()]] = false;
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
    if(mode == 0){
        if(diedOnLastFrame){
            document.getElementById("meny").style.display = "flex";
            death();
            //console.log(document.querySelector("#meny"))
            document.querySelector("#disp").style.display = "none";
        }
        diedOnLastFrame = false;
        
    } else if (mode == 1){
        update();
        draw();
    }
    window.requestAnimationFrame(loop);
}

function update(){
    //let prevScore = score;
    //let prevEnNum = enemyNum;
    for(let i = 0; i < entities.length; i++){ //om objektet er dødt slett det fra arrayen med mindre der er spiller eller gate
        if(entities[i].update() && (i != 0 || i != 1)){
            entities.splice(i,1);
            i--;

        }
    }
    for(let i = 0; i < misc.length; i++){
        if(misc[i].update()){
            misc = [];
            break;
        }
    }
    timer.update();
    spawner.spawn();


    //LeftAdminEye(prevScore, prevEnNum, defeatedWave);
    dt = (Date.now() - lastUpdate)/1000;
    lastUpdate = Date.now();
    //console.log(dt)
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
    spawner.draw();
}

function death(){
    if(localStorage.BestScore == null){
        localStorage.BestScore = 0;
    }
    if(localStorage.BestScore < score){
        localStorage.BestScore = score;
    }
    addDeath();
}

function leggTilScore(){ //legger til en score i databasen 
    if(RightAdminEye()){
        window.localStorage.bestScore = -score;
        db.collection("Scores").add({
            name: document.querySelector("#nameBox").value + "<span style=\"color : #a00; font-size: 32px;\">( CHEATER )</span>",
            score: score,
            cheated: true
        });
    }
    else{
        db.collection("Scores").add({
            name: document.querySelector("#nameBox").value,
            score: score,
            cheated: false
        });
    }
    
}

function addDeath(){ // tegner døds menyen
    displayBoard();

    let meny = document.getElementById("meny");
    meny.style.display = "flex";
    let DeathEl = document.createElement("div");
    DeathEl.id = "death";
    DeathEl.innerHTML = `<h2 id=\"ScoreDisplay\">Your Score ${score}</h2><h3>Personal best: ${window.localStorage.BestScore}</h3><label for=\"nameBox\">Name To Be Shown</label><input id=\"nameBox\" type=\"text\" maxlength=\"16\">`;
    
    let scoreBtn = document.createElement("div");
    scoreBtn.id = "scorebutton";
    scoreBtn.className = "button";
    scoreBtn.innerHTML = "<p>Register Score</p>";
    scoreBtn.addEventListener("click", (e) => {
        leggTilScore();
        Username = document.querySelector("#nameBox").value + youName;
        document.getElementById("ThisRound").childNodes[1].innerHTML = Username;
        addStart();
        meny.removeChild(DeathEl);
    });
    DeathEl.appendChild(scoreBtn);

    let skipBtn = document.createElement("div");
    skipBtn.id = "skipbutton";
    skipBtn.className = "button";
    skipBtn.innerHTML = "<p>Skip</p>";
    skipBtn.addEventListener("click", (e) => {
        addStart()
        meny.removeChild(DeathEl);
    });
    DeathEl.appendChild(skipBtn);

    meny.appendChild(DeathEl);
}

function addStart(){//tengner start menyen
    let meny = document.getElementById("meny");
    meny.style.display = "flex";
    let StartEl = document.createElement("div");
    StartEl.id = "start";

    let startBtn = document.createElement("div");
    startBtn.id = "startbutton";
    startBtn.className = "button";
    startBtn.innerHTML = "<p>START</p>";
    startBtn.addEventListener("click", (e) => {
        mode = 1;
        document.querySelector("#disp").style.display = "flex";
        reset();
        document.getElementById("meny").style.display = "none";
        meny.removeChild(StartEl);
        document.getElementById("Scores").style.display = "none";
    });
    StartEl.appendChild(startBtn);

    let insEl = document.createElement("div");
    insEl.id = "instructions";
    insEl.innerHTML = "<p>W = UP, A = LEFT, S = DOWN, D = RIGHT</p><p>SPACE = SHOOT</p><p>AIM WITH MOUSE</p>";
    StartEl.appendChild(insEl);

    meny.appendChild(StartEl);
}

function displayBoard(){ //henter informasjon fra databasen og viser de 10 beste scorene
    document.getElementById("Scores").style.display = "block";
    let table = document.getElementById("scoreBoard");
    
    table.innerHTML='';

    

    db.collection("Scores").orderBy("score","desc").get().then((snapshot) => {
        let dokumenter = [];
        let playerIndex = 0;
        if(score != -200){
            dokumenter.push({score: score, name: youName});
            for(let doc of snapshot.docs){
                if(doc.data().score >= score)
                {
                    dokumenter.splice(playerIndex,0,doc.data());
                    playerIndex++;
                } else {
                    dokumenter.push(doc.data());
                }
                    
            }
        }
        else {
            for(let doc of snapshot.docs){
                dokumenter.push(doc.data());
            }
        }
        
        

        console.log(dokumenter)
        console.log(playerIndex)
        console.log(dokumenter[playerIndex])


        let i = 0;
        let rank = 1;
        let skip = 0;
        let prevdoc = dokumenter[0];
        for(var doc of dokumenter){
            if(prevdoc.score > doc.score){
                rank += skip;
                skip = 1;
            } else {
                skip++;
            }   
            doc.rank = rank;
            prevdoc = doc;
        }
        //console.log(dokumenter)
        for(var doc of dokumenter){
            let rad = document.createElement("tr");

            if(doc.name == dokumenter[playerIndex].name && doc.score == dokumenter[playerIndex].score) rad.id = "ThisRound";

            rad.innerHTML += `<td>${doc.rank}</td>`;
            rad.innerHTML += `<td>${doc.name}</td>`;
            rad.innerHTML += `<td>${doc.score}</td>`;
            table.appendChild(rad);
            prevdoc = doc;
            i++;
            if(i >= 10) break;
        }


        if(playerIndex >= 10 && score != -200){
            if(dokumenter[playerIndex].rank != dokumenter[9].rank && dokumenter[playerIndex].rank != dokumenter[9].rank+1){
                let fillrad = document.createElement("tr");
                fillrad.innerHTML += `<td>${dokumenter[9].rank+1}-${dokumenter[playerIndex].rank-1}</td>`;
                fillrad.innerHTML += `<td>...</td>`;
                fillrad.innerHTML += `<td>...</td>`;
                table.appendChild(fillrad);
            }
            


            let rad = document.createElement("tr");
            rad.id = "ThisRound";
            rad.innerHTML += `<td>${dokumenter[playerIndex].rank}</td>`;
            rad.innerHTML += `<td>${dokumenter[playerIndex].name}</td>`;
            rad.innerHTML += `<td>${dokumenter[playerIndex].score}</td>`;
            table.appendChild(rad);
        }

    });
}   

function RightAdminEye(){
    //funskjon ansvarlig for å sjekk om spillerens score er ulovlig
    let waveScore = (spawner.wavNum-1) * 200;
    let enemyScore = 0;
    for(let i = 1; i <= spawner.wavNum; i++){
        enemyScore += enemyCalc(i);
    }
    enemyScore -= enemyNum;
    enemyScore *= 25;

    let maxScore = waveScore + enemyScore;

    if(score > maxScore)
    {
        console.log("SINNER")
        return true;
    }
    else{
        console.log("APPROVED")
        return false;
    };
}
/*
function LeftAdminEye(prevScore,prevEnNum,waveChange){
    //funksjon som ser etter mindre ulovlig aktivitet
    if(prevEnNum - enemyNum >= 0){
        let maxDivergence = (prevEnNum - enemyNum) * 25 + (waveChange ? 1 : 0) * 200;
        console.log(maxDivergence);
        if((score - prevScore) > maxDivergence){
            window.sessionStorage.sus = "true";
        }
    }
    
}*/

function enemyCalc(wavNum){
    var log = (y,x) => {
        return Math.log(y)/Math.log(x);
    }

    return Math.floor(log(wavNum, 5)*5) + 2;
}
