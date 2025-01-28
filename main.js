const canvas = document.getElementById("screen")
const ctx = canvas.getContext("2d")

var mouse = {x:0,y:0},
    mouseWorld = {x:0,y:0},

    player = {
        position:{x:0,y:0}, 
        velocity:{x:0,y:0}, 
        hit:0,
        health:{current:5,max:5}
    },


    camera = {position:{x:0,y:0}, velocity:{x:0,y:0}},
    basicEnemy = {position:{x:0,y:0}, velocity:{x:0,y:0}},
    display = {startWidth:1280, aspectRatio:[4,3], scale:0},
    enemies = [],
    gameState = 1,
    deathAlpha = 0,
    healthPoints = [],
    enemyTimer = 0,
    shop = {position:{x:0,y:-250}},
    shopItemList = [
        {
            Title:"Health Upgrade",
            Description:[
                "gives +1 max health",
                "reusable"
            ],
            price:1,
            purchase:function(){

                player.health.max += Math.ceil(this.price/2)
                player.health.current -= this.price
                this.price*=2
                this.Description=[
                    `gives +${Math.ceil(this.price/2)} max health`,
                    "reusable"
                ]
                shopMenuVals.selection=2
            },
            type:"HP",
            purchaseCheck:function(){
                if(player.health.current-this.price<=0){
                    return false
                }
                return true
            }

        },
        {
            Title:"Health Downgrade",
            Description:[
                "gives 1 HP",
                "reusable"
            ],
            price:2,
            purchase:function(){
                spawnHealthRandom(shop)
                player.health.max-=2
                while(player.health.current>player.health.max){
                    player.health.current--
                    spawnHealthRandom(player)
                }
                shopMenuVals.selection=2
            },
            type:" MAX HP",
            purchaseCheck:function(){
                if(player.health.max-this.price<=1){
                    return false
                }
                return true
            }


        }
    ],
    shopStorage = [0,1],
    shopMenuVals={
        selection:2
    }

    function spawnHealthRandom(target=player){

        healthPoints[healthPoints.length] = {
            position:{x:target.position.x,y:target.position.y},
            velocity:{x:(Math.random()-.5)*20,y:(Math.random()-.5)*20},
            rotation:Math.random()*500,
            time:0
        }
    }

document.addEventListener("mousemove", function(e) {
    mouse = {
      x: (e.pageX - (window.innerWidth-ctx.canvas.width)/2)/display.scale,
      y: (e.pageY - (window.innerHeight-ctx.canvas.height)/2)/display.scale
    };
})
document.addEventListener("mousedown", (event) => {
    if (event.button == 0) {
        if(gameState==1){
            click()
        }
    }
}, false);

function click(){
    if(player.health.current>1){

        player.velocity.x=(player.position.x-mouseWorld.x)/10
        player.velocity.y=(player.position.y-mouseWorld.y)/10
        player.hit=1
        healthPoints[healthPoints.length] = {
            position:{x:player.position.x,y:player.position.y},
            velocity:{x:-player.velocity.x,y:-player.velocity.y},
            rotation:0,
            time:0
        }
        player.health.current--
    }
}

function spawnEnemy(){
    var random = Math.random()*2-1
    enemies[enemies.length]={
        position:{
            x:(Math.sin(random*Math.PI)*1000)+player.position.x,
            y:(Math.cos(random*Math.PI)*1000)+player.position.y
        }, 
        
        velocity:{x:0,y:0},

        speed:Math.random()+.5,
        friction:Math.random()/4+.73
    
    }
}

function tick(){
    requestAnimationFrame(tick)
    resize()
    if(gameState==1){
        mouseWorld = {
            x:mouse.x+(camera.position.x-(display.startWidth/2)),
            y:mouse.y+(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2)
        }
        shopTick()
        playerTick()
        healthTick()
        enemyTick()
        cameraTick()
    }
    menuTick()
    draw()    
}

function menuTick(){
    if(gameState==2){
        if(kd.LEFT.isDown()){
            shopMenuVals.selection=0
        }
        if(kd.RIGHT.isDown()){
            shopMenuVals.selection=1
            
        }
        if(kd.ENTER.isDown()){
            if(!(shopMenuVals.selection==2)){
                if(shopItemList[shopStorage[shopMenuVals.selection]].purchaseCheck()&&!(shopMenuVals.selection==2)){

                    shopItemList[shopStorage[shopMenuVals.selection]].purchase()
                    shopMenuVals.selection=2
                
                }
                
            }
            
        }
        if(kd.BACKSPACE.isDown()){
            gameState=1
        }
    }
    if(gameState==0){
        
    }
}

