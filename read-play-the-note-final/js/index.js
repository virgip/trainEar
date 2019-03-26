// MICROBIT DATA MANAGEMENT


//------------------------------------------------ INITIAL VARIABLES


// Useful constants
var firstMidiNum = 21;
var firstMidiFreq = 27.5;

var semitonesPerOctave = 12;
var mircoValues = 129;

var firstNegBend = 15360;
var lastNegBend = 16368;
var firstPosBend = 0;
var lastPosBend = 1024;
var firstX = 0;
var lastX = 128;
var midX = Math.floor((lastX + firstX) / 2);

var pitchBendCommand = 224;
var buttonAPressed = 60;
var buttonBPressed = 62;
var buttonABPressed = 64;

// Global variables
var givenFreq;
var givenNote;
var tolerance;

var currentFreq;
var firstTime = true;
var playing = false;
var paused = false;

// Defining MIDI notes and respective frequencies
var notes = ['A0', 'A#0', 'B0', 'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C8'];

var frequencies = [firstMidiFreq];
for (i = 1; i < notes.length; i++) {
  frequencies.push(frequencies[i-1] * Math.pow(2, 1/semitonesPerOctave));
}

// Defining the range of frequencies, within the MIDI notes spectrum, for the exercise, and, according to that, the frequencies distribution within the Microbit values range
var firstNote = 'C2';
var lastNote = 'C8';

if (notes.indexOf(firstNote) == -1 || notes.indexOf(lastNote) == -1) {
  if (notes.indexOf(firstNote) == -1)
    console.log("Invalid first note");
  if (notes.indexOf(lastNote) == -1)
    console.log("Invalid last note");
} else if (notes.indexOf(firstNote) > notes.indexOf(lastNote)) {
  let tmp = firstNote;
  firstNote = lastNote;
  lastNote = tmp;
}

firstNoteIndex = notes.indexOf(firstNote);
lastNoteIndex = notes.indexOf(lastNote);

var firstNoteMidiNum = firstMidiNum + firstNoteIndex;
var lastNoteMidiNum = firstMidiNum + lastNoteIndex;
var midNoteMidiNum = Math.floor((firstNoteMidiNum + lastNoteMidiNum) / 2);
var midNote = notes[midNoteMidiNum - firstMidiNum];
midNoteIndex = notes.indexOf(midNote)

var firstFreq = frequencies[firstNoteIndex];
var midFreq = frequencies[midNoteIndex];
var lastFreq = frequencies[lastNoteIndex];

var notesNumber = lastNoteIndex - firstNoteIndex + 1;

// These are the frequencies for the selected range in the MIDI spectrum
var psoFrequencies = [firstFreq];
var semitoneSubdivisions = Math.floor(mircoValues / notesNumber);
var spread = mircoValues % notesNumber;
for (i = 0; i < Math.floor(mircoValues / 2) - spread; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));
for (i = Math.floor(mircoValues / 2) - spread; i < Math.floor(mircoValues / 2) + spread; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * (semitoneSubdivisions + 1))));
for (i = Math.floor(mircoValues / 2) + spread; i < mircoValues - 1; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));

// These are the AudioContext and the pitch shifter oscillator
var c = new AudioContext();
var pso = c.createOscillator();
var g = c.createGain();
pso.connect(g);
g.connect(c.destination);
pso.frequency.value = midFreq;


//----------------------------------- END INITIAL VARIABLES

// Receiving signals from Microbit

// MIDI access
if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
} else {
    console.log('WebMIDI is not supported in this browser.');
}

navigator.requestMIDIAccess()
  .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values())
      input.onmidimessage = getMIDIMessage;
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {  
  // data[0]: command (note on/note off: 144, pitch bend: 224); data[1]: MIDI note/bend value; data[2]: velocity
  let command = midiMessage.data[0];
  let value = midiMessage.data[1];
  let velocity = midiMessage.data[2];
  
  if (command == pitchBendCommand)
    changeFrequency(value, velocity);
  else switch (value) {
    case buttonAPressed:
      setAnswer();
      break;
    case buttonBPressed:
      playNote(givenFreq);
      break;
    case buttonABPressed:
      if (playing)
        stop();
      else play();
      break;
  }
}

// This is the function that shifts the frequency controlled through the knob
function changeFrequency(bend, velocity) {
  currentFreq = psoFrequencies[pitchBendToFrequencyIndex(bend, velocity)];
  pso.frequency.linearRampToValueAtTime(currentFreq, c.currentTime + 0.2);
    
  console.log(currentFreq);
}

