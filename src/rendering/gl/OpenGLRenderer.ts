import {mat4, vec4, vec3} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  renderBG(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);

    const time = performance.now()/ 10;
    prog.setTime(time);
    
    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }


  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, colorVec: vec3[], otherUniforms: vec3) {
    let model = mat4.create();
    let viewProj = mat4.create();
    //let color = vec4.fromValues(1, 1, 0, 1);
    let color1 = vec4.fromValues(colorVec[0][0], colorVec[0][1], colorVec[0][2], 1.0);
    let color2 = vec4.fromValues(colorVec[1][0], colorVec[1][1], colorVec[1][2], 1.0);
    let color3 = vec4.fromValues(colorVec[2][0], colorVec[2][1], colorVec[2][2], 1.0);

    let amplitude = otherUniforms[0];
    let frequency = otherUniforms[1];
    let timeSpeed = otherUniforms[2];

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);

    prog.setGeometryColor1(color1);
    prog.setGeometryColor2(color2);
    prog.setGeometryColor3(color3);

    prog.setAmplitude(amplitude);
    prog.setFrequency(frequency);

    const time = performance.now()/ 10;
    prog.setTime(timeSpeed * time);
    
    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