function draw(){
    ctx.fillStyle = "#90b0c0"
    ctx.fillRect(0,0,10000,10000)
    ctx.fillStyle = "rgb(167,199,16)"
    translate()
    ctx.fillRect(mouseWorld.x-5,mouseWorld.y-5,10,10)
    drawShop()
    drawPlayer()
    drawEnemies()
    untranslate()
    drawMenus()

}
function drawMenus(){
    ctx.beginPath()
    if(gameState==0){
        ctx.fillStyle = "#90b0c0aa"
        ctx.fillRect(0,0,10000,10000)
        ctx.font = "bold 48px Sans-serif";
        ctx.fillStyle = "#fff"
        ctx.lineWidth = 5;
        ctx.strokeStyle="#000"
        ctx.strokeText("you died.", 100, 100)
        ctx.fillText("you died.", 100, 100)
    }
    if(gameState==2){
        var count = 2,
            width = 490,
            offset = 100,
            height = 740
        ctx.fillStyle = "#000a"
        ctx.fillRect(0,0,10000,10000)
        for(let i = 0; i<count;i++){
        ctx.fillStyle = "#000a"
            ctx.beginPath()
            ctx.rect(offset+(width+offset)*i,offset,width,height)
            ctx.fill()
            if(shopMenuVals.selection==i){
                ctx.strokeStyle="#fff"
                if(!shopItemList[shopMenuVals.selection].purchaseCheck()){
                    ctx.strokeStyle="#faa"
                }
                ctx.lineWidth = 5;
                ctx.stroke()
            }
            ctx.font = "bold 48px Sans-serif";
            ctx.fillStyle = "#fff"
            ctx.lineWidth = 5;
            ctx.strokeStyle="#000"
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.strokeText(`${shopItemList[shopStorage[i]].Title}: `, 100+(width/2)+(width+offset)*i, 150)
            ctx.fillText(`${shopItemList[shopStorage[i]].Title}: `, 100+(width/2)+(width+offset)*i, 150)
            for(let r = 0;r<shopItemList[shopStorage[i]].Description.length;r++){
                ctx.strokeText(`${shopItemList[shopStorage[i]].Description[r]} `, 100+(width/2)+(width+offset)*i, 300 + (50*r))
                ctx.fillText(`${shopItemList[shopStorage[i]].Description[r]} `, 100+(width/2)+(width+offset)*i, 300 + (50*r))
            }
            ctx.fillText(`Costs : ${shopItemList[shopStorage[i]].price+""+shopItemList[shopStorage[i]].type} `, 100+(width/2)+(width+offset)*i, 750)
            if(shopMenuVals.selection==i){
                ctx.fillText(`▼`, 100+(width/2)+(width+offset)*i, 90)

            }

        }
        ctx.fillText(`<==`, 1280/2-50, 900)
        ctx.fillText(`==>`, 1280/2+50, 900)
        ctx.fillText(`${player.health.current+"/"+player.health.max}`, 1280/2, 100)


    }

}
function cameraTick(){
    camera.position.x=(camera.position.x*10+player.position.x)/11
    camera.position.y=(camera.position.y*10+player.position.y)/11
}

function translate(){
    
    ctx.translate(-(camera.position.x-(display.startWidth/2)),-(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2))
}

function untranslate(){
    
    ctx.translate((camera.position.x-(display.startWidth/2)),(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2))
}

function playerTick(){
    player.position.x+=player.velocity.x
    player.position.y+=player.velocity.y
    if(kd.D.isDown()){
        player.velocity.x+=1
    }
    if(kd.A.isDown()){
        player.velocity.x-=1
    }
    if(kd.W.isDown()){
        player.velocity.y-=1
    }
    if(kd.S.isDown()){
        player.velocity.y+=1
    }
    if(kd.K.isDown()){
        spawnEnemy()
    }
    if(kd.E.isDown()){
        if(
            Math.abs(player.position.x)-Math.abs(shop.position.x)<150
        &&  Math.abs(player.position.y)-Math.abs(shop.position.y)<150
        ){
            gameState=2
        }
    }

    player.velocity.x*=.95
    player.velocity.y*=.95
    player.hit-=.01
    if(player.health.current<=0){
        failState()
    }
}

function enemyTick(){
    for(let i =0; i<enemies.length; i++){
        // enemies[i].velocity.y += 1
        if(player.position.x<enemies[i].position.x){
            enemies[i].velocity.x -= .5*enemies[i].speed

        } else {
            enemies[i].velocity.x += .5*enemies[i].speed

        }
        if(player.position.y<enemies[i].position.y){
            enemies[i].velocity.y -= .5*enemies[i].speed

        } else {
            enemies[i].velocity.y += .5*enemies[i].speed

        }

        enemies[i].position.x += enemies[i].velocity.x
        enemies[i].position.y += enemies[i].velocity.y
        
        enemies[i].velocity.x *= enemies[i].friction
        enemies[i].velocity.y *= enemies[i].friction

        if(Math.abs(player.position.x-enemies[i].position.x)<100&&Math.abs(player.position.y-enemies[i].position.y)<100){
            if(player.hit>.7){
                if(Math.random()<.4){

                    healthPoints[healthPoints.length] = {
                        position:{x:enemies[i].position.x,y:enemies[i].position.y},
                        velocity:{x:-enemies[i].velocity.x,y:-enemies[i].velocity.y},
                        rotation:0,
                        time:0
                    }
                }
                enemies.splice(i,1)
            }else{
                player.health.current--
                enemies.splice(i,1)
            }
        }
    }
    enemyTimer++
    if(enemyTimer==100){
        spawnEnemy()
        enemyTimer=0
    }

}

