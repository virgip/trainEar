sharps//--------------------------- INITIAL VARIABLES

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
var givenIndex;
var givenFreq;
var givenNote;
var octaves;
var targetFreq;
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

// Loading piano samples for the repeat button
var C2 = new Audio('../Assets/C2.wav');
var Cs2 = new Audio('../Assets/Cs2.wav');
var D2 = new Audio('../Assets/D2.wav');
var Ds2 = new Audio('../Assets/Ds2.wav');
var E2 = new Audio('../Assets/E2.wav');
var F2 = new Audio('../Assets/F2.wav');
var Fs2 = new Audio('../Assets/Fs2.wav');
var G2 = new Audio('../Assets/G2.wav');
var Gs2 = new Audio('../Assets/Gs2.wav');
var A2 = new Audio('../Assets/A2.wav');
var As2 = new Audio('../Assets/As2.wav');
var B2 = new Audio('../Assets/B2.wav');
var C3 = new Audio('../Assets/C3.wav');
var Cs3 = new Audio('../Assets/Cs3.wav');
var D3 = new Audio('../Assets/D3.wav');
var Ds3 = new Audio('../Assets/Ds3.wav');
var E3 = new Audio('../Assets/E3.wav');
var F3 = new Audio('../Assets/F3.wav');
var Fs3 = new Audio('../Assets/Fs3.wav');
var G3 = new Audio('../Assets/G3.wav');
var Gs3 = new Audio('../Assets/Gs3.wav');
var A3 = new Audio('../Assets/A3.wav');
var As3 = new Audio('../Assets/As3.wav');
var B3 = new Audio('../Assets/B3.wav');
var C4 = new Audio('../Assets/C4.wav');
var Cs4 = new Audio('../Assets/Cs4.wav');
var D4 = new Audio('../Assets/D4.wav');
var Ds4 = new Audio('../Assets/Ds4.wav');
var E4 = new Audio('../Assets/E4.wav');
var F4 = new Audio('../Assets/F4.wav');
var Fs4 = new Audio('../Assets/Fs4.wav');
var G4 = new Audio('../Assets/G4.wav');
var Gs4 = new Audio('../Assets/Gs4.wav');
var A4 = new Audio('../Assets/A4.wav');
var As4 = new Audio('../Assets/As4.wav');
var B4 = new Audio('../Assets/B4.wav');
var C5 = new Audio('../Assets/C5.wav');
var Cs5 = new Audio('../Assets/Cs5.wav');
var D5 = new Audio('../Assets/D5.wav');
var Ds5 = new Audio('../Assets/Ds5.wav');
var E5 = new Audio('../Assets/E5.wav');
var F5 = new Audio('../Assets/F5.wav');
var Fs5 = new Audio('../Assets/Fs5.wav');
var G5 = new Audio('../Assets/G5.wav');
var Gs5 = new Audio('../Assets/Gs5.wav');
var A5 = new Audio('../Assets/A5.wav');
var As5 = new Audio('../Assets/As5.wav');
var B5 = new Audio('../Assets/B5.wav');
var C6 = new Audio('../Assets/C6.wav');
var Cs6 = new Audio('../Assets/Cs6.wav');
var D6 = new Audio('../Assets/D6.wav');
var Ds6 = new Audio('../Assets/Ds6.wav');
var E6 = new Audio('../Assets/E6.wav');
var F6 = new Audio('../Assets/F6.wav');
var Fs6 = new Audio('../Assets/Fs6.wav');
var G6 = new Audio('../Assets/G6.wav');
var Gs6 = new Audio('../Assets/Gs6.wav');
var A6 = new Audio('../Assets/A6.wav');
var As6 = new Audio('../Assets/As6.wav');
var B6 = new Audio('../Assets/B6.wav');
var C7 = new Audio('../Assets/C7.wav');
var Cs7 = new Audio('../Assets/Cs7.wav');
var D7 = new Audio('../Assets/D7.wav');
var Ds7 = new Audio('../Assets/Ds7.wav');
var E7 = new Audio('../Assets/E7.wav');
var F7 = new Audio('../Assets/F7.wav');
var Fs7 = new Audio('../Assets/Fs7.wav');
var G7 = new Audio('../Assets/G7.wav');
var Gs7 = new Audio('../Assets/Gs7.wav');
var A7 = new Audio('../Assets/A7.wav');
var As7 = new Audio('../Assets/As7.wav');
var B7 = new Audio('../Assets/B7.wav');
var C8 = new Audio('../Assets/C8.wav');

