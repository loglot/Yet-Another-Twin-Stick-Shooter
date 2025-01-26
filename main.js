const canvas = document.getElementById("screen")
const ctx = canvas.getContext("2d")

var mouse = {x:0,y:0}
var mouseWorld = {x:0,y:0}
var player = {position:{x:0,y:0}, velocity:{x:0,y:0}}
var camera = {position:{x:0,y:0}, velocity:{x:0,y:0}}
var basicEnemy = {position:{x:0,y:0}, velocity:{x:0,y:0}}
var display = {startWidth:1280, aspectRatio:[4,3], scale:0}
var enemies = []

document.addEventListener("mousemove", function(e) {
    mouse = {
      x: (e.pageX - (window.innerWidth-ctx.canvas.width)/2)/display.scale,
      y: (e.pageY - (window.innerHeight-ctx.canvas.height)/2)/display.scale
    };
})
// resize()
function tick(){
    requestAnimationFrame(tick)
    resize()
    mouseWorld = {
        x:mouse.x+(camera.position.x-(display.startWidth/2)),
        y:mouse.y+(camera.position.y-(display.aspectRatio[1]*display.startWidth/display.aspectRatio[0])/2)
    }
    playerTick()
    cameraTick()
    draw()
}
function draw(){
    ctx.fillStyle = "rgb(167,199,216)"
    ctx.fillRect(0,0,10000,10000)
    ctx.fillStyle = "rgb(167,199,16)"
    translate()
    ctx.fillRect(mouseWorld.x-5,mouseWorld.y-5,10,10)
    drawPlayer()

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
        player.velocity.x+=.1
    }
    if(kd.A.isDown()){
        player.velocity.x-=.1
    }
    if(kd.W.isDown()){
        player.velocity.y-=.1
    }
    if(kd.S.isDown()){
        player.velocity.y+=.1
    }
    player.velocity.x*=.99
    player.velocity.y*=.99
}

function drawPlayer(){
    ctx.translate(player.position.x,player.position.y)
    ctx.rotate(Math.atan2(player.position.y - mouseWorld.y, player.position.x - mouseWorld.x)-(180*Math.PI/180))
    console.log(mouseWorld.x, player.position.x)
    ctx.fillStyle = "#33363f"
    ctx.fillRect(-50,-50,100,100)
    ctx.fillRect(0,-5,70,10)
    ctx.fillStyle = "#afbfaf"
    ctx.fillRect(5-50,5-50,90,90)

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