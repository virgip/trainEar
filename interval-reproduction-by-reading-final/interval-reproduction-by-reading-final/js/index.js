// MICROBIT DATA MANAGEMENT


//------------------------------------------------ INITIAL VARIABLES

// Useful constants
var firstMidiNum = 21;
var firstMidiFreq = 27.5;
var offset = 15;
var psoFrequencies;

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

var firstFreq;
var firstNote;
var lastFreq;
var lastNote;

// These are the AudioContext and the pitch shifter oscillator
var c = new AudioContext();
var pso = c.createOscillator();
var g = c.createGain();
pso.connect(g);
g.connect(c.destination);


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



///LEVA PER SLOT +++ DIRE SE DEVE ANDARE SU O GIù

//Dropdown menu
//Source: https://codepen.io/General-Dev/pen/JRjwPa
/*


  /*Dropdown Menu*/

var level;
$('.dropdown').click(function () {
        $(this).attr('tabindex', 1).focus();
        $(this).toggleClass('active');
        $(this).find('.dropdown-menu').slideToggle(300);
    });
    $('.dropdown').focusout(function () {
        $(this).removeClass('active');
        $(this).find('.dropdown-menu').slideUp(300);
    });
    $('.dropdown .dropdown-menu li').click(function () {
        $(this).parents('.dropdown').find('span').text($(this).text());
        var selected= $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
      var level=selected.context;
      changeDifficulty(level);
     });
/*End Dropdown Menu*/







