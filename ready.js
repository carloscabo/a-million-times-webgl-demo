var
  scene,
  camera,
  renderer,
  materials = {},
  digits = [],
  π = Math.PI,
  delay_between_cols = 250,
  clock_anim_duration = 2500,
  timeout_between_animations = 7500,
  rotation = 0;

$(document).ready(function(){
  //La magia aquí
  scene  = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias:true
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color( 0x323232 ), 1);
  document.body.appendChild( renderer.domElement );

  materials.grey = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide
  });
  materials.white = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  materials.red = new THREE.MeshBasicMaterial({
    color: 0x990000,
    side: THREE.DoubleSide
  });

  // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // cube     = new THREE.Mesh( geometry, material );
  // scene.add( cube );

  var
    digits_num = 4,
    rows   = 5,
    cols   = 3,
    radius = 1,
    stroke = 0.1,
    xy_offset = ( radius * 2 ) + ( stroke * 2 );

  for (var d = 0; d < digits_num; d++) {
    var digit = [];
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) {
        row.push( new Clock3D( radius, stroke ) );
        row[ row.length -1 ].position.x = ( d * xy_offset * cols ) + ( j * xy_offset );
        row[ row.length -1 ].position.y = i * xy_offset * -1;
      }
      digit.push( row );
    }
    digits.push( digit );
  }

  var clock_w = (xy_offset * cols * digits_num) + xy_offset;
  var fov = 5;
  // Adjust camera to fit clock in screen width
  var dist = clock_w / 2 /  (window.innerWidth / window.innerHeight) / Math.tan(Math.PI * fov / 360);
  console.log( dist );
  camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.x = xy_offset * cols * digits_num / 2 - xy_offset / 2;
  camera.position.y = ( (rows - 1) * xy_offset ) / 2 * -1;
  camera.position.z = dist;

  // Preprocess chars from human readeable to radians
  convertCharsToRad();

  // Initial clock setting
  updateSeconds();
  setCurrentTimeAnalog();

  setInterval( function() {
    updateSeconds();
  }, 500 );

  render();
	// renderer.render( scene, camera );

});

// Scene render loop
function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

// Clock 3D Object constructor
function Clock3D ( rad, stk ) {

  var
    g, // geometry
    clock = new THREE.Object3D();

  // Clock sphere
  g = new THREE.RingGeometry( rad, rad + (stk/2), 64 );
  sp = new THREE.Mesh( g, materials.grey );
  clock.add( sp );

  // sec
  g = new THREE.PlaneGeometry( rad - (stk*1), 0.025, 1 );
  g.translate( (rad - (stk*1)) / 2, 0, -0.1 );
  sec = new THREE.Mesh( g, materials.red );
  sec.geometry.dynamic = true;
  sec.rotateZ( π / 2 );
  clock.add( sec );

  // Min
  g = new THREE.PlaneGeometry( rad - (stk*1.5), stk, 1 );
  g.translate( (rad - (stk*1.5)) / 2, 0, 0 );
  min = new THREE.Mesh( g, materials.white );
  min.rotateZ( π / 2 );
  clock.add( min );

  // hour
  g = new THREE.PlaneGeometry( rad - (stk*1.5), stk, 1 );
  g.translate( (rad - (stk*1.5)) / 2, 0, 0 );
  hour = new THREE.Mesh( g, materials.white );
  hour.rotateZ( π / 2 );
  clock.add( hour );

  // Clock axis
  g = new THREE.CircleGeometry( stk/2, 32 );
  g.translate( 0, 0, 0.1 );
  ax = new THREE.Mesh( g, materials.white );
  clock.add( ax );

  scene.add( clock );
  return clock;
}

// Updates clock's seconds to current time
function updateSeconds() {
  var
    d = new Date(),
    s = d.getSeconds();
  // console.log(s);
  for (var d = 0; d < digits.length; d++) {
    for (var i = 0; i < digits[d].length; i++) {
      for (var j = 0; j < digits[d][i].length; j++) {
        digits[d][i][j].children[1].rotation.z = timeToRad ( s, 60 );
      }
    }
  }
}

// Updates clock's matrix to current time in digital format
function setCurrentTimeDigital() {
  var
    current = getCurrentHourCharArray();
  for (var d = 0; d < digits.length; d++) {
    for (var i = 0; i < digits[d].length; i++) {
      for (var j = 0; j < digits[d][i].length; j++) {
        // digits[d][i][j].children[2].rotation.z = chars[ current[d] ][i][j][0];
        // digits[d][i][j].children[3].rotation.z = chars[ current[d] ][i][j][1];
        var clock_delay = 1000 + ( ( d * (digits[d].length - 1)  + j - i ) * delay_between_cols );
        createjs.Tween.get( digits[d][i][j].children[2].rotation ).wait( clock_delay ).to({ z: chars[ current[d+''] ][i][j][0] }, clock_anim_duration, createjs.Ease.quintInOut);
        createjs.Tween.get( digits[d][i][j].children[3].rotation ).wait( clock_delay ).to({ z: chars[ current[d+''] ][i][j][1] }, clock_anim_duration, createjs.Ease.quintInOut);
      }
    }
  }
  setTimeout( function(){
    setCurrentTimeAnalog();
  }, timeout_between_animations );
}

