uniform mat4 mgMVPMatrix;

uniform float fogTopHeight;
uniform float fogTopInten;
uniform float fogBotHeight;
uniform float fogBotInten;
uniform float fogMaxDist;

attribute vec3 vertPoint;

varying vec3 modelPt;
varying float fogSlope;

void main(void) 
{ 
  modelPt = vertPoint;

  vec4 pt;
  pt.xyz = vertPoint;
  pt.w = 1.0;
  gl_Position = mgMVPMatrix * pt; 

  fogSlope = (fogTopInten - fogBotInten) / (fogTopHeight - fogBotHeight);
}
