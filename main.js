import { Scene } from "./scene.js";
const player = 
{
    id:"player1",
    type:"player",
    x:100,
    y:100,
    mousex: 0,
    mousey: 0
}
let scene;
let map;
const keys = {};
// websocket connection and logic

const ws = new WebSocket("wss://juo-beta-testing.bonto.run")
ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    
    if (message.type === "init") {
        player.id = message.playerId;
        scene = new Scene(map)
        map = message.map;
        console.log(map)
        scene.add_object(player)
        scene.init()

        test();
    }
    
    if (message.type === "state_update") {
        message.players.forEach(pData => {
            if (pData.id === player.id) {
                player.x += (pData.x - player.x) * 0.2;
                player.y += (pData.y - player.y) * 0.2;
            } else {
                let remotePlayer = scene.get_object(pData.id);
                if (!remotePlayer) {
                    remotePlayer = {
                        id: pData.id,
                        type: "player",
                        x: pData.x,
                        y: pData.y,
                        angle: pData.angle || 0
                    };
                    scene.add_object(remotePlayer);
                } else {
                    remotePlayer.x += (pData.x - remotePlayer.x) * 0.2;
                    remotePlayer.y += (pData.y - remotePlayer.y) * 0.2;
                    remotePlayer.angle = pData.angle || 0;
                }
            }
        });

        if (message.entities) {
            message.entities.forEach(eData => {
                let entityObj = scene.get_object(eData.id);
                if (!entityObj) {
                    entityObj = {
                        id: eData.id,
                        type: eData.type,
                        x: eData.x,
                        y: eData.y
                    };
                    scene.add_object(entityObj);
                } else {
                    entityObj.x = eData.x;
                    entityObj.y = eData.y;
                }
            });
        }
    }
};





// game render logic

window.addEventListener("mousemove", (e)=>
    {
    const rect = scene.canvas.getBoundingClientRect();
    const screenMouseX = e.clientX - rect.left;
    const screenMouseY = e.clientY - rect.top;
    player.mousex = (screenMouseX - scene.canvas.width / 2) / scene.camera.zoom + scene.camera.x;
    player.mousey = (screenMouseY - scene.canvas.height / 2) / scene.camera.zoom + scene.camera.y;
    }
)
window.addEventListener("keydown", (e) =>
{
    keys[e.code] = true;
})
window.addEventListener("keyup", (e) =>
{
    keys[e.code] = false;
})


const PLAYER_SPEED = 2; 

const test = () => {
    scene.ctx.clearRect(0, 0, scene.canvas.width, scene.canvas.height);
    
    if (keys.KeyW) player.y -= PLAYER_SPEED;
    if (keys.KeyS) player.y += PLAYER_SPEED;
    if (keys.KeyA) player.x -= PLAYER_SPEED;
    if (keys.KeyD) player.x += PLAYER_SPEED;

    scene.render();
    
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "move",
            w: keys.KeyW || false,
            a: keys.KeyA || false,
            s: keys.KeyS || false,
            d: keys.KeyD || false,
            angle: Math.atan2(player.mousey - player.y, player.mousex - player.x)
        }));
    }
    scene.focus_camera(player)

    requestAnimationFrame(test);
};

