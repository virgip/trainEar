//--------------------------- INITIAL VARIABLES

// Useful constant - C2 frequency
var firstMidiFreq = 65.4;

// Parameters
var firstFreq = 20;
var lastFreq = 9680;
var midFreq = Math.sqrt(firstFreq * lastFreq);

var semitonesPerOctave = 12;
var semitoneSubdivisions = 6;

if (semitoneSubdivisions < 1 || Math.floor(semitoneSubdivisions) != semitoneSubdivisions)
  alert("Invalid number of subdivisions. Must be an integer >= 1");

var slowSemitonesPerSec = 0.5;
var midSemitonesPerSec = 2;
var fastSemitonesPerSec = 6;
var lowSpeed;
var midSpeed;
var highSpeed;

var zeroVariationTimeout = 100;

var lastAcceleration = 1024;
var frequencyVariationSpeeds = 4;
var variationSpeedStep = lastAcceleration / frequencyVariationSpeeds;
var zeroVariationThreshold = variationSpeedStep * 1;
var slowVariationThreshold = variationSpeedStep * 2;
var midVariationThreshold = variationSpeedStep * 3;

// Global variables
var givenFreq;
var givenNote;
var tolerance;

var currentFreq = midFreq;
var speed = 0;
var firstTime = true;
var playing = false;
var paused = false;
var pianoMode = false;
var speakerMode = false;

// Defining MIDI notes and respective frequencies for the exercise request
var sharps = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C8'];
var flats = ['C2', 'Db2', 'D2', 'Eb2', 'E2', 'F2', 'Gb2', 'G2', 'Ab2', 'A2', 'Bb2', 'B2', 'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4', 'C5', 'Db5', 'D5', 'Eb5', 'E5', 'F5', 'Gb5', 'G5', 'Ab5', 'A5', 'Bb5', 'B5', 'C6', 'Db6', 'D6', 'Eb6', 'E6', 'F6', 'Gb6', 'G6', 'Ab6', 'A6', 'Bb6', 'B6', 'C7', 'Db7', 'D7', 'Eb7', 'E7', 'F7', 'Gb7', 'G7', 'Ab7', 'A7', 'Bb7', 'B7', 'C8'];

var frequencies = [firstMidiFreq];
for (i = 1; i < sharps.length; i++)
  frequencies.push(frequencies[i-1] * Math.pow(2, 1 / semitonesPerOctave));

  // These are the AudioContext and the pitch shifter oscillator
  var c = new AudioContext();
  var pso = c.createOscillator();
  var g = c.createGain();
  var initialGain = 0.25;
  pso.connect(g).connect(c.destination);
  pso.frequency.value = midFreq / 2; // The sound used for the pitch shifter oscillator is missing the fundamental harmonic, so what we perceive as fundamental is actually the second harmonic, that is one octave above the note we're trying to play, so we need half every frequency related to the PSO

  // Sound design for the pitch shifter oscillator (headphones mode and loudspeaker mode)
  var pipesSines = new Float32Array([0, 0, 1, 0, 1]);
  var pipesCosines = new Float32Array(pipesSines.length);

  var pipesWaveform = c.createPeriodicWave(pipesCosines, pipesSines);

  pso.setPeriodicWave(pipesWaveform);

  var evenSquare = [];
  evenSquare[0] = 0;
  evenSquare[1] = 0;
  for (i = 2; i < 50; i = i + 2) {
    evenSquare[i] = Math.pow(1 / i, 2);
    evenSquare[i+1] = 0;
  }

  var evenSquareSineTerms = new Float32Array(evenSquare);
  var evenSquareCosineTerms = new Float32Array(evenSquareSineTerms.length);

  var evenSquareWaveform = c.createPeriodicWave(evenSquareCosineTerms, evenSquareSineTerms);


//------------------- INSTRUCTIONS