var pianoNotes = [C2, Cs2, D2, Ds2, E2, F2, Fs2, G2, Gs2, A2, As2, B2, C3, Cs3, D3, Ds3, E3, F3, Fs3, G3, Gs3, A3, As3, B3, C4, Cs4, D4, Ds4, E4, F4, Fs4, G4, Gs4, A4, As4, B4, C5, Cs5, D5, Ds5, E5, F5, Fs5, G5, Gs5, A5, As5, B5, C6, Cs6, D6, Ds6, E6, F6, Fs6, G6, Gs6, A6, As6, B6, C7, Cs7, D7, Ds7, E7, F7, Fs7, G7, Gs7, A7, As7, B7, C8];


//------------------- INSTRUCTIONS

// Switches between instructions in italian and english
function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML == "Connect microBit and then press the START button to generate a request. If you are using loudspeaker and not headphones, remember to press the button near the title to avoid pitch roll! Press NOTE or the B button on Micro Bit to hear the reference tone as many time as you want. Press PLAY/STOP to start/stop the sound and then move Micro Bit in order to fulfill the request. You can play or stop the sound controlled by Micro Bit also pressing and holding button A or B for 2 seconds. Once you are satisfied with the sound, press the A button on Micro Bit or the SET ANSWER one.") {
    x.innerHTML = "Conneti microBit e poi premi il pulsante START per generare un esercizio. Se stai usando gli altoparlanti e non le cuffie, ricordati di premere il pulsante vicino al titolo perche' non si verifichi pitch roll! Premi NOTE o il pulsante B di Micro Bit quante volte vuoi per ascoltare la nota di riferimento. Usa il tasto PLAY/STOP per far produrre un suono a Micro Bit o per fermarlo e muovilo per soddisfare la richiesta. Puoi fermare o far suonare di nuovo Micro Bit anche premendo e tendendo premuto il tasto A o il tasto B. Quando sei soddisfatto della nota trovata, premi il tasto A su Micro Bit o SET ANSWER.";
  } else {
    x.innerHTML = "Connect microBit and then press the START button to generate a request. If you are using loudspeaker and not headphones, remember to press the button near the title to avoid pitch roll! Press NOTE or the B button on Micro Bit to hear the reference tone as many time as you want. Press PLAY/STOP to start/stop the sound and then move Micro Bit in order to fulfill the request. You can play or stop the sound controlled by Micro Bit also pressing and holding button A or B for 2 seconds. Once you are satisfied with the sound, press the A button on Micro Bit or the SET ANSWER one.";
  }
}

changeLanguage();

// Initalizes the "CHANGE LANGUAGE" button
document.querySelector("#language-icon").onclick = changeLanguage;


//-------------------------- BUTTONS