//SLOT CODE BEGINNING
//Source: https://codepen.io/indamix/pen/lLxcG
	/*requestAnimationFrame polyfill
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



 var  reels = [
			['Minor Second', 'Major Second', 'Minor Third', 'Major Third', 	'Perfect Fourth', '☠ Tritone ☠ ', 'Perfect Fifth', 'Minor Sixth', 'Major Sixth', 'Minor Seventh', 'Major Seventh', 'Octave']
		];
var easyReel=[['Major Third','Perfect Fifth', 'Octave','Major Third','Perfect Fifth', 'Octave','Major Third','Perfect Fifth', 'Octave','Major Third','Perfect Fifth', 'Octave']];
  var mediumReel= [['Major Second', 'Major Third', 	'Perfect Fourth', 'Perfect Fifth', 'Major Sixth', 'Octave','Major Second', 'Major Third', 	'Perfect Fourth', 'Perfect Fifth', 'Major Sixth', 'Octave'] ]
  var  hardReel= [
			['Minor Second', 'Major Second', 'Minor Third', 'Major Third', 	'Perfect Fourth', '☠ Tritone ☠ ', 'Perfect Fifth', 'Minor Sixth', 'Major Sixth', 'Minor Seventh', 'Major Seventh', 'Octave']
		];
  var $reels, height = 830; //originale:210, the height depends of the number of elements on the reel

 //CHANGE NOTE NOTATION

 function changeDifficulty(difficultySelected) {
   
  var selected= difficultySelected.id;
   
  if (selected=="easy")
  {reels =easyReel;
  }
   
  if (selected=="medium")
  {reels =mediumReel;
 }
   
    if (selected=="hard")
  {reels =hardReel;
 }
   
   		$reels = $('.reel').each(function(i, el){
			el.innerHTML = '<div><p>' + reels[i].join('</p><p>') + '</p></div><div><p>' + reels[i].join('</p><p>') + '</p></div>'
		});
   
   return selected;
  }

var sm = (function(undefined) {
  var tMax = 3000, // animation time, ms --> for how long the reel spins
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
		if (start !== undefined) return;
    
		for (var i = 0; i < 12; ++i) {
      speeds[i] = Math.random() + .5;	
			r[i] = ((Math.random() * 12| 0) * height /12)|0
		}
    generateRequest(r);
		animate();  
	}
	function animate(now) {
		if (!start) start = now;
		var t = now - start || 0;

		for (var i = 0; i < 1; ++i) // 2 is the number of reels and here it's used to make the reels themselves run smoothly
      $reels[i].scrollTop = (speeds[i] / tMax / 1 * (tMax - t) * (tMax - t) + r[i]) % height | 0;
    
		if (t < tMax)
      requestAnimationFrame(animate);
		else {
			start = undefined;
		}
	}
  return {init: init}
})();

$(sm.init);


// END SLOT CODE


// CHANGE INSTRUCTIONS LANGUAGE

function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML ==="Choose how many intervals can be asked you with the DIFFICULTY button (easy = Maj3, P5, Octave; medium = Maj2, Maj3, P4, P5, Maj6, Octave; hard = all). Press START to spin the wheels and generate a request; use NOTE to hear the refernce note to build the interval; move Microbit to find the sound that accomplishes the request. You may stop or restart the sound controlled by Microbit using buttons PLAY/STOP, or pressing buttons A and B on Microbit at the same time. When you think you have found it, press the A button on Microbit or the SET ANSWER one.") {
    x.innerHTML = "Scegli il numero degli intervalli che posso venir richiesti con il pulsante DIFFICULTY (easy = Maj3, P5, Octave; medium = Maj2, Maj3, P4, P5, Octave; hard = tutti). Premi START per azionare la slot e generare una richiesta. Usando NOTE, ascolta la nota di riferimento per costruire l'intervallo; muovi Microbit per cercare il suono per completare la richiesta. Puoi fermare o far ripartire il suono anche premendo contemporaneamente i pulsanti A e B su Microbit. Quando pensi di averlo trovata, premi SET ANSWER o il tasto A su Microbit.";
  } else {
    x.innerHTML = "Choose how many intervals can be asked you with the DIFFICULTY button (easy = Maj3, P5, Octave; medium = Maj2, Maj3, P4, P5, Maj6, Octave; hard = all). Press START to spin the wheels and generate a request; use NOTE to hear the refernce note to build the interval; move Microbit to find the sound that accomplishes the request. You may stop or restart the sound controlled by Microbit using buttons PLAY/STOP, or pressing buttons A and B on Microbit at the same time. When you think you have found it, press the A button on Microbit or the SET ANSWER one.";
  }
}
changeLanguage();
document.querySelector("#language-icon").onclick = changeLanguage;

function generateRequest(r) { //the argument is the note given as reference
  // Define a random note among the equal temperament's standard notes that is going to be the reference note for the exercise
  
  
  var givenIndex = Math.floor(Math.random() * (notes.length - 39));
  
  if (givenIndex == notes.length - 39)
    givenIndex = notes.length - 40;
  
  givenIndex += offset;
  
  givenFreq = frequencies[givenIndex];
  givenNote = notes[givenIndex];
  firstFreq = frequencies[givenIndex - semitonesPerOctave];
  firstNote = notes[givenIndex - semitonesPerOctave];
  lastFreq = frequencies[givenIndex + semitonesPerOctave];
  lastNote = notes[givenIndex + semitonesPerOctave];
  
  var firstNoteIndex = notes.indexOf(firstNote);
  var lastNoteIndex = notes.indexOf(lastNote);

  var firstNoteMidiNum = firstMidiNum + firstNoteIndex;
  var lastNoteMidiNum = firstMidiNum + lastNoteIndex;
  var midNoteMidiNum = Math.floor((firstNoteMidiNum + lastNoteMidiNum) / 2);
  var midNote = notes[midNoteMidiNum - firstMidiNum];
  var midNoteIndex = notes.indexOf(midNote);
  var midFreq = frequencies[midNoteIndex];
  var notesNumber = lastNoteIndex - firstNoteIndex + 1;
  
  pso.frequency.value = givenFreq;

  // These are the frequencies for the selected range in the MIDI spectrum
  psoFrequencies = [firstFreq];
  var semitoneSubdivisions = Math.floor(mircoValues / notesNumber);
  var spread = mircoValues % notesNumber;
  for (i = 0; i < Math.floor(mircoValues / 2) - spread; i++)
    psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));
  for (i = Math.floor(mircoValues / 2) - spread; i < Math.floor(mircoValues / 2) + spread; i++)
    psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * (semitoneSubdivisions + 1))));
  for (i = Math.floor(mircoValues / 2) + spread; i < mircoValues - 1; i++)
    psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));
  
  console.log("Given note:", givenNote, "(" + givenFreq + "Hz)");
  
  document.getElementById("repeatButton").addEventListener("click", function() {
    playNote(givenFreq);
  });
  
  
  
  if( reels==easyReel)
  {
    if(r[0]== 553 ||r[0]== 760 ||r[0]== 138|| r[0]== 345 )
      {
         target = givenFreq * Math.pow(2, 4/12);  
      }
    if(r[0]== 0 ||r[0]== 622 ||r[0]== 207|| r[0]== 415 )
      {
        console.log("ENTRI?")
       target = givenFreq * Math.pow(2, 7/12);
      }
  if(r[0]== 484 ||r[0]== 691 ||r[0]== 69|| r[0]== 276 )
      {
       target = givenFreq * 2;
      }
  }
  
   if( reels==mediumReel)
  {
    if(r[0]== 760 ||r[0]== 345)
      {
         target = givenFreq * Math.pow(2, 2/12);  
      }
    if(r[0]== 0 || r[0]== 415 )
      {
       target = givenFreq * Math.pow(2, 4/12);
      }
  if(r[0]== 484||r[0]== 69)
      {
      target = givenFreq * Math.pow(2, 5/12);
      }
     if(r[0]== 138|| r[0]== 553 )
      {
          target = givenFreq * Math.pow(2, 7/12);}
    
       if(r[0]== 622 ||r[0]== 207 )
      {
         target = givenFreq * Math.pow(2, 9/12);}
       if(r[0]== 691 ||r[0]== 276 )
      {
         target = givenFreq * 2;
  }
  
  }
  if(reels==hardReel){
  
    switch (r[0]) {
    case 760: //minor second
      target = givenFreq * Math.pow(2, 1/12);
      break;
    case 0: //major second
      target = givenFreq * Math.pow(2, 2/12);
      break;
    case 69: //minor third
      target = givenFreq * Math.pow(2, 3/12);
      break;
    case 138://major third
      target = givenFreq * Math.pow(2, 4/12);
      break;
    case 207: //perfect fourth
      target = givenFreq * Math.pow(2, 5/12);
      break;
    case 276: //tritone
      target = givenFreq * Math.pow(2, 6/12);
      break;
    case 345: //perfect fifth
      target = givenFreq * Math.pow(2, 7/12);
      break;
    case 415: //minor sixth
      target = givenFreq * Math.pow(2, 8/12);
      break;
    case 484: //major sixth
      target = givenFreq * Math.pow(2, 9/12);
      break;
    case 553: //minor seventh
      targetgivenFreq = givenFreq * Math.pow(2, 10/12);
      break;
    case 622: //major seventh
      target = givenFreq * Math.pow(2, 11/12);
      break;
    case 691: //octave
      target = givenFreq * 2;
      break;
  }
  }
  
  
  
   tolerance = (target < 600) ? 6 : target * 0.02;
}