// Switches between instructions in italian and english
function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML === "Connect microBit and then press the START button to generate a request. If you are using loudspeaker and not headphones, remember to press the button near the title to avoid pitch roll! Press START to spin the wheels and then press PLAY to start the sound; move Micro Bit to find the given note. You may stop or restart the sound controlled by Micro Bit using the PLAY/STOP button, or the B button on Micro Bit. When you think you have found it, press the A button on Micro Bit or the SET ANSWER one.") {
    x.innerHTML = "Conneti microBit e poi premi il pulsante START per generare un esercizio. Se stai usando gli altoparlanti e non le cuffie, ricordati di premere il pulsante vicino al titolo perche' non si verifichi pitch roll! Premi START per azionare la slot. Usando il pulsante PLAY/STOP, fai partire o fermare il suono che Micro Bit controlla. Muovi Micro Bit per cercare la nota indicata. Puoi fermare o far ripartire il suono anche premendo il pulsante B su Micro Bit. Quando pensi di aver trovato la nota indicata, premi SET ANSWER o il tasto A su Micro Bit.";
  } else {
    x.innerHTML = "Connect microBit and then press the START button to generate a request. If you are using loudspeaker and not headphones, remember to press the button near the title to avoid pitch roll! Press START to spin the wheels and then press PLAY to start the sound; move Micro Bit to find the given note. You may stop or restart the sound controlled by Micro Bit using the PLAY/STOP button, or the B button on Micro Bit. When you think you have found it, press the A button on Micro Bit or the SET ANSWER one.";
  }
}
changeLanguage();

// Initalizes the "CHANGE LANGUAGE" button
document.querySelector("#language-icon").onclick = changeLanguage;

// Initialize the "Current frequency" indicator
document.querySelector('#showFreq .value').innerHTML = midFreq;


//------------------------- SLOT MACHINE
// Source: https://codepen.io/indamix/pen/lLxcG?editors=0110
// requestAnimationFrame polyfill
var rnd;
function generateRequest() {
  var notes = ['C2 ', 'C#2', 'Db2', 'D2 ', 'D#2', 'Eb2', 'E2 ', 'F2 ', 'F#2', 'Gb2', 'G2 ', 'G#2', 'Ab2', 'A2 ', 'A#2','Bb2', 'B2 ','C3 ', 'C#3', 'Db3', 'D3 ', 'D#3', 'Eb3', 'E3 ', 'F3 ', 'F#3', 'Gb3', 'G3 ', 'G#3', 'Ab3', 'A3 ', 'A#3','Bb3', 'B3 ','C4 ', 'C#4', 'Db4', 'D4 ', 'D#4', 'Eb4', 'E4 ', 'F4 ', 'F#4', 'Gb4', 'G4 ', 'G#4', 'Ab4', 'A4 ', 'A#4','Bb4', 'B4 ','C5 ', 'C#5', 'Db5', 'D5 ', 'D#5', 'Eb5', 'E5 ', 'F5 ', 'F#5', 'Gb5', 'G5 ', 'G#5', 'Ab5', 'A5 ', 'A#5','Bb5', 'B5 ','C6 ', 'C#6', 'Db6', 'D6 ', 'D#6', 'Eb6', 'E6 ', 'F6 ', 'F#6', 'Gb6', 'G6 ', 'G#6', 'Ab6', 'A6 ', 'A#6','Bb6', 'B6 ','C7 ', 'C#7', 'Db7', 'D7 ', 'D#7', 'Eb7', 'E7 ', 'F7 ', 'F#7', 'Gb7', 'G7 ', 'G#7', 'Ab7', 'A7 ', 'A#7','Bb7', 'B7 '];

  rnd = Math.floor(Math.random() * notes.length);

  text = notes[rnd];
  findNote(text);

  givenNote = text;
  if (givenNote.slice(givenNote.length - 1, givenNote.length) == ' ')
    givenNote = givenNote.trim(); // Removes whitespaces at string beginning and end

  givenIndex = sharps.indexOf(givenNote);
  if (givenIndex == -1)
    givenIndex = flats.indexOf(givenNote);

  givenFreq = frequencies[givenIndex];

  // Sets the tolerance for considering the answer close enough to the perfect one, according to (a generous version of) JND
  tolerance = (givenFreq < 600) ? 8 : givenFreq * 0.05;

  console.log("Given note:", givenNote, "(" + givenFreq + "Hz)");

  // Resetting the older notes shown in the graph
  var resetName, resetFlat, resetNote, resetExtLine, i;

  resetName = document.getElementsByClassName("name");
  for (i = 0; i < resetName.length; i++)
    resetName[i].style.visibility = "hidden";

  resetFlat = document.getElementsByClassName(" flat");
  for (i = 0; i < resetFlat.length; i++)
    resetFlat[i].style.visibility = "hidden";

  resetNote = document.getElementsByClassName("note");
  for (i = 0; i < resetNote.length; i++)
    resetNote[i].style.visibility = "hidden";

  resetExtLine = document.getElementsByClassName("extra-line");
  for (i = 0; i < resetExtLine.length; i++)
    resetExtLine[i].style.visibility = "hidden";

  changeVisibility();
}

