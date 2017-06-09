
var scene, camera, renderer, mesh, clock;
var meshFloor, ambientLight;
var lights = {};
var crate, crateTexture, crateNormalMap, crateBumpMap;
var modelArma;
var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var USE_WIREFRAME = false;
var min_c;
var max_c;
var kills = 0;
var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
    box: new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 0.5, 0.5),
        //new THREE.BoxGeometry(0.5,0.5,0.5),
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
        obj:"models/flamethrowerHandle.obj",
        mtl:"models/flamethrowerHandle.mtl",
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


    createEscenari();

    backgroundMusic();
    /*meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20, 10,10),
        new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);*/


    createLight();



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

function createLight(){

    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    light = new THREE.SpotLight(0xffffff, 5, 18);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    light.position.set(30,10,10);
    scene.add(light);
    console.log("added");

    light2 = new THREE.SpotLight(0xffffff, 5, 18);
    light2.castShadow = true;
    light2.shadow.camera.near = 0.1;
    light2.shadow.camera.far = 25;
    light2.position.set(0,1,0);
    scene.add(light2);
    console.log("added");

    light3 = new THREE.SpotLight(0xffffff, 5, 18);
    light3.castShadow = true;
    light3.shadow.camera.near = 0.1;
    light3.shadow.camera.far = 25;
    light3.position.set(30,10,30);
    scene.add(light3);
    console.log("added");

    light4 = new THREE.SpotLight(0xffffff, 5, 18);
    light4.castShadow = true;
    light4.shadow.camera.near = 0.1;
    light4.shadow.camera.far = 25;
    light4.position.set(-30,10,-30);
    scene.add(light4);
    console.log("added");
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
            }
        });
        object.name = 'character';
        object.position.set(Math.random() * 500, 1, Math.random() * 500);
        object.scale.set(0.0025,0.0025,0.0025);
        object.rotation.y = 3.25;
        min_c = new THREE.Vector3(object.position.x, object.position.y-100, object.position.z-100);
        max_c = new THREE.Vector3(object.position.x, object.position.y+100, object.position.z+100);
        meshes['character'] = object;
        //haunters[i] = object;
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

function createEscenari(){
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load("assets/Escenari.mtl", function(materials){

        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load("assets/Escenari.obj", function(mesh){

            mesh.traverse(function(node){
                if( node instanceof THREE.Mesh ){
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            scene.add(mesh);
            mesh.position.set(50, 0, -60);
            mesh.scale.set(0.10, 0.10, 0.10);
            mesh.rotation.y = -Math.PI/4;
        });

    });

    mtlLoader.load("assets/fence.mtl", function(materials){

        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load("assets/fence.obj", function(mesh){

            mesh.traverse(function(node){
                if( node instanceof THREE.Mesh ){
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            scene.add(mesh);
            mesh.position.set(50, 0, -60);
            mesh.scale.set(0.10, 0.10, 0.10);
            mesh.rotation.y = -Math.PI/4;
        });
    });

    var material = new THREE.MeshPhongMaterial();

    loader = new THREE.OBJLoader();
    loader.load('assets/Plane.obj', function(object1){
        object1.traverse(function (child) {
            if(child instanceof  THREE.Mesh){

                child.material = planeMaterial();
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        object1.position.set(0, 0, 0);
        scene.add(object1);
    });
}



function planeMaterial(){
    var earthTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/background.png' , function(image) {
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

function backgroundMusic(){
    var listener = new THREE.AudioListener();
    var audioLoader = new THREE.AudioLoader();
    var sound2 = new THREE.PositionalAudio( listener );
    audioLoader.load( 'assets/Cancion del titere.mp3', function( buffer ) {
        sound2.setBuffer( buffer );
        sound2.setRefDistance( 20 );
        sound2.play();
    });
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
        if( scene.getObjectByName('character')) {
            if (collisionBullet(bullets[index])) {
                scene.remove(scene.getObjectByName('character'));
                document.getElementById('kills').innerHTML = "DEAD";
                kills++;
                document.getElementById('kills').innerHTML = kills;
                //console.log('dead');
                createHaunter();
            }
        }
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

    if(keyboard[49]) { //number 1
        modelArma = models.uzi.mesh.clone();
        scene.remove(meshes["arma"]);
        onResourcesLoaded();
    }
    if(keyboard[50]) { //number 2
        modelArma = models.uzi2.mesh.clone();

        scene.remove(meshes["arma"]);
        onResourcesLoaded();
    }
    if(keyboard[51]) { //number 3
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

    if( scene.getObjectByName('character')){
        setupAI();
        if(collision()){
            console.log("DEAD");
            var h1 = document.createElement('h1');
            h1.innerHTML = "GAME OVER";
            var div = document.getElementById('gameover');
            div.appendChild(h1);


        }
    }


    renderer.render(scene, camera);




}

function setupAI(){
    var char = scene.getObjectByName('character');
    char.lookAt(camera.position);
    char.translateOnAxis(char.worldToLocal(new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z)), 0.00002);
}

function createEnviroment(){
    var envGeometry = new THREE.SphereGeometry(500, 500, 500);
    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/galaxy_starfield.png');
    envMaterial.side = THREE.BackSide;
    var envMesh = new THREE.Mesh(envGeometry, envMaterial);
    scene.add(envMesh);


}

function collision(){
    var char = scene.getObjectByName('character');
    if((meshes["arma"].position.x >= char.position.x-1) && (meshes["arma"].position.x <= char.position.x+1)){
        if((meshes["arma"].position.y >= char.position.y-1) && (meshes["arma"].position.y <= char.position.y+1)){
            if((meshes["arma"].position.z >= char.position.z-1) && (meshes["arma"].position.z <= char.position.z+1)){
                return true;
            }
        }
    }
    return false;
}

function collisionBullet(bullet){
    var char = scene.getObjectByName('character');
    if((bullet.position.x >= char.position.x-1) && (bullet.position.x <= char.position.x+1)){
        if((bullet.position.y >= char.position.y-1) && (bullet.position.y <= char.position.y+1)){
            if((bullet.position.z >= char.position.z-1) && (bullet.position.z <= char.position.z+1)){
                return true;
            }
        }
    }
    return false;

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