
//## GPU Canvas setup ...

var gl; var glcanvas;

//# create and attach the shader program to the webGL context
var attributes, uniforms, program;

setup_gl_canvas("obj_canvas");

//# attach shader
attachShader({
fragmentShaderName: 'shader-fs',
vertexShaderName: 'shader-vs',
attributes: ['aVertexPosition'],
uniforms: ['someVal', 'uSampler'],
});

// some webGL initialization
gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.clearDepth(1.0);
gl.disable(gl.DEPTH_TEST);

positionsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
var positions = [
  -1.0, -1.0,
   1.0, -1.0,
   1.0,  1.0,
  -1.0,  1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

var vertexColors = [0xff00ff88,0xffffffff];
    
var cBuffer = gl.createBuffer();

verticesIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);

var vertexIndices = [ 0,  1,  2,      0,  2,  3, ];

gl.bufferData(  
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(vertexIndices), gl.STATIC_DRAW
            );

texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

//# must be LINEAR to avoid subtle pixelation (double-check this... test other options like NEAREST)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindTexture(gl.TEXTURE_2D, null);

function setup_gl_canvas( input_canvas )
{
	glcanvas = document.getElementById( input_canvas );
	gl = ( ( glcanvas.getContext("webgl2") ) || ( glcanvas.getContext("experimental-webgl") ) );
	
	//# check if we got WebGL
	let gl_is_webgl = false; // assume "false" at beginning
	
	if ( gl instanceof WebGLRenderingContext ) { gl_is_webgl = true; }
	if ( gl instanceof WebGL2RenderingContext ) { gl_is_webgl = true; }
	
	//# confirm if WebGL is available..
	if (gl && (gl_is_webgl == true) ) 
	{ console.log( "WebGL is available"); }
	else { console.log( "WebGL is NOT available" ); } //# use regular JS canvas functions if this happens...
}

function attachShader( params ) 
{
    fragmentShader = getShaderByName(params.fragmentShaderName);
    vertexShader = getShaderByName(params.vertexShaderName);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    { alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program)); }

    gl.useProgram(program);

    // get the location of attributes and uniforms
    attributes = {};

    for (var i = 0; i < params.attributes.length; i++) 
    {
        var attributeName = params.attributes[i];
        attributes[attributeName] = gl.getAttribLocation(program, attributeName);
        gl.enableVertexAttribArray(attributes[attributeName]);
    }
        
    uniforms = {};

    for (i = 0; i < params.uniforms.length; i++) 
    {
        var uniformName = params.uniforms[i];
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        
        gl.enableVertexAttribArray(attributes[uniformName]);
    }
    
}

function getShaderByName( id ) 
{
    var shaderScript = document.getElementById(id);
	var theSource = "";
    var currentChild = shaderScript.firstChild;

    while(currentChild) 
    {
        if (currentChild.nodeType === 3) { theSource += currentChild.textContent; }
        currentChild = currentChild.nextSibling;
    }

    var result;
    
    if (shaderScript.type === "x-shader/x-fragment") 
    { result = gl.createShader(gl.FRAGMENT_SHADER); } 
    else { result = gl.createShader(gl.VERTEX_SHADER); }
    
    gl.shaderSource(result, theSource);
    gl.compileShader(result);

    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) 
    {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(result));
        return null;
    }
    return result;
}

// update the texture from the video
function updateTexture()
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    //# next line fails in Safari if input video is NOT from same domain/server as this html code
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
    gl.UNSIGNED_BYTE, video);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