// Tell whether the answer is acceptable, or whether the user needs to move the pitch up or down
function setAnswer() {
  console.log("My answer is", currentFreq);
  if (Math.abs(currentFreq - givenFreq) <= tolerance)
    alert("CORRECT!");
  else if (currentFreq < givenFreq)
    alert("Too low, go higher!");
  else alert("Too high, get lower!");
}

// This function is useful to pass from one range to another in a proportional fashion (linearly)
function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// Convert a MIDI note to the corresponding frequency -- NOT USED
function midiNoteToFrequency(midiNote) {
  return Math.pow(2, ((midiNote - 69) / 12)) * 440;
}

// Pitch bend velocity indicates one of the 128 groups of 128 bend values; pitch bend value selects one of the 128 values into the group selected by pitch bend velocity (so 128*128=16384 values for bend)
function pitchBendToFrequencyIndex(value, velocity) {
  var bend = velocity * 128 + value;
  var margin = (firstNegBend - lastPosBend) / 2;

  if (bend >= firstNegBend - margin && bend < firstNegBend)
    bend = firstNegBend;
  else if (bend > lastNegBend)
    bend = lastNegBend;
  else if (bend < firstPosBend)
    bend = firstPosBend;
  else if (bend > lastPosBend && bend < lastPosBend + margin)
    bend = lastPosBend;
  
  if (bend >= firstNegBend && bend <= lastNegBend)
    return remap(bend, firstNegBend, lastNegBend, firstX, midX-1);
  else return remap(bend, firstPosBend, lastPosBend, midX, lastX);
}

// This function is called when the "PLAY" button is pressed, and makes the Microbit start making sounds
function play() {
  if (firstTime) {
    pso.start();
    firstTime = false;
  } else g.gain.value = 1;
  playing = true;
}

// This function is called when the "STOP" button is pressed, and makes the Microbit stop making sounds
function stop() {
    g.gain.value = 0;
    playing = false;
}

// Initialize buttons
function playButton() {
  document.getElementById("playButton").addEventListener("click", play);
}

function stopButton() {
  document.getElementById("stopButton").addEventListener("click", stop);
}

function setAnswerButton() {
  document.getElementById("answerButton").addEventListener("click", setAnswer)
}

playButton();
stopButton();
setAnswerButton();

document.getElementById("notation-icon").addEventListener("click", changeNotation);


// LEVER FOR THE SLOT +++ DIRE SE DEVE ANDARE SU O GIù


// SLOT CODE
// Source: https://codepen.io/indamix/pen/lLxcG?editors=0110
/*
	requestAnimationFrame polyfill
*/