// Updates clock's matrix to current time in analog format
function setCurrentTimeAnalog() {
  var
    d = new Date(),
    m = d.getMinutes();
    h = d.getHours() % 12 || 0;
  for (var d = 0; d < digits.length; d++) {
    for (var i = 0; i < digits[d].length; i++) {
      for (var j = 0; j < digits[d][i].length; j++) {

        var clock_delay = 1000 + ( ( d * (digits[d].length - 1)  + j - i ) * delay_between_cols );

        createjs.Tween.get( digits[d][i][j].children[2].rotation ).wait( clock_delay ).to({ z: timeToRad ( m, 60 ) }, clock_anim_duration, createjs.Ease.quintInOut);
        createjs.Tween.get( digits[d][i][j].children[3].rotation ).wait( clock_delay ).to({ z: timeToRad ( h, 12 ) }, clock_anim_duration, createjs.Ease.quintInOut);
        // Min
        //digits[d][i][j].children[2].rotation.z = timeToRad ( m, 60 );
        // Hour
        //digits[d][i][j].children[3].rotation.z = timeToRad ( h, 12 );
      }
    }
  }
  setTimeout( function(){
    setCurrentTimeDigital();
  }, timeout_between_animations );
}

// Converts a time value to its radian equivalency
function timeToRad ( value, base ) {
  return ( value / base ) * 2 * π * -1 + ( π / 2);
}

// Converts current time to an array of chars
// 13:45 -> ['1','3','4','5']
function getCurrentHourCharArray () {
  var
    d = new Date(),
    h = d.getHours(),
    m = d.getMinutes();
  return ('' + zeroPad(h) + zeroPad(m) ).split('');
}

// Pad an string with zeros
function zeroPad(i) {
  return (i < 10) ? '0' + i : i ;
}

// Pre-process the char values below to radians, much easier to rotate
// the clock's hands
function convertCharsToRad () {
  $.each(chars, function(index, char) {
    for (var i = 0; i < char.length; i++) {
      for (var j = 0; j < char[i].length; j++) {
        char[i][j][0] = timeToRad ( char[i][j][0], 12 );
        char[i][j][1] = timeToRad ( char[i][j][1], 12 );
      }
    }
  });
}

// The digital characters are defined using the hour positions of the
// clocks hands 0 - 12
var chars = {
  '0': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [6,6], [0,6] ],
    [ [0,6], [0,6], [0,6] ],
    [ [0,6], [0,0], [0,6] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '1': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,3], [6,9], [0,6] ],
    [ [7.5,7.5], [0,6], [0,6] ],
    [ [7.5,7.5], [0,6], [0,6] ],
    [ [7.5,7.5], [0,3], [0,9] ]
  ],
  '2': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,3], [6,9], [0,6] ],
    [ [3,6], [0,9], [0,9] ],
    [ [0,6], [0,3], [6,9] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '3': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,3], [6,9], [0,6] ],
    [ [3,3], [6,9], [0,6] ],
    [ [3,6], [0,9], [0,6] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '4': [
    [ [3,6], [6,9], [6,9] ],
    [ [0,6], [0,6], [0,6] ],
    [ [0,6], [0,3], [0,6] ],
    [ [0,3], [6,9], [0,6] ],
    [ [7.5,7.5], [0,3], [0,9] ]
  ],
  '5': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [3,6], [0,9] ],
    [ [0,3], [0,3], [6,9] ],
    [ [3,6], [0,9], [0,6] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '6': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [3,6], [0,9] ],
    [ [0,6], [0,3], [6,9] ],
    [ [0,6], [0,6], [0,6] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '7': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,3], [6,9], [0,6] ],
    [ [7.5,7.5], [6,9], [0,6] ],
    [ [7.5,7.5], [0,6], [0,6] ],
    [ [7.5,7.5], [0,3], [0,9] ]
  ],
  '8': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [6,9], [0,6] ],
    [ [0,6], [6,9], [0,6] ],
    [ [0,6], [0,0], [0,6] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  '9': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [6,9], [0,6] ],
    [ [0,3], [6,9], [0,6] ],
    [ [7.5,7.5], [0,6], [0,6] ],
    [ [7.5,7.5], [0,3], [0,9] ]
  ],
  'L': [
    [ [3,6], [6,9], [1.5,1.5] ],
    [ [0,6], [0,6], [1.5,1.5] ],
    [ [0,6], [0,6], [1.5,1.5] ],
    [ [0,6], [0,3], [6,9] ],
    [ [0,3], [3,9], [0,9] ]
  ],
  'V': [
    [ [3,6], [3,6], [6,9] ],
    [ [0,6], [0,6], [0,6] ],
    [ [0,6], [0,6], [0,6] ],
    [ [0,4.5], [0,0], [0,7.5] ],
    [ [7.5,7.5], [1.5,10.5], [7.5,7.5] ]
  ],
  'E': [
    [ [3,6], [3,9], [6,9] ],
    [ [0,6], [3,6], [0,9] ],
    [ [0,6], [3,6], [9,9] ],
    [ [0,6], [0,3], [6,9] ],
    [ [0,3], [3,9], [0,9] ]
  ],
};
