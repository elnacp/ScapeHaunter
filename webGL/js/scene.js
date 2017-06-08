
var scene, camera, renderer, mesh, clock;
var meshFloor, ambientLight, light;

var crate, crateTexture, crateNormalMap, crateBumpMap;
var modelArma;
var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var USE_WIREFRAME = false;

var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(0.5,0.5,0.5),
        new THREE.MeshBasicMaterial({ color:0x4444ff })
    )
};
var loadingManager = null;
var RESOURCES_LOADED = false;
var index = 0;

// Models index
var models = {
    uzi: {
        obj:"models/uziGold.obj",
        mtl:"models/uziGold.mtl",
        mesh: null,
        castShadow:false
    },
    uzi2: {
        obj:"models/uziLong.obj",
        mtl:"models/uziLong.mtl",
        mesh: null,
        castShadow:false
    },
    machine: {
        obj:"models/machinegunLauncher.obj",
        mtl:"models/machinegunLauncher.mtl",
        mesh: null,
        castShadow:false
    }

};

// Meshes index
var meshes = {};

// Bullets array
var bullets = [];

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
    clock = new THREE.Clock();

    loadingScreen.box.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
        console.log(item, loaded, total);
    };
    loadingManager.onLoad = function(){
        console.log("loaded all resources");
        RESOURCES_LOADED = true;
        modelArma = models.uzi.mesh.clone();
        onResourcesLoaded();
    };



    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20, 10,10),
        new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);


    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(-3,6,-3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);



    for( var _key in models ){
        (function(key){

            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function(materials){
                materials.preload();

                var objLoader = new THREE.OBJLoader(loadingManager);

                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function(mesh){

                    mesh.traverse(function(node){
                        if( node instanceof THREE.Mesh ){
                            if('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;

                            if('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;

                });
            });

        })(_key);
    }

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0,player.height,0));

    createHaunter();
    createEnviroment();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(renderer.domElement);

    animate();
}

function createHaunter(){
    var material = new THREE.MeshPhongMaterial();
    loader = new THREE.OBJLoader();
    loader.load('assets/haunter.obj', function(object){
        object.traverse(function (child) {
            if(child instanceof  THREE.Mesh){
                child.material = createHaunterMaterial();
                child.receiveShadow = true;
                child.castShadow = true;
                child.name = "model";
            }
        });
        object.name = 'character';
        object.position.set(0,1,0);
        object.scale.set(0.0025,0.0025,0.0025);
        object.rotation.y = 3.25;
        meshes['character'] = object;
        scene.add(object);
    });
}

function createHaunterMaterial(){
    var earthTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/HaunterTexture.jpg' , function(image) {
        earthTexture.image = image;
        earthTexture.needsUpdate = true;
    });
    var earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = earthTexture;
    return earthMaterial;
}


// Runs when all resources are loaded
function onResourcesLoaded(){
    // player weapon
    meshes["arma"] = modelArma;
    meshes["arma"].position.set(0,2,0);
    meshes["arma"].scale.set(10,10,10);
    scene.add(meshes["arma"]);
}

function animate(){

    // Play the loading screen until resources are loaded.
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
        if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    requestAnimationFrame(animate);

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta();

    for(var index=0; index<bullets.length; index+=1){
        if( bullets[index] === undefined ) continue;
        if( bullets[index].alive == false ){
            bullets.splice(index,1);
            continue;
        }

        bullets[index].position.add(bullets[index].velocity);
    }

    if(keyboard[87]){ // W
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }
    if(keyboard[83]){ // S
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }
    if(keyboard[65]){ // A
        camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
    }
    if(keyboard[68]){ // D
        camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
    }

    if(keyboard[37]){ // left arrow key
        camera.rotation.y -= player.turnSpeed;
    }
    if(keyboard[39]){ // right arrow key
        camera.rotation.y += player.turnSpeed;
    }

    // shoot a bullet
    if(keyboard[32] && player.canShoot <= 0){ // spacebar key
        // creates a bullet as a Mesh object
        var bullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.05,8,8),
            new THREE.MeshBasicMaterial({color:0xffffff})
        );

        // position the bullet to come from the player's weapon
        bullet.position.set(
            meshes["arma"].position.x,
            meshes["arma"].position.y + 0.15,
            meshes["arma"].position.z
        );

        // set the velocity of the bullet
        bullet.velocity = new THREE.Vector3(
            -Math.sin(camera.rotation.y),
            0,
            Math.cos(camera.rotation.y)
        );

        bullet.alive = true;
        setTimeout(function(){
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000);

        bullets.push(bullet);
        scene.add(bullet);
        player.canShoot = 10;
    }

    if(keyboard[49]) { //up arrow
        modelArma = models.uzi.mesh.clone();
        scene.remove(meshes["arma"]);
        onResourcesLoaded();
    }
    if(keyboard[50]) { //up arrow
        modelArma = models.uzi2.mesh.clone();
        scene.remove(meshes["arma"]);
        onResourcesLoaded();
    }
    if(keyboard[51]) { //up arrow
        modelArma = models.machine.mesh.clone();
        scene.remove(meshes["arma"]);
        onResourcesLoaded();
    }


    if(player.canShoot > 0) player.canShoot -= 1;

    // position the gun in front of the camera
    meshes["arma"].position.set(
        camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
        camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
        camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
    );
    meshes["arma"].rotation.set(
        camera.rotation.x,
        camera.rotation.y - Math.PI,
        camera.rotation.z
    );

    renderer.render(scene, camera);
}

function createEnviroment(){
    var envGeometry = new THREE.SphereGeometry(500, 500, 500);
    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/sky.jpg');
    envMaterial.side = THREE.BackSide;
    var envMesh = new THREE.Mesh(envGeometry, envMaterial);
    scene.add(envMesh);


}


function keyDown(event){
    keyboard[event.keyCode] = true;
}

function keyUp(event){
    keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;