function findNote(text) {
  console.log("text given", text); // The message displayed
  chars = 'ABCDEFGb #234567ORMIFSL'; // All possible Charactrers
  scale = 50; // Font size and overall scale
  breaks = 0.003; // Speed loss per frame
  endSpeed = 0.05; // Speed at which the letter stops
  firstLetter = 50; // Number of frames untill the first letter stopps (60 frames per second)
  delay = 40; // Number of frames between letters stopping

  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');

  text = text.split('');
  chars = chars.split('');
  charMap = [];
  offset = [];
  offsetV = [];

  for (var i = 0; i < chars.length; i++)
    charMap[chars[i]] = i;

  for (var i = 0; i < text.length; i++) {
    var f = firstLetter + delay * i;
    offsetV[i] = endSpeed + breaks * f;
    offset[i] = -(1 + f) * (breaks * f + 2 * endSpeed) / 2;
  }

  (onresize = function() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  })();

  requestAnimationFrame(loop = function() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#00aae6';
    ctx.fillRect(0, (canvas.height - scale) / 2, canvas.width, scale);
    for (var i = 0; i < text.length; i++) {
      ctx.fillStyle = '#fff9f3';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.setTransform(1, 0, 0, 1, Math.floor((canvas.width - scale * (text.length - 1)) / 2), Math.floor(canvas.height / 2));
      var o = offset[i];
      while (o < 0)
        o++;
      o %= 1;
      var h = Math.ceil(canvas.height / 2 / scale);
      for (var j = -h; j < h; j++) {
        var c = charMap[text[i]] + j - Math.floor(offset[i]);
      while (c < 0)
        c += chars.length;
        c %= chars.length;
        var s = 1 - Math.abs(j + o) / (canvas.height / 2 / scale + 1);
        ctx.globalAlpha = s;
        ctx.font = scale * s + 'px Helvetica';
        ctx.fillText(chars[c], scale * i, (j + o) * scale);
      }
      offset[i] += offsetV[i];
      offsetV[i] -= breaks;
      if (offsetV[i] < endSpeed) {
        offset[i] = 0;
        offsetV[i] = 0;
      }
    }
    requestAnimationFrame(loop);
  });
}

document.getElementById("notation-icon").addEventListener("click", changeNotation);
var alreadyChanged = 0;