function failState(){
    gameState=0
    deathAlpha=1
}

function drawEnemies(){
    for(let i =0; i<enemies.length; i++){

        ctx.save()
        ctx.translate(enemies[i].position.x,enemies[i].position.y)
        ctx.rotate(Math.atan2(enemies[i].position.y - player.position.y, enemies[i].position.x - player.position.x)-(180*Math.PI/180))
        ctx.fillStyle = "#33363f"
        ctx.fillRect(-50,-50,100,100)
        ctx.fillRect(0,-5,70,10)
        ctx.fillStyle = "#bfafaf"
        ctx.fillRect(5-50,5-50,90,90)
        ctx.restore()
    }
    
}

function drawPlayer(){
    ctx.save()
    ctx.translate(player.position.x,player.position.y)
    ctx.rotate(Math.atan2(player.position.y - mouseWorld.y, player.position.x - mouseWorld.x)-(180*Math.PI/180))
    console.log(mouseWorld.x, player.position.x)
    ctx.fillStyle = "#33363f"
    ctx.fillRect(-50,-50,100,100)
    if(player.hit>.8){
    ctx.fillStyle = "#33a63f"

    }
    ctx.fillRect(0,-5,70,10)
    ctx.fillStyle = "#afbfaf"
    ctx.fillRect(5-50,5-50,90,90)
    ctx.fillStyle = "#33363f"
    ctx.fillRect(-50,-50,100,30)
    ctx.fillStyle = "#afbfaf"
    ctx.fillRect(5-50,5-50,90,20)
    ctx.fillStyle = "#cfcfaf"
    ctx.fillRect(5-50,5-50,90/(player.health.max/player.health.current),20)
    ctx.restore()
    drawHealth()

}

function drawHealth(){
    for(let i = 0;i<healthPoints.length;i++){
        ctx.save()
        ctx.translate(healthPoints[i].position.x,healthPoints[i].position.y)
        ctx.rotate(healthPoints[i].rotation*Math.PI/180)
        ctx.fillStyle = "#33363f"
        ctx.fillRect(-25,-25,50,50)
        ctx.fillStyle = "#cfcfaf"
        ctx.fillRect(-20,-20,40,40)
        ctx.restore()
    }

}

function healthTick(){
    for(let i = 0;i<healthPoints.length;i++){
        healthPoints[i].position.x += healthPoints[i].velocity.x
        healthPoints[i].position.y += healthPoints[i].velocity.y
        healthPoints[i].velocity.x*=.95
        healthPoints[i].velocity.y*=.95
        healthPoints[i].rotation+=1
        healthPoints[i].time++
        if(
                Math.abs(player.position.x-healthPoints[i].position.x)<75
            &&  Math.abs(player.position.y-healthPoints[i].position.y)<75
            &&  healthPoints[i].time>30
            &&  player.health.current<player.health.max
        ){
            healthPoints.splice(i,1)
            player.health.current++
        }
    }

}

function drawShop(){
    
    ctx.beginPath(); 
    ctx.moveTo(shop.position.x,shop.position.y); 
    ctx.lineTo(player.position.x,player.position.y); 
    ctx.lineWidth=30
    ctx.strokeStyle="#6b4101"
    ctx.stroke();
    ctx.lineWidth=25
    ctx.strokeStyle="#A06000"
    ctx.stroke();
    ctx.closePath()

    ctx.save()
    ctx.translate(shop.position.x,shop.position.y)
    ctx.rotate(-(shop.position.x-player.position.x)/1000)
    ctx.beginPath(); 
    ctx.fillStyle = "#33363f"
    ctx.arc(0, -100, 55, 0, 2 * Math.PI);
    ctx.fill()
    ctx.fillRect(-100,-100,200,200)
    ctx.closePath()
    ctx.fillStyle = "#afafaf"
    ctx.fillRect(5-100,5-100,190,190)
    ctx.beginPath(); 
    ctx.arc(0, -100, 50, 0, 2 * Math.PI);//#dfdf8d
    ctx.fillStyle = "#afaf8f"
    ctx.fill()
    ctx.beginPath(); 
    ctx.arc(0, -100, 45, 0, 2 * Math.PI);//#dfdf8d
    ctx.fillStyle = "#cfcfaf"
    ctx.fill()
    ctx.restore()

}
function shopTick(){
    shop.position.x-=(shop.position.x-player.position.x)/50
    shop.position.y-=(shop.position.y-player.position.y)/50
}

function resize(){
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = display.aspectRatio[1] * window.innerWidth / display.aspectRatio[0];
    if(ctx.canvas.height>window.innerHeight){
        ctx.canvas.height=window.innerHeight
        ctx.canvas.width = display.aspectRatio[0] * window.innerHeight / display.aspectRatio[1]
    }
    ctx.scale(ctx.canvas.width/display.startWidth,ctx.canvas.width/display.startWidth)
    display.scale=ctx.canvas.width/display.startWidth
}

requestAnimationFrame(tick)