(function(w){
	var lastTime = 0,
		vendors = ['webkit', /*'moz',*/ 'o', 'ms'];
	for (var i = 0; i < vendors.length && !w.requestAnimationFrame; ++i){
		w.requestAnimationFrame = w[vendors[i] + 'RequestAnimationFrame'];
		w.cancelAnimationFrame = w[vendors[i] + 'CancelAnimationFrame']
			|| w[vendors[i] + 'CancelRequestAnimationFrame'];
	}

	if (!w.requestAnimationFrame)
		w.requestAnimationFrame = function(callback, element){
			var currTime = +new Date(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = w.setTimeout(function(){ callback(currTime + timeToCall) }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!w.cancelAnimationFrame)
		w.cancelAnimationFrame = function(id){
		clearTimeout(id);
	};
})(this);

/*
	Slot Machine
*/
// $ = html propriety

var  reels = [ ['C', 'C#', 'D', 'D#', 'E', 'F','F#', 'G', 'G#', 'A','A#','B'],
			['1','2','3', '4', '5','6','7','8'] 
		];
var notation1=[['C', 'C#', 'D', 'D#', 'E', 'F','F#', 'G', 'G#', 'A','A#','B'], 	['1','2','3', '4', '5','6','7','8'] ]
  var notation2= [['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA','FA#', 'SOL', 'SOL#', 'LA','LA#','SI'], 	['1','2','3', '4', '5','6','7','8'] ]
  var $reels;

 //CHANGE NOTE NOTATION
 function changeNotation() {
   if (reels[0][0]==notation1[0][0])
  {reels =notation2;}
   else {reels =notation1;}
   	$reels = $('.reel').each(function(i, el) {
      el.innerHTML = '<div><p>' + reels[i].join('</p><p>') + '</p></div><div><p>' + reels[i].join('</p><p>') + '</p></div>'
		});
  }
 

var sm = (function(undefined) {
  var tMax = 3000, // animation time, ms --> per quanto gira la ruota
      height = 820, //original:210, the height determines the number of elements that can fit the reel (max 840 but then it wouldn't  be centred)
      speeds = [],
      r = [],
	
      $msg,
      start;
  
  function init() {
    $reels = $('.reel').each(function(i, el) {
      el.innerHTML = '<div><p>' + reels[i].join('</p><p>') + '</p></div><div><p>' + reels[i].join('</p><p>') + '</p></div>'
		});
    
    document.getElementById('#start-button').onclick = action
  }

  function action() {
    //serve per far fermare le slot solo sulle opzioni valide 
		if (start !== undefined) return;

		for (var i = 0; i < 2; ++i) { //serve anche per far si che le probabilità siano equilibrate 16.6--> okay ma non centrato
			speeds[i] = Math.random() + .5;	
			r[i] = ((Math.random() * 12| 0) * height /12)|0;
		}
     
    generateRequest(r); 
    animate();
	}

	function animate(now) {
		if (!start) start = now;
		var t = now - start || 0;

		for (var i = 0; i < 2; ++i) //2 is the number of reels and here it's used to make the reels themselves run smoothly
      $reels[i].scrollTop = (speeds[i] / tMax / 2 * (tMax - t) * (tMax - t) + r[i]) % height | 0;
    
    if (t < tMax)
			requestAnimationFrame(animate);
		else {
      start = undefined;
    }
    
  }
  return {init: init};
})();

$(sm.init);


// END SLOT CODE


// CHANGE INSTRUCTIONS LANGUAGE

function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML === "Press START to spin the wheels and then press PLAY to start the sound; move Microbit to find the given note. You may stop or restart the sound controlled by Microbit using buttons PLAY/STOP, or pressing buttons A and B on Microbit at the same time. When you think you have found it, press the A button on Microbit or the SET ANSWER one.") {
    x.innerHTML = "Premi START per azionare la slot. Usando PLAY e STOP, fai partire o fermare il suono che Microbit controlla. Muovi Microbit per cercare la nota indicata. Puoi fermare o far ripartire il suono anche premendo contemporaneamente i pulsanti A e B su Microbit. Quando pensi di aver trovato la nota indicata, premi SET ANSWER o il tasto A su Microbit.";
  } else {
    x.innerHTML = "Press START to spin the wheels and then press PLAY to start the sound; move Microbit to find the given note. You may stop or restart the sound controlled by Microbit using buttons PLAY/STOP, or pressing buttons A and B on Microbit at the same time. When you think you have found it, press the A button on Microbit or the SET ANSWER one.";
  }
}
changeLanguage();
document.querySelector("#language-icon").onclick = changeLanguage;

function generateRequest(r) {
  switch (r[0]) {
      case 546:
        givenNote = 'A';
        break;
      case 615:
        givenNote = 'A#';
        break;
      case 683:
        givenNote = 'B';
        break;
      case 751:
        givenNote = 'C';
        break;
      case 0:
        givenNote = 'C#';
        break;
      case 68:
        givenNote = 'D';
        break;
      case 136:
        givenNote = 'D#';
        break;
      case 206:
        givenNote = 'E';
        break;
      case 273:
        givenNote = 'F';
        break;
      case 341:
        givenNote = 'F#';
        break;
      case 410:
        givenNote = 'G';
        break;
      case 478:
        givenNote = 'G#';
        break;
    }
  switch (r[1]) {
      case 478:
        givenNote = givenNote + '1';

        break;
      case 0:
        givenNote = givenNote + '2';
        break;
      case 546:
        givenNote = givenNote + '2';
        break;
      case 68:
        givenNote = givenNote + '3';
        break;
      case 615:
        givenNote = givenNote + '3';
        break;
      case 36:
        givenNote = givenNote + '4';
        break;
      case 683:
        givenNote = givenNote + '4';
        break;
      case 205:
        givenNote = givenNote + '5';
        break;
      case 751:
        givenNote = givenNote + '5';
        break;
      case 273:
        givenNote = givenNote + '6';
        break;
      case 341:
        givenNote = givenNote + '7';
        break;
      case 410:
        givenNote = 'C8'; // The only note at 8th octave is C
        break;
    }

    givenFreq = frequencies[notes.indexOf(givenNote)];
    
    // Set the tolerance for considering the answer close enough to the perfect one, according to (a generous version of) JND
    tolerance = (givenFreq < 600) ? 6 : givenFreq * 0.02;
    
    console.log("Given note:", givenNote, "(" + givenFreq + "Hz)");
  }