// This function is used by the "NOTE" button and by Micro Bit's button B to play the given note back
function playNote() {
  if (playing) {
    stop();
    paused = true;
  }
  pianoNotes[givenIndex].play();
  if (paused) {
    setTimeout(play, 1000);
    paused = false;
  }
}

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
  var error = currentFreq - targetFreq;
  var percError = Math.abs((error / currentFreq)) * 100;
  console.log("My answer is", currentFreq);
  if (Math.abs(currentFreq - targetFreq) <= tolerance) {
    victory();
    pointerColor();
    generateRequest();
  } else if (currentFreq > targetFreq) {
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

// Reset and generate a new request for the exercise
function restartClicked() {
  stop();
  generateRequest();
}

// Initialize buttons
document.getElementById("pianoModeButton").addEventListener("click", function() {if (!pianoMode) {semitoneSubdivisions = 1; computeSpeeds(); pianoMode = true;} else {semitoneSubdivisions = 6; computeSpeeds(); pianoMode = false}});
document.getElementById("speakerModeButton").addEventListener("click", function() {if (!speakerMode) {pso.setPeriodicWave(evenSquareWaveform); speakerMode = true; console.log("speaker mode:", speakerMode)} else {pso.setPeriodicWave(pipesWaveform); speakerMode = false}});
document.getElementById("repeatButton").addEventListener("click", function() {playNote();});
document.getElementById("playStopButton").addEventListener("click", playOrStop);
document.getElementById("answerButton").addEventListener("click", setAnswer)
document.querySelector("#startButton").onclick = restartClicked;


//----------------- EXERCISE GENERATION

// This function is called automatically as the code is executed. It creates a new exercise for the user
function generateRequest() {
  // Define a random note among the equal temperament's standard notes that is going to be the given note
  rnd = Math.floor(Math.random() * 2);
  if (rnd == 0) {
    givenIndex = Math.floor(Math.random() * sharps.length);
    givenNote = sharps[givenIndex];
  } else {
    givenIndex = Math.floor(Math.random() * flats.length);
    givenNote = flats[givenIndex];
  }

  givenFreq = frequencies[givenIndex];

  console.log("Given note:", givenNote, "(" + givenFreq + "Hz)");

  // Define if the exercise asks to find the given note at the same octave or 1 octave off, or 2 octaves off, taking into account the frequency generated for the exercise (so that no impossible or too hard requests are made)
  if (givenFreq < frequencies[0] * 2)
    octaves = Math.floor(Math.random() * 3);
  else if (givenFreq < frequencies[0] * 4)
    octaves = Math.floor(Math.random() * 4) - 1;
  else if (givenFreq < 1100)
    octaves = Math.floor(Math.random() * 5) - 2; // I obtain a number between -2 and 2 and each number corresponds to a request (Math.floor used to have an integer rounded down)
  else if (givenFreq < 2100) {
    octaves = Math.floor(Math.random() * 4) - 2;
  } else {
    octaves = Math.floor(Math.random() * 3) - 2;
  }

  // Define the target frequency for the exercise that needs to be found with Micro Bit
  targetFreq = givenFreq * Math.pow(2, octaves);

  // Sets the tolerance for considering the answer close enough to the perfect one, according to (a generous version of) JND
  tolerance = (targetFreq < 600) ? 6 : targetFreq * 0.02;

  console.log("Target:", targetFreq  + 'Hz');

  // Set the text telling what the exercise request is
  if (octaves == 0 )
    document.getElementById("request").innerHTML = "Reproduce the same note";
  else if (octaves < 0)
    document.getElementById("request").innerHTML = 'Find the same note but ' + Math.abs(octaves) + ' octaves lower';
  else if (octaves > 0)
    document.getElementById("request").innerHTML = 'Find the same note but ' + octaves + ' octaves higher';

  // Resetting the older notes shown in the graph
  var resetName, resetFlat, resetNote, resetExtLine, i;

  resetName = document.getElementsByClassName("name");
  for (i = 0; i < resetName.length; i++)
    resetName[i].style.visibility = "hidden";

  resetFlat = document.getElementsByClassName(" flat");
  for (i = 0; i < resetFlat.length; i++)
    resetFlat[i].style.visibility="hidden";

  resetNote = document.getElementsByClassName("note");
  for (i = 0; i < resetNote.length; i++)
    resetNote[i].style.visibility = "hidden";

  resetExtLine = document.getElementsByClassName("extra-line");
  for (i = 0; i < resetExtLine.length; i++)
    resetExtLine[i].style.visibility = "hidden";

  changeVisibility();
}


//----------------------------------- MICRO BIT SIGNALS MANAGEMENT

var microBit = new uBit();

microBit.onConnect(function() {
  console.log("Connected");

  document.getElementById("connected").innerHTML = "Connected!";
  document.getElementById("properties").classList.toggle('inactive');

  microBit.setButtonACallback(function() {
    setAnswer();
  });

  microBit.setButtonALongPressCallback(function() {
    playOrStop();
  });

  microBit.setButtonBCallback(function() {
    playNote();
  });

  microBit.setButtonBLongPressCallback(function() {
    playOrStop();
  });

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




function hideGraph() {
  var x = document.getElementById("graph-box");
  if (x.style.visibility === "hidden") {

    x.style.visibility = "visible";
    changeVisibility();

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
     x.innerHTML =givenNote;
     if(noteLength==3){

       var y= document.getElementById("cModified");
       y.innerHTML =givenNote.slice(1,2);
         cModified.style.visibility="visible";

     }
  }
  if (noteToShow==1)
  {  toShow= document.getElementsByClassName("d1");
      for (i = 0; i < toShow.length; i++){
      toShow[i].style.visibility="visible";}
      var x = document.getElementById("dn");
           x.innerHTML =givenNote;
     if(noteLength==3){

             var y= document.getElementById("dModified");
             y.innerHTML =givenNote.slice(1,2);
               dModified.style.visibility="visible";

           }
    }
  if (noteToShow==2)
{toShow= document.getElementsByClassName("e1");
     for (i = 0; i < toShow.length; i++){
     toShow[i].style.visibility="visible";}
     var x = document.getElementById("en");
      x.innerHTML =givenNote;
      if(noteLength==3){

        var y= document.getElementById("eModified");
        y.innerHTML =givenNote.slice(1,2);
          eModified.style.visibility="visible";

      }

    }
    if (noteToShow==3){
    toShow= document.getElementsByClassName("f1");
     for (i = 0; i < toShow.length; i++){
      toShow[i].style.visibility="visible";}
      var x = document.getElementById("fn");
       x.innerHTML =givenNote;
     if(noteLength==3){

         var y= document.getElementById("fModified");
         y.innerHTML =givenNote.slice(1,2);
           fModified.style.visibility="visible";

       }
  }
    if (noteToShow==4){
    toShow= document.getElementsByClassName("g1");
     for (i = 0; i < toShow.length; i++){
     toShow[i].style.visibility="visible";}
     var x = document.getElementById("gn");
      x.innerHTML =givenNote;
    if(noteLength==3){

        var y= document.getElementById("gModified");
        y.innerHTML =givenNote.slice(1,2);
          gModified.style.visibility="visible";

      }
  }
    if (noteToShow==5){
    toShow= document.getElementsByClassName("a1");
      for (i = 0; i < toShow.length; i++){
      toShow[i].style.visibility="visible";}
      var x = document.getElementById("an");
       x.innerHTML =givenNote;
      if(noteLength==3){

         var y= document.getElementById("aModified");
         y.innerHTML =givenNote.slice(1,2);
           aModified.style.visibility="visible";

       }
    }
    if (noteToShow==6) {
    toShow= document.getElementsByClassName("b1");
     for (i = 0; i < toShow.length; i++){
     toShow[i].style.visibility="visible";}
     var x = document.getElementById("bn");
      x.innerHTML =givenNote;
    if(noteLength==3){

        var y= document.getElementById("bModified");
        y.innerHTML =givenNote.slice(1,2);
        bModified.style.visibility="visible";

      }
  }

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
    x.style.fill = " #a3cd3b";

    var y = document.getElementById("meter-clock");
      y.style.fill =  "#a3cd3b";

         setTimeout(function(){
           x.style.fill = "black";
           y.style.fill = "black";

         }, 2000);

  }