// This function changes note notation from anglo-saxon to latin notation and vice versa
function changeNotation() {
  var notes = ['C2 ', 'C#2', 'Db2', 'D2 ', 'D#2', 'Eb2', 'E2 ', 'F2 ', 'F#2', 'Gb2', 'G2 ', 'G#2', 'Ab2', 'A2 ', 'A#2','Bb2', 'B2 ','C3 ', 'C#3', 'Db3', 'D3 ', 'D#3', 'Eb3', 'E3 ', 'F3 ', 'F#3', 'Gb3', 'G3 ', 'G#3', 'Ab3', 'A3 ', 'A#3','Bb3', 'B3 ','C4 ', 'C#4', 'Db4', 'D4 ', 'D#4', 'Eb4', 'E4 ', 'F4 ', 'F#4', 'Gb4', 'G4 ', 'G#4', 'Ab4', 'A4 ', 'A#4','Bb4', 'B4 ','C5 ', 'C#5', 'Db5', 'D5 ', 'D#5', 'Eb5', 'E5 ', 'F5 ', 'F#5', 'Gb5', 'G5 ', 'G#5', 'Ab5', 'A5 ', 'A#5','Bb5', 'B5 ','C6 ', 'C#6', 'Db6', 'D6 ', 'D#6', 'Eb6', 'E6 ', 'F6 ', 'F#6', 'Gb6', 'G6 ', 'G#6', 'Ab6', 'A6 ', 'A#6','Bb6', 'B6 ','C7 ', 'C#7', 'Db7', 'D7 ', 'D#7', 'Eb7', 'E7 ', 'F7 ', 'F#7', 'Gb7', 'G7 ', 'G#7', 'Ab7', 'A7 ', 'A#7','Bb7', 'B7 '];
  var notesIta= ['DO2 ', 'DO#2', 'REb2', 'RE2 ', 'RE#2', 'MIb2', 'MI2 ', 'FA2 ', 'FA#2', 'SOLb2', 'SOL2 ', 'SOL#2', 'LAb2', 'LA2 ', 'LA#2','SIb2', 'SI2 ','DO3 ', 'DO#3', 'REb3', 'RE3 ', 'RE#3', 'MIb3', 'MI3 ', 'FA3 ', 'FA#3', 'SOLb3', 'SOL3 ', 'SOL#3', 'LAb3', 'LA3 ', 'LA#3','SIb3', 'SI3 ','DO4 ', 'DO#4', 'REb4', 'RE4 ', 'RE#4', 'MIb4', 'MI4 ', 'FA4 ', 'FA#4', 'SOLb4', 'SOL4 ', 'SOL#4', 'LAb4', 'LA4 ', 'LA#4','SIb4', 'SI4 ','DO5 ', 'DO#5', 'REb5', 'RE5 ', 'RE#5', 'MIb5', 'MI5 ', 'FA5 ', 'FA#5', 'SOLb5', 'SOL5 ', 'SOL#5', 'LAb5', 'LA5 ', 'LA#5','SIb5', 'SI5 ','DO6 ', 'DO#6', 'REb6', 'RE6 ', 'RE#6', 'MIb6', 'MI6 ', 'FA6 ', 'FA#6', 'SOLb6', 'SOL6 ', 'SOL#6', 'LAb6', 'LA6 ', 'LA#6','SIb6', 'SI6 ','DO7 ', 'DO#7', 'REb7', 'RE7 ', 'RE#7', 'MIb7', 'MI7 ', 'FA7 ', 'FA#7', 'SOLb7', 'SOL7 ', 'SOL#7', 'LAb7', 'LA7 ', 'LA#7','SIb7', 'SI7 '];

  var currentRequest;
  if (alreadyChanged == 0) {
    text = notesIta[rnd];
    findNote(text);
    alreadyChanged = 1;
    return;
  }

  if (alreadyChanged == 1) {
    text = notes[rnd];
    findNote(text);
    alreadyChanged = 0;
    return;
  }
}


//-------------------------- BUTTONS

// This function is called when the "PLAY/STOP" button is pressed, and makes the Micro Bit start/stop making sounds
function playOrStop() {
  if (playing)
    stop();
  else play();
}

function play() {
  g.gain.value = updateGain();
  if (firstTime) {
    pso.start();
    firstTime = false;
  }
  playing = true;
  document.getElementById("playStopButton").innerHTML = "STOP";
}

function stop() {
  g.gain.value = 0;
  playing = false;
  document.getElementById("playStopButton").innerHTML = "PLAY";
}

