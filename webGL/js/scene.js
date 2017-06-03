var renderer;
var scene;
var camera;

function init(){
    scene = new THREE.Scene();
    createFigure();
    createEnviroment();
    createRenderer();
    createCamera();
    createLight();

    document.body.appendChild(renderer.domElement);
    render();
}

function render(){
    cameraControl.update();
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
    camera.position.x = 90;
    camera.position.y = 32;
    camera.position.z = 32;
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
    directionalLight.position.set(100, 10, -50);
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
    var envGeometry = new THREE.SphereGeometry(90, 32, 32);
    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/galaxy_starfield.png');
    envMaterial.side = THREE.BackSide;
    var envMesh = new THREE.Mesh(envGeometry, envMaterial);
    scene.add(envMesh);
}



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






init();
