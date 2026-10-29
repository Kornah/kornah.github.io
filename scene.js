export class Scene {
    constructor(map)
    {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas)
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.objects = new Map();
        this.camera = {x:0,y:0,zoom:1};
        this.map = map;
    }
    // scene methods
    async init()
    {
        await document.fonts.load("24px PixelForce");
        this.ctx.font = "24px PixelForce";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }
    render()
    {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        for(let [id, object] of this.objects)
        {
            if(object.type === "player")
            {
                this.rplayer(object)
            }
        }
        this.render_tilemap(this.map)
    }
    // object methods
    add_object(object)
    {
        if(object)
        {
            this.objects.set(object.id, object)
        } else
        {
            console.warn(`No object to add`)
        }
    }
    get_object(objectId)
    {
        return this.objects.get(objectId)
    }
    remove_object(objectId)
    {
        console.log(`%cremoved Object: ${this.objects.get(objectId)}`, "color: blue;")
        this.objects.delete(objectId)
    }
    focus_camera(object)
    {
        if(object)
        {
            this.camera.x = object.x;
            this.camera.y = object.y;
        }
    }
    // render methods
    render_tilemap(mapData) {
        if (!mapData || !mapData.ids) return;

        const TILE_SIZE = 32;
        const grid = mapData.components;

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const tileId = grid[row][col];
                
                if (tileId === 0) continue;

                let worldX = col * TILE_SIZE;
                let worldY = row * TILE_SIZE;

                let screenX = this.w2sx(worldX);
                let screenY = this.w2sy(worldY);

                if (
                    screenX + TILE_SIZE < 0 || screenX > this.canvas.width ||
                    screenY + TILE_SIZE < 0 || screenY > this.canvas.height
                ) {
                    continue;
                }

                this.ctx.fillStyle = tileId === 1 ? '#27ae60' : '#7f8c8d';
                this.ctx.fillRect(screenX, screenY, TILE_SIZE * this.camera.zoom, TILE_SIZE * this.camera.zoom);
                
                this.ctx.strokeStyle = '#111';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(screenX, screenY, TILE_SIZE * this.camera.zoom, TILE_SIZE * this.camera.zoom);
            }
        }
    }
    vfx(effect)
    {
        // todo
    }
    // sound methods
    play_sound(sound)
    {
        // todo
    }
    sfx(effect)
    {
        // todo
    }
    // utils
    w2s(x, y)
    {
        let newx = (x - this.camera.x) * this.camera.zoom + (this.canvas.width/2)
        let newy = (y - this.camera.y) * this.camera.zoom + (this.canvas.height/2) 
        return {x: newx, y: newy}
    }
    w2sx(x)
    {
        return (x - this.camera.x) * this.camera.zoom + (this.canvas.width/2)
    }
    w2sy(y)
    {
        return (y - this.camera.y) * this.camera.zoom + (this.canvas.height/2)
    }
    rplayer(object)
    {
        let angle = object.angle !== undefined 
            ? object.angle 
            : Math.atan2(object.mousey - object.y, object.mousex - object.x);
        this.ctx.beginPath();
        let radian = 0.698132;
            this.ctx.fillStyle = "#D2B48C";
            this.ctx.strokeStyle = "#000"
            this.ctx.lineWidth = 3;
            // player hands 
            let hand1X = this.w2sx(object.x + Math.cos(angle - radian) * 20);
            let hand1Y = this.w2sy(object.y + Math.sin(angle - radian) * 20);
            let hand2X = this.w2sx(object.x + Math.cos(angle + radian) * 20);
            let hand2Y = this.w2sy(object.y + Math.sin(angle + radian) * 20);

            this.ctx.arc(hand1X, hand1Y, 6, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.arc(hand2X, hand2Y, 6, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.stroke()
            // player body
            this.ctx.beginPath()
            this.ctx.arc(this.w2sx(object.x), this.w2sy(object.y), 20, 0, Math.PI * 2)
            this.ctx.fill();
            this.ctx.stroke()
            this.ctx.fillStyle = "#000";
            this.ctx.fillText(`ID: ${object.id}`, this.w2sx(object.x), this.w2sy(object.y) - 40)
    }

}