// Called by the "SET ANSWER" button and by Micro Bit's button A, tells whether the answer is acceptable, or whether the user needs to move the pitch up or down
function setAnswer() {
  console.log("My answer is", currentFreq);
  let target = givenFreq;
  var error = currentFreq - target;
  var percError = Math.abs((error / currentFreq)) * 100;
  console.log("current fre: ", currentFreq);
  console.log("target: ", target);
  console.log("error: ", error);
  console.log("perc error: ", percError);

  if (Math.abs(currentFreq - givenFreq) <= tolerance) {
    victory();
    pointerColor();
    generateRequest();
  } else if (currentFreq > target) {
    if (percError > 80)
      rangeChange(70);
    if (percError <= 80 && percError > 60)
      rangeChange(60);
    if (percError <= 60 && percError > 40)
      rangeChange(50);
    if (percError <= 40 && percError > 20)
      rangeChange(40);
    if (percError <= 20 && percError > 0)
      rangeChange(30);
    reTry();
    setTimeout(function() {rangeChange(20);}, 2000);
  } else {
    if (percError > 80)
      rangeChange(-30);
    if (percError <= 80 && percError > 60)
      rangeChange(-20);
    if (percError <= 60 && percError > 40)
      rangeChange(-10);
    if (percError <= 40 && percError > 20)
      rangeChange(0);
    if (percError <= 20 && percError > 0)
      rangeChange(10);
    reTry();
    setTimeout(function() {rangeChange(20);}, 2000);
  }
}

// Initialize buttons
document.getElementById("pianoModeButton").addEventListener("click", function() {if (!pianoMode) {semitoneSubdivisions = 1; computeSpeeds(); pianoMode = true;} else {semitoneSubdivisions = 6; computeSpeeds(); pianoMode = false}});
document.getElementById("speakerModeButton").addEventListener("click", function() {if (!speakerMode) {pso.setPeriodicWave(evenSquareWaveform); speakerMode = true; console.log("speaker mode:", speakerMode)} else {pso.setPeriodicWave(pipesWaveform); speakerMode = false}});
document.getElementById("playStopButton").addEventListener("click", playOrStop);
document.getElementById("answerButton").addEventListener("click", setAnswer)


//----------------------------------- MICRO BIT SIGNALS MANAGEMENT

var microBit = new uBit();

microBit.onConnect(function() {
  console.log("Connected");

  document.getElementById("connected").innerHTML = "Connected!";
  document.getElementById("properties").classList.toggle('inactive');

  microBit.setButtonACallback(function() {
    setAnswer();
  });

  microBit.setButtonALongPressCallback(function() {});

  microBit.setButtonBCallback(function() {
    playOrStop();
  });

  microBit.setButtonBLongPressCallback(function() {});

  microBit.setButtonABCallback(function() {});

  microBit.setButtonABLongPressCallback(function() {});
});

microBit.onDisconnect(function() {
  console.log("Disconnected");
  document.getElementById("connected").innerHTML = "Disconnected";
});

function searchDevice() {
  microBit.searchDevice();
}

// This is the function called every time a Bluetooth signal is received from Micro Bit
microBit.onBleNotify(function() {
  updateVariationSpeed(microBit.getAccelerometer().x);
});

// This function checks whether the variation speed changed and, if so, updates it
function updateVariationSpeed(xValue) {
  let newSpeed = xValueToVariationSpeed(xValue);
  if (speed != newSpeed) {
    speed = newSpeed;
    console.log("Variation speed changed:", speed);
  }
}

// Converts acceleration values over the x-axis to changes in frequency variation speed
function xValueToVariationSpeed(xValue) {
  if (xValue <= -midVariationThreshold)
    return -highSpeed;
  else if (xValue <= -slowVariationThreshold)
    return -midSpeed;
  else if (xValue <= -zeroVariationThreshold)
    return -lowSpeed;
  else if (xValue <= zeroVariationThreshold)
    return 0;
  else if (xValue <= slowVariationThreshold)
    return lowSpeed;
  else if (xValue <= midVariationThreshold)
    return midSpeed;
  else return highSpeed;
}

