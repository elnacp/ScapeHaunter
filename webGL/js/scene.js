var renderer;
var scene;
var camera;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function init(){
    scene = new THREE.Scene();
    createCamera();
    //createFigure();
    createHaunter();
    //createEnviroment();
    createRenderer();
    createLight();
    document.body.appendChild(renderer.domElement);
    render();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('key', keyFunction, false);
}

function onDocumentMouseMove(event){
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
}

window.addEventListener("keydown", function(e){
    
});

function render(){
    cameraControl.update();
    //scene.getObjectByName('character').getChildByName('model').scale = 0.5;
    //scene.getObjectByName('earth').rotation.y += 0.005;
    //scene.getObjectByName('nubes').rotation.y += 0.005;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function createRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera(){
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth/ window.innerHeight,
        0.1, 1000);
    cameraControl = new THREE.OrbitControls(camera);
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 500;
    camera.lookAt(scene.position);
}


function createLight(){
    //var spotLight = new THREE.SpotLight(0xffffff);
    //spotLight.position.set(10,20,20);
    //spotLight.shadow.camera.near = 20;
    //spotLight.shadow.camera.far = 50;
    //spotLight.castShadow = true;
    //scene.add(spotLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(0, 500, 500);
    directionalLight.name = 'directional';
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

}

function createFigureMaterial(){

    var earthTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/lee_diffuse.jpg' , function(image) {
        earthTexture.image = image;
        earthTexture.needsUpdate = true;
    });
    var earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = earthTexture;

    var normalMap = new THREE.Texture();
    loader.load('assets/lee_normal_tangent.jpg', function(image){
        normalMap.image = image;
        normalMap.needsUpdate = true;
    });
    earthMaterial.normalMap = normalMap;
    earthMaterial.normalScale = new THREE.Vector2(1.0,1.0);

    var specularMap = new THREE.Texture();
    loader.load('assets/lee_spec.jpg', function(image){
        specularMap.image = image;
        specularMap.needsUpdate = true;
    });
    earthMaterial.specularMap = specularMap;
    earthMaterial.specular = new THREE.Color(0x262626);


    return earthMaterial;
}




function createEnviroment(){
    var envGeometry = new THREE.SphereGeometry(500, 500, 500);
    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/galaxy_starfield.png');
    envMaterial.side = THREE.BackSide;
    var envMesh = new THREE.Mesh(envGeometry, envMaterial);
    scene.add(envMesh);
}


/*
//OBJECTE
function createFigure(){
    var material = new THREE.MeshPhongMaterial();
    loader = new THREE.OBJLoader();
    loader.load('assets/lee.obj', function(object){
        object.traverse(function (child) {
            if(child instanceof  THREE.Mesh){
                child.material = createFigureMaterial();
                child.receiveShadow = true;
                child.castShadow = true;
                child.name = "model";
            }
        });
        scene.add(object);
    });
}
*/

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
        object.position.set(0,0,100);
        object.scale.set(0.25,0.25,0.25);
        object.rotation.y = 3.25;
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





init();
