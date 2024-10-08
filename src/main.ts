import {vec3} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  color1: [255, 128, 0],
  color2: [255, 255, 0],
  color3: [255, 0, 0],
  amplitude: 0.3,
  frequency: 3.0,
  timeSpeed: 0.5,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;

let backgroundQuad: Square;
let backgroundShaderProgram: ShaderProgram;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  //gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  // add controls for RGB
  gui.addColor(controls, 'color1');
  gui.addColor(controls, 'color2');
  gui.addColor(controls, 'color3');

  gui.add(controls, 'amplitude', 0.1, 1.0);
  gui.add(controls, 'frequency', 0.1, 5.0);
  gui.add(controls, 'timeSpeed', 0.01, 3.0);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  backgroundShaderProgram = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/background.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/background.frag.glsl')),
  ]);


  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    //new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    //new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-noise.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-noise.frag.glsl')),
  ]);


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.disable(gl.DEPTH_TEST);

    renderer.renderBG(camera, backgroundShaderProgram, [
      square,
    ]);

    gl.enable(gl.DEPTH_TEST);
    //renderer.clear();

    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    const colorVecs = [
        vec3.fromValues(
        controls.color1[0] / 255, // Normalize to [0, 1]
        controls.color1[1] / 255,
        controls.color1[2] / 255,
      ),
      vec3.fromValues(
        controls.color2[0] / 255,
        controls.color2[1] / 255,
        controls.color2[2] / 255,
      ),
      vec3.fromValues(
        controls.color3[0] / 255,
        controls.color3[1] / 255,
        controls.color3[2] / 255,
      ),
    ];

    const otherUniforms = vec3.fromValues(
      controls.amplitude,
      controls.frequency,
      controls.timeSpeed
    );

    renderer.render(camera, lambert, [
      icosphere,
      //square,
      //cube,
    ], colorVecs, otherUniforms);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
