#version 300 es
precision highp float;

in vec2 fs_Pos;
out vec4 out_Col;
uniform float u_Time;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

vec3 pal(float t) {
    const vec3 color1 = vec3(0.94, 0.83, 0.34); // 金黄色
    const vec3 color2 = vec3(0.99, 0.35, 0.35); // 红色

    return mix(color1, color2, t);
}

void main() {
    float t = (fs_Pos.y + 1.0) * 0.5;

    float n = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    int octaves = 4;

    for(int i = 0; i < octaves; i++) {
        n += amplitude * noise(fs_Pos * frequency + u_Time * 0.1);
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    n = clamp(n, 0.0, 1.0);

    t += 0.1 * (n - 0.5); 
    t = clamp(t, 0.0, 1.0); 
    vec3 color = pal(t);

    out_Col = vec4(color, 1.0);
}
