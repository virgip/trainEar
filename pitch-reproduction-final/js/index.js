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
var octaves;
var target;
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
  if (Math.abs(currentFreq - target) <= tolerance)
    alert("CORRECT!");
  else if (currentFreq < target)
    alert("Too low, go higher!");
  else alert("Too high, get lower!");
}

// Generate data for the exercise
function generateRequest() {
  // Define a random note among the equal temperament's standard notes that is going to be the given note
  var givenIndex = Math.floor(Math.random() * notesNumber);
  
  if (givenIndex == notesNumber)
    givenIndex = notesNumber - 1;
  
  givenFreq = frequencies[firstNoteIndex + givenIndex];
  givenNote = notes[firstNoteIndex + givenIndex];

  console.log("Given note:", givenNote, "(" + givenFreq + "Hz)");
  
  // Initialize the button "NOTE"
  document.getElementById("repeatButton").addEventListener("click", function() {
    playNote(givenFreq);
  });
  
  // Define if the exercise asks to find the given note at the same octave or 1 octave off, or 2 octaves off, taking into account the frequency generated for the exercise (so that no impossible or too hard requests are made)
  if (givenFreq < firstFreq * 2)
    octaves = Math.floor(Math.random() * 3);
  else if (givenFreq < firstFreq * 4)
    octaves = Math.floor(Math.random() * 4) - 1;
  else if (givenFreq < 1100)
    octaves = Math.floor(Math.random() * 5) - 2; // I obtain a number between -2 and 2 and each number corresponds to a request (Math.floor used to have an integer rounded down)
  else if (givenFreq < 2100) {
    octaves = Math.floor(Math.random() * 4) - 2;
    if (octaves == 2)
      octaves = 1;
  } else {
    octaves = Math.floor(Math.random() * 3) - 2;
    if (octaves == 1)
      octaves = 0;
  }
  
  if (octaves == 3)
    octaves = 2;
  
  // Define the target frequency for the exercise that needs to be found with Microbit
  target = givenFreq * Math.pow(2, octaves);
  
  // Set the tolerance for considering the answer close enough to the perfect one, according to (a generous version of) JND
  tolerance = (target < 600) ? 6 : target * 0.02;
  
  // Set the text telling what the exercise request is
  if (octaves == 0 )
    document.getElementById("request").innerHTML = "Reproduce the same note";
  else if (octaves < 0)
    document.getElementById("request").innerHTML = 'Find the same note but ' + Math.abs(octaves) + ' octaves lower';
  else if (octaves > 0)
    document.getElementById("request").innerHTML = 'Find the same note but ' + octaves + ' octaves higher';
}

// Reset and generate a new request for the exercise
function restartClicked() {
  stop();
  generateRequest();
}

document.querySelector("#reset").onclick = restartClicked;

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

// This function is used by the "NOTE" button to play the given note back
function playNote(freq) {
  if (playing) {
    stop();
    paused = true;
  }
  var o = c.createOscillator();
  var g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.value = freq;
  g.gain.value = 0;
  var now = c.currentTime;
  g.gain.linearRampToValueAtTime(1,now+0.01);
  g.gain.linearRampToValueAtTime(0,now+0.6);
  o.start(now);
  o.stop(now+1);
  if (paused) {
    setTimeout(play, 1000);
    paused = false;
  }
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

// This command is the one that starts the exercise
generateRequest();


// CHANGE INSTRUCTIONS LANGUAGE

function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML == "Press NOTE or the B button on Microbit to hear the reference tone as many time as you want. Press PLAY and STOP to start/stop the sound and then move Microbit in order to fulfill the request. You can play or stop the sound controlled by Microbit also pressing simultaneously buttons A and B. Once you are satisfied with the sound, press the A button on Microbit or the SET ANSWER one.") {
    x.innerHTML = "Premi NOTE o il pulsante B di Microbit quante volte vuoi per ascoltare la nota di riferimento. Usa i tasti PLAY e STOP per far produrre un suono a Microbit o per fermarlo e muovilo per soddisfare la richiesta. Puoi fermare o far suonare di nuovo Microbit anche premendo contemporaneamente i tasti A e B. Quando sei soddisfatto della nota trovata, premi il tasto A su Microbit o SET ANSWER.";
  } else {
    x.innerHTML = "Press NOTE or the B button on Microbit to hear the reference tone as many time as you want. Press PLAY and STOP to start/stop the sound and then move Microbit in order to fulfill the request. You can play or stop the sound controlled by Microbit also pressing simultaneously buttons A and B. Once you are satisfied with the sound, press the A button on Microbit or the SET ANSWER one.";
  }
}

changeLanguage();
document.querySelector("#language-icon").onclick = changeLanguage;