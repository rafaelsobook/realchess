const canvas = document.querySelector("canvas")

const log = console.log;
const { Engine, Scene, Texture, Color3, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, ArcRotateCamera, FreeCamera, SceneLoader } = BABYLON

let pawnRootMesh
let fakeShadow
class Game {
    constructor(){
        this._engine = new Engine(canvas, true)
        this._scene = new Scene(this._engine)

        this._cam = this.createArcCam(this._scene)


        this.main()
    }
    async main(){
        await this._firstLevel()

        this._engine.runRenderLoop(() => {
            this._scene.render()
        })
        window.addEventListener("resize", () => {
            this._engine.resize()
        })
    }

    async _firstLevel(){

        const scene = new Scene(this._engine)
        const cam = this.createArcCam(scene)
        cam.attachControl(canvas, true)
        log(cam)
        const light = new HemisphericLight("hemlight", new Vector3(0,10,0), scene)

        // const box = MeshBuilder.CreateBox("box", {size: 1}, scene);
        await this.creationOfFakeShadow(scene)
        await SceneLoader.ImportMeshAsync(null, "./models/", "chessBoard.glb", scene);

        pawnRootMesh = await BABYLON.SceneLoader.LoadAssetContainerAsync("./models/", "pawns.glb", scene)

        let pawnsLength = 8
        let starting = -10.5
        while(starting <= 13){
            this.createPawns(pawnRootMesh, {x:starting,y:0,z:-7.3}, scene)
            starting+=3
            log(starting)
        }
        

        await scene.whenReadyAsync()
        this._scene.dispose()
        this._scene = scene
    }
    putFakeShadow(meshBody, sizeShadow, posY){
        const newFakeShadow = fakeShadow.createInstance("fakeShadow")
        newFakeShadow.parent = null
        newFakeShadow.rotationQuaternion = null;
        newFakeShadow.parent = meshBody
        newFakeShadow.position = new Vector3(0,-this.yPos+.03,0)
        if(posY) newFakeShadow.position = new Vector3(0,posY,0)
        if(sizeShadow) {
            newFakeShadow.scaling = new Vector3(sizeShadow,.1,sizeShadow)
        }
    }
    // creations
    creationOfFakeShadow(scene){
        fakeShadow = MeshBuilder.CreateGround("fakeShadow", {width: .9, height: .9}, scene)
        const fakeShadowMat = new StandardMaterial("fakeShadowMat", scene);
        fakeShadowMat.diffuseTexture = new Texture("./images/fakeShadow.png", scene)
        
        fakeShadow.material = fakeShadowMat
        fakeShadowMat.specularColor = new Color3(0,0,0)
        fakeShadowMat.diffuseTexture.hasAlpha = true;
        fakeShadowMat.useAlphaFromDiffuseTexture = true;
        fakeShadow.position.y = 100
    }
    createArcCam(scene){
        const cam = new ArcRotateCamera("ArcCamera", 1,1,10, new Vector3(0,0,0), scene)
        cam.lowerRadiusLimit = 15.5;
        cam.upperRadiusLimit = 45.5
        cam.lowerBetaLimit = .85;
        cam.upperBetaLimit = 1
        return cam
    }

    createPawns(theCharacterRoot, pos, scene){
        let meshes = []
        let rHead;
        let animations
        const body = MeshBuilder.CreateBox(`box`, {size: 1}, scene)
        body.position = new Vector3(pos.x,pos.y+.5,pos.z); 
        body.checkCollisions = true
        this.putFakeShadow(body, 2, -.48)
        body.isVisible = false

        let entries = theCharacterRoot.instantiateModelsToScene();
        entries.animationGroups.forEach(ani => ani.name = ani.name.split(" ")[2])
        animations = entries.animationGroups
        animations[2].play()

        entries.rootNodes[0].getChildren().forEach(mes => {
            mes.name = mes.name.split(" ")[2]
            log(mes.name)
            if(mes.name !== "Armature") meshes.push(mes);
            if(mes.name === "Armature"){
                mes.getChildren().forEach(mes => {
                    if(mes.name.includes("root")) rHead = mes.getChildren()[0].getChildren()[0].getChildren()[0]
                })     
            }
        })
        log(meshes)
        log(rHead)
        log(animations)

        entries.rootNodes[0].parent = body
        entries.rootNodes[0].position.y -= .5
        entries.rootNodes[0].rotationQuaternion = null
        entries.skeletons[0].dispose()

    }
    
}

new Game()