// Called at the beginning and when the "Piano mode" button is pressed. Speed values are chosen so that the slow variation shifts the frequency off half a semitone in a second (or a semitone every 2 seconds), the mid variation 1 tone in a second and the fast variation 3 tones in a second
function computeSpeeds() {
  lowSpeed = semitoneSubdivisions * slowSemitonesPerSec;
  midSpeed = semitoneSubdivisions * midSemitonesPerSec;
  highSpeed = semitoneSubdivisions * fastSemitonesPerSec;
}

computeSpeeds();

// This is the function that shifts the frequency controlled through the knob; it's called periodically according to the selected frequency variation speed
function changeFrequency() {
  if (speed != 0) {
    if (speed < 0 && currentFreq > firstFreq)
      currentFreq = currentFreq / Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions));
    else if (speed > 0 && currentFreq < lastFreq)
      currentFreq = currentFreq * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions));
    pso.frequency.linearRampToValueAtTime(currentFreq / 2, c.currentTime + 0.2);
    console.log("Current frequency:", currentFreq);
    setTimeout(changeFrequency, 1000 / Math.abs(speed));
  } else setTimeout(changeFrequency, zeroVariationTimeout);
  var freqToShow = (Math.round(currentFreq * 100) / 100);
  document.querySelector('#showFreq .value').innerHTML = freqToShow;
  if (playing) {
    g.gain.value = updateGain();
    console.log("GAIN:", g.gain.value);
  }
}

function updateGain() {
  if (currentFreq < 100)
    return 1;
  else if (currentFreq < 140)
    return 0.9;
  else if (currentFreq < 170)
    return 0.8;
  else if (currentFreq < 200)
    return 0.7;
  else if (currentFreq < 250)
    return 0.6;
  else if (currentFreq < 300)
    return 0.5;
  else if (currentFreq < 350)
    return 0.4;
  else if (currentFreq < 400)
    return 0.3;
  else if (currentFreq < 500)
    return 0.25;
  else if (currentFreq < 700)
    return 0.2;
  else if (currentFreq < 900)
    return 0.15;
  else if (currentFreq < 1100)
    return 0.1;
  else return 0.05;
}

// This command sets off the interaction with Micro Bit
setTimeout(changeFrequency, zeroVariationTimeout);

function victory(){
 var pic= document.getElementById("victoryPic");
 pic.style.visibility="visible";

  setTimeout(function(){ pic.style.visibility="hidden";}, 2000);

}


function hideFreq() {
  var x = document.getElementById("showFreq");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }

}

document.getElementById("hide-freq").addEventListener("click", hideFreq);



function hideGraph() {
  var x = document.getElementById("graph-box");
if (x.style.visibility === "hidden") {

  x.style.visibility = "visible";
  changeVisibility(givenNote);

} else {
  x.style.visibility = "hidden";

var resetName, resetFlat, resetNote, resetExtLine, i;


resetName= document.getElementsByClassName("name");
for (i = 0; i <resetName.length; i++) {
resetName[i].style.visibility="hidden";}
resetFlat= document.getElementsByClassName(" flat");
for (i = 0; i <resetFlat.length; i++) {
resetFlat[i].style.visibility="hidden";}
 resetNote= document.getElementsByClassName("note");
for (i = 0; i <resetNote.length; i++) {
     resetNote[i].style.visibility="hidden";}

resetExtLine=document.getElementsByClassName("extra-line");
for (i = 0; i <resetExtLine.length; i++) {
     resetExtLine[i].style.visibility="hidden";}}


}


