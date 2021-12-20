var gl;
var theta = 0.0;

var thetaLoc, colorLoc;
var mouse_down = false;
var tri_click = false;
var line_click = false;
var track_Mouse = false;
var trackball_move = false;
var delay = 100;
var direction = true;
var vBuffer, cBuffer, iBuffer, nBuffer;
var rotationQuaternion = vec4(1, 0, 0, 0);
var rotationQuaternionLoc;
var last_cursor_pos = [0, 0, 0];
var curx, cury;
var startX, startY;
var program;
var x, y, ndc_x, ndc_y, wc_x, wc_y, z, ndc_z, wc_z;
// var points = [];
var coordinates;
var max_prims = 200, num_triangles = 0;
var b = 0;
var vPosition, vColor, Rmatrix, vNormal;

var projectionMatrix;
var triangle = [];
// var triangle_color = [];

var lines = [];
var lines_color = [];

var tri_count = -1;
var line_count = -1;
var angle = 0.0;
var axis = [0, 0, 1];
// var vertices;

var X = false;
var Y = false;
var Z = false;

const eye = vec3(0, 10, 10);
const at = vec3(0.0, 0.0, -1.0);
const up = vec3(0.0, 1.0, 0.0);

const fov = 80;
const near = 1;
const far = 500;
var cube;
var arr;
var light_x, light_y, light_z, D_red, D_green, D_yellow, S_red, S_green, S_yellow, Shine;
var theta_y = 0.0;
var matrix_z, matrix_y, matrix_x, matrix;
var radius = 0;
var theta = 0;
var teapot = createTeapotGeometry(10)
// console.log(teapot)
window.onload = function init() {

	var light_x_slider = document.getElementById("light_x")
    light_x = light_x_slider.value;
    light_x_slider.oninput = function() {
        light_x = light_x_slider.value;
		render();
    }

	var light_y_slider = document.getElementById("light_y")
    light_y = light_y_slider.value;
    light_y_slider.oninput = function() {
        light_y = light_y_slider.value;
		render();
    }

	var light_z_slider = document.getElementById("light_z")
    light_z = light_z_slider.value;
    light_z_slider.oninput = function() {
        light_z = light_z_slider.value;
		render();
    }

	var D_red_slider = document.getElementById("D_red")
    D_red = D_red_slider.value;
    D_red_slider.oninput = function() {
        D_red = D_red_slider.value;
		render();
    }

	var D_green_slider = document.getElementById("D_green")
    D_green = D_green_slider.value;
    D_green_slider.oninput = function() {
        D_green = D_green_slider.value;
		render();
    }

	var D_yellow_slider = document.getElementById("D_yellow")
    D_yellow = D_yellow_slider.value;
    D_yellow_slider.oninput = function() {
        D_yellow = D_yellow_slider.value;
		render();
    }

	var S_red_slider = document.getElementById("S_red")
    S_red = S_red_slider.value;
    S_red_slider.oninput = function() {
        S_red = S_red_slider.value;
		render();
    }

	var S_green_slider = document.getElementById("S_green")
    S_green = S_green_slider.value;
    S_green_slider.oninput = function() {
        S_green = S_green_slider.value;
		render();
    }

	var S_yellow_slider = document.getElementById("S_yellow")
    S_yellow = S_yellow_slider.value;
    S_yellow_slider.oninput = function() {
        S_yellow = S_yellow_slider.value;
		render();
    }

	var Shine_slider = document.getElementById("Shine")
    Shine = Shine_slider.value;
    Shine_slider.oninput = function() {
        Shine = Shine_slider.value;
		render();
	}


	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.clearDepth(1.0);                 // Clear everything
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL); 
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	vPosition = gl.getAttribLocation(program, "vPosition");
	vColor = gl.getAttribLocation(program, "vColor");

	Rmatrix = gl.getUniformLocation(program, "rotation_matrix");

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot[1]), gl.STATIC_DRAW);
	vNormal = gl.getAttribLocation(program, "Normal");
	gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

    rotationQuaternionLoc = gl.getUniformLocation(program, "quat_t");
    gl.uniform4fv(rotationQuaternionLoc, flatten(rotationQuaternion));

    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      start(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stop(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMoment(x, y);
    } );

	updateVertices();

	render();

};

