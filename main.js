const canvas = document.getElementById("screen")
const ctx = canvas.getContext("2d")

var mouse = {x:0,y:0},
    mouseWorld = {x:0,y:0},
    player = {position:{x:0,y:0}, velocity:{x:0,y:0}, hit:0},
    camera = {position:{x:0,y:0}, velocity:{x:0,y:0}},
    basicEnemy = {position:{x:0,y:0}, velocity:{x:0,y:0}},
    display = {startWidth:1280, aspectRatio:[4,3], scale:0},
    enemies = [],
    gameState = 1,
    deathAlpha = 0

document.addEventListener("mousemove", function(e) {
    mouse = {
      x: (e.pageX - (window.innerWidth-ctx.canvas.width)/2)/display.scale,
      y: (e.pageY - (window.innerHeight-ctx.canvas.height)/2)/display.scale
    };
})
document.addEventListener("mousedown", (event) => {
    if (event.button == 0) {
        click()
    }
}, false);

function click(){
    player.velocity.x=(player.position.x-mouseWorld.x)/10
    player.velocity.y=(player.position.y-mouseWorld.y)/10
    player.hit=1
}

function spawnEnemy(){
    enemies[enemies.length]={
        position:{
            x:(Math.random()*1000-500)+player.position.x,
            y:(Math.random()*1000-500)+player.position.y
        }, 
        
        velocity:{x:0,y:0},

        speed:Math.random()+.5,
        friction:Math.random()/4+.73
    
    }
}

function tick(){
    requestAnimationFrame(tick)
    resize()
    mouseWorld = {
        x:mouse.x+(camera.position.x-(display.startWidth/2)),
        y:mouse.y+(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2)
    }
    if(gameState==1){
        playerTick()
        enemyTick()
        cameraTick()
        draw()    
    }
}

function draw(){
    ctx.fillStyle = "rgb(167, 216, 216)"
    ctx.fillRect(0,0,10000,10000)
    ctx.fillStyle = "rgb(167,199,16)"
    translate()
    ctx.fillRect(mouseWorld.x-5,mouseWorld.y-5,10,10)
    drawPlayer()
    drawEnemies()

}

function cameraTick(){
    camera.position.x=(camera.position.x*10+player.position.x)/11
    camera.position.y=(camera.position.y*10+player.position.y)/11
}

function translate(){
    
    ctx.translate(-(camera.position.x-(display.startWidth/2)),-(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2))
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
    if(kd.E.isDown()){
        spawnEnemy()
    }
    player.velocity.x*=.95
    player.velocity.y*=.95
    player.hit-=.01
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
            if(player.hit>.3){
                enemies.splice(i,1)
            }else{
                failState()
            }
        }
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
    ctx.restore()

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