function changeVisibility(){

  var note=givenNote;

  var noteLength=note.length;
   var pureNotes=['C','D', 'E','F','G','A','B'];
    var toShow, noteToShow=0;

      while( pureNotes[noteToShow]!= note.slice(0,1))
      {noteToShow++;}
      if(noteToShow==0){
                  document.getElementById("extraline").style.visibility="visible";
                }

    if (noteToShow==0)
      {toShow= document.getElementsByClassName("c1");
       for (i = 0; i < toShow.length; i++) {
       toShow[i].style.visibility="visible";}
       var x = document.getElementById("cn");
       x.innerHTML =note;
       if(note.length>2){

         var y= document.getElementById("cModified");
         y.innerHTML =note.slice(1,2);
           cModified.style.visibility="visible";

       }
    }
    if (noteToShow==1)
    {  toShow= document.getElementsByClassName("d1");
        for (i = 0; i < toShow.length; i++){
        toShow[i].style.visibility="visible";}
        var x = document.getElementById("dn");
             x.innerHTML =note;
       if(note.length>2){

               var y= document.getElementById("dModified");
               y.innerHTML =note.slice(1,2);
                 dModified.style.visibility="visible";

             }
      }
    if (noteToShow==2)
  {toShow= document.getElementsByClassName("e1");
       for (i = 0; i < toShow.length; i++){
       toShow[i].style.visibility="visible";}
       var x = document.getElementById("en");
        x.innerHTML =note;
        if(note.length>2){

          var y= document.getElementById("eModified");
          y.innerHTML =note.slice(1,2);
            eModified.style.visibility="visible";

        }

      }
      if (noteToShow==3){
      toShow= document.getElementsByClassName("f1");
       for (i = 0; i < toShow.length; i++){
        toShow[i].style.visibility="visible";}
        var x = document.getElementById("fn");
         x.innerHTML =note;
       if(note.length>2){

           var y= document.getElementById("fModified");
           y.innerHTML =note.slice(1,2);
             fModified.style.visibility="visible";

         }
    }
      if (noteToShow==4){
      toShow= document.getElementsByClassName("g1");
       for (i = 0; i < toShow.length; i++){
       toShow[i].style.visibility="visible";}
       var x = document.getElementById("gn");
        x.innerHTML =note;
      if(note.length>2){

          var y= document.getElementById("gModified");
          y.innerHTML =note.slice(1,2);
            gModified.style.visibility="visible";

        }
    }
      if (noteToShow==5){
      toShow= document.getElementsByClassName("a1");
        for (i = 0; i < toShow.length; i++){
        toShow[i].style.visibility="visible";}
        var x = document.getElementById("an");
         x.innerHTML =note;
        if(note.length>2){

           var y= document.getElementById("aModified");
           y.innerHTML =note.slice(1,2);
             aModified.style.visibility="visible";

         }
      }
      if (noteToShow==6) {
      toShow= document.getElementsByClassName("b1");
       for (i = 0; i < toShow.length; i++){
       toShow[i].style.visibility="visible";}
       var x = document.getElementById("bn");
        x.innerHTML =note;
      if(note.length>2){

          var y= document.getElementById("bModified");
          y.innerHTML =note.slice(1,2);
          bModified.style.visibility="visible";

        }
    }


}


function reTry(){
 var pic= document.getElementById("nopePic");
 pic.style.visibility="visible";

  setTimeout(function(){ pic.style.visibility="hidden";}, 2000);

}


//SVG STRUCTURE SOURCE: https://codepen.io/pavfilin/pen/xLKoov


  var rangeClock =  document.querySelector('#meter-clock');


 function rangeChange(rotateClock) {

  rangeClock.style.transform = 'rotate(' + (-90 + ((rotateClock * 180) / 100)) + 'deg)';
   if (rotateClock<0){rotateClock=0;}

  }

  function pointerColor() {
   var x = document.getElementById("meter-circle");
  x.style.fill = "#a3cd3b";

  var y = document.getElementById("meter-clock");
    y.style.fill = "#a3cd3b";

       setTimeout(function(){
         x.style.fill = "black";
         y.style.fill = "black";

       }, 2000);

}