function render(){

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	matrix = [[1,0,0,0],
			  [0,1,0,0],
			  [0,0,1,0],
			  [0,0,0,1]];

	theta_y -= 0.01;
	if(theta_y>360.0){
		theta_y -=360;
	}
	gl.uniform1f(thetaLoc, theta_y);
	matrix_y = [[Math.cos(theta_y), 0, Math.sin(theta_y), 0],
					[0, 1, 0, 0],
					[-Math.sin(theta_y), 0, Math.cos(theta_y), 0],
					[0, 0, 0, 1]];


	var dot_y_x = dotprod(matrix_y, matrix);
	var dot_z_y_x = dotprod(matrix, dot_y_x);

	gl.uniformMatrix4fv(Rmatrix, false, flatten(dot_z_y_x));
	
	gl.uniformMatrix4fv(Rmatrix, false, flatten(matrix));
	if(trackball_move) {
		axis = normalize(axis);
		var c = Math.cos(angle/2.0);
		var s = Math.sin(angle/2.0);
  
		var rotation = vec4(c, s*axis[0], s*axis[1], s*axis[2]);
		rotationQuaternion = multq(rotationQuaternion, rotation);
  
		gl.uniform4fv(rotationQuaternionLoc, flatten(rotationQuaternion));

	}
	

	updateVertices();
    gl.drawArrays( gl.TRIANGLES, 0, teapot[0].length);

	// requestAnimationFrame(render);
}

function updateVertices() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	var aspectRatio = gl.canvas.width / gl.canvas.height;
    projectionMatrix = perspective(fov, aspectRatio, near, far);
    // projectionMatrix  = perspective(80, aspectRatio, near, far);

    var projectionmatrixloc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionmatrixloc, false, flatten(projectionMatrix));

    var modelviewmatrix = lookAt(eye, at, up);
    var modelviewmatrixloc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelviewmatrixloc, false, flatten(modelviewmatrix));
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot[0]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vPosition);

	// var nBuffer = gl.createBuffer();


	var shininess = gl.getUniformLocation(program, "shininessVal");
    gl.uniform1f(shininess, Shine);
	
	var lightposLoc = gl.getUniformLocation(program, "lightpos");
	gl.uniform4fv(lightposLoc, flatten([light_x, light_y, light_z, 1.0]));

	var la = vec4(0.2, 0.2, 0.2, 1.0);
	var ma = vec4(0.0, 1.0, 0.0, 1.0);
	var ka_loc = gl.getUniformLocation(program, "Ka");
	gl.uniform4fv(ka_loc, flatten(mult(la, ma) ));

	var ld = vec4(D_red, D_green, D_yellow, 1.0);
	var md = vec4(1.0, 1.0, 1.0, 1.0);
	var kd_loc = gl.getUniformLocation(program, "Kd");
	gl.uniform4fv(kd_loc, flatten(mult(ld, md) ));

	var ls = vec4(S_red, S_green, S_yellow, 1.0);	
	var ms = vec4(1.0, 1.0, 1.0, 1.0);
	var ks_loc = gl.getUniformLocation(program, "Ks");
	gl.uniform4fv(ks_loc, flatten(mult(ls, ms) ));

    // gl.drawArrays( gl.TRIANGLES, 0, 19200);
};

function translate2d(tx, ty) {
	var t = [[1, 0, tx, 0], [0, 1, ty, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
	return t;
};

function scale2d(sx, sy) {
	var s = [[sx, 0, 0, 0], [0, sy, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
	return s;
};

// https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
function dotprod(a, b) {
	var aNumRows = a.length, aNumCols = a[0].length,
		bNumRows = b.length, bNumCols = b[0].length,
		m = new Array(aNumRows);  // initialize array of rows
	for (var r = 0; r < aNumRows; ++r) {
		m[r] = new Array(bNumCols); // initialize the current row
		for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
				m[r][c] += a[r][i] * b[i][c];
			}
		}
	}
	return m;
};


function lookAt(eye, at, up) {
	if (!Array.isArray(eye) || eye.length != 3) {
	  throw "lookAt(): first parameter [eye] must be an a vec3";
	}
  
	if (!Array.isArray(at) || at.length != 3) {
	  throw "lookAt(): first parameter [at] must be an a vec3";
	}
  
	if (!Array.isArray(up) || up.length != 3) {
	  throw "lookAt(): first parameter [up] must be an a vec3";
	}
  
	if (equal(eye, at)) {
	  return mat4();
	}
  
	var v = normalize(subtract(up, eye)); // view direction vector
	var n = normalize(cross(v, at)); // perpendicular vector
	var u = normalize(cross(n, v)); // "new" up vector
  
	v = negate(v);
  
	var result = mat4(
	  vec4(n, -dot(n, eye)),
	  vec4(u, -dot(u, eye)),
	  vec4(v, -dot(v, eye)),
	  vec4()
	);
  
	return result;
}

function perspective(fovy, aspect, near, far) {
	var f = 1.0 / Math.tan(radians(fovy) / 2);
	var d = far - near;
  
	var result = mat4();
	result[0][0] = f / aspect;
	result[1][1] = f;
	result[2][2] = -(near + far) / d;
	result[2][3] = -2 * near * far / d;
	result[3][2] = -1;
	result[3][3] = 0.0;
  
	return result;
  }

  function multq( a,  b)
  {
	 // vec4(a.x*b.x - dot(a.yzw, b.yzw), a.x*b.yzw+b.x*a.yzw+cross(b.yzw, a.yzw))
  
	 var s = vec3(a[1], a[2], a[3]);
	 var t = vec3(b[1], b[2], b[3]);
	//  console.log(a);
	//  console.log(b);
	 return(vec4(a[0]*b[0] - dot(s,t), add(cross(t, s), add(scale(a[0],t), scale(b[0],s)))));
  }
  
  
  function trackballView( x,  y ) {
	  var d, a;
	  var v = [];
  
	  v[0] = x;
	  v[1] = y;
  
	  d = v[0]*v[0] + v[1]*v[1];
	  if (d < 1.0)
		v[2] = Math.sqrt(1.0 - d);
	  else {
		v[2] = 0.0;
		a = 1.0 /  Math.sqrt(d);
		v[0] *= a;
		v[1] *= a;
	  }
	  return v;
  }
  
  function mouseMoment( x,  y)
  {
	  var dx, dy, dz;
  
	  var cursor_pos = trackballView(x, y);
	  if(track_Mouse) {
		  console.log("Hey");
		dx = cursor_pos[0] - last_cursor_pos[0];
		dy = cursor_pos[1] - last_cursor_pos[1];
		dz = cursor_pos[2] - last_cursor_pos[2];
  
		if (dx || dy || dz) {
			angle = -0.5 * Math.sqrt(dx*dx + dy*dy + dz*dz);


			axis[0] = last_cursor_pos[1]*cursor_pos[2] - last_cursor_pos[2]*cursor_pos[1];
			axis[1] = last_cursor_pos[2]*cursor_pos[0] - last_cursor_pos[0]*cursor_pos[2];
			axis[2] = last_cursor_pos[0]*cursor_pos[1] - last_cursor_pos[1]*cursor_pos[0];

			last_cursor_pos[0] = cursor_pos[0];
			last_cursor_pos[1] = cursor_pos[1];
			last_cursor_pos[2] = cursor_pos[2];
		}
	  }
	   render();
  }
  
  function start( x,  y)
  {
	  track_Mouse = true;
	  startX = x;
	  startY = y;
	  curx = x;
	  cury = y;
  
	  last_cursor_pos = trackballView(x, y);
	trackball_move=true;
  }
  
  function stop( x,  y)
  {
	  track_Mouse = false;
	  if (startX != x || startY != y) {
	  }
	  else {
		   angle = 0.0;
		   trackball_move = false;
	  }
  }
  