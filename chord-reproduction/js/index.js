// CHANGE INSTRUCTIONS LANGUAGE

function changeLanguage() {
  var x = document.getElementById("instruction");
  if (x.innerHTML ==="Select all the parameters to generate the kind of chord you want; if choose more than one option for each parameter, the request will be created with a random selection among all of your choices. If you go for no choice at all, the random choice will be performed considering all the possible options. Press the red button to create the chord and then hear it by pressing the button CHORD. The PLAY and STOP buttons activate and deactivate the microbit. Move the microbit trying to find one of the notes that are part of the chord; once you have found it, press the button on the sensor itself or the SET ANSWER one; if the guess is correct, you can move on and try to recognize another note of the chord until you have found all of them. The notes you guess don't have to be in a particular order.") {
    x.innerHTML = "Seleziona i vari parametri per generare il tipo d'accordo desiderato; se scegli più di un'opzione, verrà eseguita una scelta randomica tra tutte le preferenze espresse. Se si decide di non indicare una o più opzioni, la scelta randomica verrà fatta tra tutte quelle possibili. Premi il pulsante rosso per creare l'accordo e ascoltalo premendo il tasto CHORD. Usa i tasti PLAY  e STOP per controllare il microbit. Muovi il microbit per cercare una delle note che fanno parte dell'accordo; una volta trovata, premi il pulsante sul sensore stesso o quello SET ANSWER sullo schermo. Se la supposizione si rivela giusta, potrai avanzare nell'esercizio e provare a trovare un'altra nota dell'accordo, finchè quest'ultimo non sarà completo. Le note non devono essere trovate in un ordine particolare.";
  } else {
    x.innerHTML = "Select all the parameters to generate the kind of chord you want; if choose more than one option for each parameter, the request will be created with a random selection among all of your choices. If you go for no choice at all, the random choice will be performed considering all the possible options. Press the red button to create the chord and then hear it by pressing the button CHORD. The PLAY and STOP buttons activate and deactivate the microbit. Move the microbit trying to find one of the notes that are part of the chord; once you have found it, press the button on the sensor itself or the SET ANSWER one; if the guess is correct, you can move on and try to recognize another note of the chord until you have found all of them. The notes you guess don't have to be in a particular order.";
  }
}
changeLanguage();
document.querySelector("#language-icon").onclick = changeLanguage;






//storing user's choices and generating chords according to his/her will
//one array for each element of the scale


function choiceAcquisition(arrayChoices, arraySelected){
  /*DA METTERE INTERNE X PARAMETRI:
  
  
 
  var elemsHS=document.getElementsByClassName("hsElm");
var hsArr = jQuery.makeArray(elemsHS); --> arrayChoices

 
  */
  
  //arrayChoices contains all of the possible choices among that particular option
  //arraySelected is initally empty and then every element chosen by the user turn the respective array element into "1"
  
  
   var i,k;
  

 for (k=0; k<arrayChoices.length; k++){
 
      if (arrayChoices[k].checked==true) {
          
      var thisId= arrayChoices[k].id;
       
           for(i=0; i<arrayChoices.length; i++){
             var currentElem= arrayChoices[i].getAttribute('id');
                       
        if (thisId==currentElem){
          arraySelected[i]="1";
         }}
    
  }  
   
   
      if (arrayChoices[k].checked==false) {

      var thisId= arrayChoices[k].id;
       
           for(i=0; i<arrayChoices.length; i++){
             var currentElem= arrayChoices[i].getAttribute('id');
                       
        if (thisId==currentElem){
         arraySelected[i]="0";
         }}
    
  }  
}
 
 
  return arraySelected;
  
  
  
}

function choicesSelection(arr){
     var k,selected;
  var empty=false;
                                 var possibilities=0;
                                 for(k=0; k<arr.length; k++){
                                   
                                   var elem= arr[k];
                                   if(elem==1){possibilities+=1; }
                                 } 
                               
                                  if (possibilities==0)  //if nothing is chosen is like all of the options have been chosen                                          
                                  { var empty=true;
                                    possibilities=arr.length;}
                                
                                  var randomChoice=                                 Math.floor(Math.random() * (possibilities) + 1);
                            //random choice start from 1 so it's easier to substract one and obtain the desired option
                             
                                 if (empty!=true) 
                                { var i;
                                  for (i=0; i<arr.length; i++){
                                    var e= arr[i];
                                    if(e==1){randomChoice-=1;} 
                                    if (randomChoice==0){
                                       selected=i;
                                      //selected starts from 0 and indicates the index of the desired option
                                   
                                      
                                      break; }
                                  }
                                }
                                if (empty==true){
                                  selected= randomChoice-1;
                                  
                             }  

  return selected;
  
}

 var arrSelectedHS = new Uint8Array(2);
 var arrSelectedMode = new Uint8Array(7);
 var arrSelectedRS = new Uint8Array(12); 


function selectHarmonyScale(){
  
 var elemsHS=document.getElementsByClassName("hsElm");
 var hsArr = jQuery.makeArray(elemsHS);
 var HSselected= choiceAcquisition(hsArr, arrSelectedHS);
 
 return HSselected;
  
}
   

function selectMode(){

var elemsM=document.getElementsByClassName("modeElm");
var arrM = jQuery.makeArray(elemsM);
var MSelected= choiceAcquisition(arrM, arrSelectedMode);

  return MSelected;
  
}



function selectRootScale(){
  
 var rsTones=document.getElementsByClassName("rsElm");
 var rsArr = jQuery.makeArray(rsTones);
 var RsSelected= choiceAcquisition(rsArr, arrSelectedRS);
  
 return RsSelected;  
  
}
  //Creating scale
var semitone, tone;
var ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian;

/*INTERVALS IN MODES 
Major: I=TTSTTTS; D=TSTTTST; F=STTTSTT; Ly=TTTSTTS; M= TTSTTST; A= TSTTSTT ; Lo=STTSTTT*/

function createScale(harmonyS,mode,rootS) {
 
                      var selected= rootS;
                             
                  var randomHeight= Math.floor(Math.random() * (5 - 2 + 1) ) + 2; //random height of the root tone (form 2 to 5)
  if(randomHeight==2){
    randomHeight=1;
  }
  if(randomHeight==3){
    randomHeight=2;
  }
   if(randomHeight==4){
    randomHeight=4;
  }
   if(randomHeight==5){
    randomHeight=8;
  }
  
  var rootTone = frequencies[offset+selected];
  var tolerance = 0.0001;
  /*
               if (selected==0){ //do, c
                   rootTone=frequencies[offset];
                   } 
               if (selected==1){//do#, c#
                   rootTone=69.30;
                   } 
               if (selected==2){ //re, d
                   rootTone=73.42;
                   } 
               if (selected==3){ //re#, d#
                   rootTone=77.78;
                   } 
               if (selected==4){//mi, e
                   rootTone=82.41;
                   } 
               if (selected==5){ //fa, f
                   rootTone=87.31;
                   } 
               if (selected==6){ //fa#, f#
                   rootTone=92.50;
                   } 
               if (selected==7){//sol, g
                   rootTone=98.00;
                   } 
               if (selected==8){ //sol#, g# 
                   rootTone=103.8;
                   } 
               if (selected==9){//la, a
                   rootTone=110.0;
                   } 
               if (selected==10){ //la#, a#
                   rootTone=116.5;
                   } 
               if (selected==11){ //si, b
                   rootTone=123.5;
                   } */
 
                     rootTone*=randomHeight; 
                 
                     var scale=[];
                     var intervals= []; 
 
    var intervals;                 
 if (harmonyS==0){
                 
    intervals=  majorScale(mode);
  
 }
  
    if (harmonyS==1){
     
       intervals=  minorScale(mode);
    
                               } 
  

   var k;
  for(k=0; k<intervals.length; k++){
                 
  var jump= intervals[k];
  var hz=rootTone*Math.pow(2, (jump/12));
  scale[k]=hz;
  
  }
  firstFreq = frequencies.find(function(element) {
    return Math.abs(element - rootTone) < tolerance;
    // Defining the range of frequencies, within the MIDI notes spectrum, for the exercise, and, according to that, the frequencies distribution within the Microbit values range
  });
firstNoteIndex = frequencies.indexOf(firstFreq);
    firstNote = notes[firstNoteIndex];
lastNote = notes[firstNoteIndex + semitonesPerOctave * 2];
firstNoteMidiNum = firstMidiNum + firstNoteIndex;
lastNoteMidiNum = firstMidiNum + lastNoteIndex;
midNoteMidiNum = Math.floor((firstNoteMidiNum + lastNoteMidiNum) / 2);
midNote = notes[midNoteMidiNum - firstMidiNum];
midNoteIndex = notes.indexOf(midNote);
    lastNoteIndex = note.indexOf(lastNote);

lastFreq = frequencies[lastNoteIndex];
midFreq = frequencies[midNoteIndex];

 midFreq = frequencies[midNoteIndex];

notesNumber = lastNoteIndex - firstNoteIndex + 1;

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
    return scale;     
}



function majorScale(mode){
  var intervals;
  if(mode==0){ //ionian
              
                intervals=[0,2,4,5,7,9,11,12];
                      }
            if(mode==1){  //dorian
                 intervals=[0,2,3,5,7,9,10,12];
                   }
               if(mode==2){ //phrygian
                intervals=[0,1,3,5,7,8,10,12];
                   }                  
                if(mode==3){ //lydian
                  intervals=[0,2,4,6,7,9,11,12];   
                   }
               if(mode==4){ //mixolydian
                intervals=[0,2,4,5,7,9,10,12];
                   }
               if(mode==5){ //aeolian
                intervals=[0,2,3,5,7,8,10,12];
                   }                       
                if(mode==6){ //locrian
                  intervals=[0,1,3,5,6,8,10,12];} 
  
  return intervals;
}

function minorScale(mode){
  var intervals;
    if(mode==0){ //ionian
              
                intervals=[0,2,3,5,7,9,11,12];
                      }
               if(mode==1){  //dorian
                 intervals=[0,1,3,5,7,9,10,12];
                   }
               if(mode==2){ //phrygian
                intervals=[0,2,4,6,8,9,11,12];
                   }                  
                if(mode==3){ //lydian
                  intervals=[0,2,4,6,7,9,10,12];   
                   }
               if(mode==4){ //mixolydian
                intervals=[0,2,4,5,7,8,10,12];
                   }
               if(mode==5){ //aeolian
                intervals=[0,2,3,5,6,8,10,12];
                   }                       
                if(mode==6){ //locrian
                  intervals=[0,1,3,4,6,8,10,12];} 
  return intervals;
}

//creation of chord

 var arrSelectedRC = new Uint8Array(7); 


function selectRootChord(){
  
var elemsRC=document.getElementsByClassName("RCElm");
var rcArr = jQuery.makeArray(elemsRC);
var RCSelected= choiceAcquisition(rcArr, arrSelectedRC);
 
return RCSelected;
  
}


 var arrSelectedHC = new Uint8Array(2); 
 

function selectHarmonyChord(){
  
var elemsHC=document.getElementsByClassName("hcElm");
var hcArr = jQuery.makeArray(elemsHC);
var HCSelected= choiceAcquisition(hcArr, arrSelectedHC);
   
return HCSelected;
  
}


function createChord(rootScale, scale, rootChord, harmonyChord) {
    var chord = [];
 
  var rootIndex= rootChord;
     chord[0]= scale[rootIndex];

  if (harmonyChord==0){ //major chord
       chord[1]=chord[0]*Math.pow(2, (4/12));
       chord[2]=chord[1]*Math.pow(2, (3/12));
   }
  if (harmonyChord==1){ //minor chord
       chord[1]=chord[0]*Math.pow(2, (3/12));
       chord[2]=chord[1]*Math.pow(2, (4/12));}
console.log("CHORD", chord);
  return chord;
}

function selectChord(){
   //collecting all the choices:
  var possibleHS= selectHarmonyScale();
  var possibleM= selectMode();
  var possibleRS= selectRootScale();
 
//choosing among all the options selected by the user:
 var chosenHS =choicesSelection(possibleHS);
 var chosenM = choicesSelection(possibleM);
 var chosenRS= choicesSelection(possibleRS);
                  console.log("M: ", chosenM);
                                   
 //creating the scaling usign the final  parameters :    
 var scale= createScale(chosenHS,chosenM,chosenRS);
                   console.log("SCALE: ", scale);                 
//creating the actual chord:
  
var possibleRC= selectRootChord();
var possibleHC= selectHarmonyChord();                           
var chosenRC = choicesSelection(possibleRC);
var chosenHC = choicesSelection(possibleHC);
  var chord = createChord(chosenRS,scale, chosenRC,chosenHC);
  //var scaleRoots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  console.log("Scale root:", notes[frequencies.indexOf(firstFreq)]);
  console.log("CHORD:", chord);
  targets = chord;
  return chord;
} 

function resetOptions(){
var elemsHS=document.getElementsByClassName("hsElm");
 var hsArr = jQuery.makeArray(elemsHS);
changeToUnchecked(hsArr);
  
  
var elemsM=document.getElementsByClassName("modeElm");
var arrM = jQuery.makeArray(elemsM);  
  changeToUnchecked(arrM);
  
  
  var rsTones=document.getElementsByClassName("rsElm");
 var rsArr = jQuery.makeArray(rsTones);
  changeToUnchecked(rsArr);
  
  var elemsRC=document.getElementsByClassName("RCElm");
var rcArr = jQuery.makeArray(elemsRC);
  changeToUnchecked(rcArr);
  
  var elemsHC=document.getElementsByClassName("hcElm");
var hcArr = jQuery.makeArray(elemsHC);
  changeToUnchecked(hcArr);
   
    
}

function changeToUnchecked(arrElems){ //function that removes the checks from all of the checkboxes
  var i,k;
  

 for (k=0; k<arrElems.length; k++){
 
      if (arrElems[k].checked==true) {
          
      var thisId= arrElems[k].id;
      document.getElementById(thisId).checked = false;
      }
    
}
}
   
//at the beginning all the choices are se to zero and therefore we have to store this initial situation
selectHarmonyScale();
selectMode();
selectRootScale();
selectRootChord();
selectHarmonyChord();

document.getElementById("bigRedButton").onclick = function(){ 
                                          selectChord();
                                                            };

//change chord inizialization (doesn't change setting)
document.getElementById("replay").onclick = function() {selectChord();
                                                     };
document.getElementById("reset").onclick = function() {resetOptions();};


// MICROBIT DATA MANAGEMENT


//------------------------------------------------ INITIAL VARIABLES


// Useful constants
var firstMidiNum = 21;
var firstMidiFreq = 27.5;
var offset = 15;
var psoFrequencies;
    var firstNote;
var lastNote;
var firstNoteMidiNu;
var lastNoteMidiNum;
var midNoteMidiNum;
var midNote;
var midNoteIndex;
var firstNoteIndex;
     var lastNoteIndex;

var lastFreq;
var midFreq;

var notesNumber;

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
var targets = [];
var targetsCopy = targets;
var found = [];
var tolerances = [];

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
/*
// Defining the range of frequencies, within the MIDI notes spectrum, for the exercise, and, according to that, the frequencies distribution within the Microbit values range
var firstNote;
var lastNote;

firstNoteIndex = notes.indexOf(firstNote);
lastNoteIndex = notes.indexOf(lastNote);

var firstNoteMidiNum = firstMidiNum + firstNoteIndex;
var lastNoteMidiNum = firstMidiNum + lastNoteIndex;
var midNoteMidiNum = Math.floor((firstNoteMidiNum + lastNoteMidiNum) / 2);
var midNote = notes[midNoteMidiNum - firstMidiNum];
midNoteIndex = notes.indexOf(midNote)

var firstFreq;
var lastFreq;
var midFreq = frequencies[midNoteIndex];

var notesNumber = lastNoteIndex - firstNoteIndex + 1;

// These are the frequencies for the selected range in the MIDI spectrum
psoFrequencies = [firstFreq];
var semitoneSubdivisions = Math.floor(mircoValues / notesNumber);
var spread = mircoValues % notesNumber;
for (i = 0; i < Math.floor(mircoValues / 2) - spread; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));
for (i = Math.floor(mircoValues / 2) - spread; i < Math.floor(mircoValues / 2) + spread; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * (semitoneSubdivisions + 1))));
for (i = Math.floor(mircoValues / 2) + spread; i < mircoValues - 1; i++)
  psoFrequencies.push(psoFrequencies[i] * Math.pow(2, 1 / (semitonesPerOctave * semitoneSubdivisions)));*/

// These are the AudioContext and the pitch shifter oscillator
var c = new AudioContext();
var pso = c.createOscillator();
var g = c.createGain();
pso.connect(g);
g.connect(c.destination);
//pso.frequency.value = midFreq;


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
      playChord(targets);
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
  for (i = 0; i < targets.length; i++) {
    if (Math.abs(currentFreq - targets[i]) <= tolerance[i]) {
      found.push(targetsCopy.splice(1,i));
      if (targetsCopy.isEmpty)
        alert("CONGRATULATIONS! You completed the chord!");
      else alert("CORRECT!");
    }
    else if (Math.abs(currentFreq - targets[i]) <= tolerance[i] * 3) {
      if (currentFreq < targets[i])
        alert("Almost! Just a bit higher!");
      else alert("Almost! Just a bit lower!");
    }
  }
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



// This function is used by the "CHORD" button to play the given chord back
function playChord(f1, f2, f3) {
  if (playing) {
    stop();
    paused = true;
  }
  var o = [];
  var g = [];
    var now = c.currentTime;
    o[0] = c.createOscillator();
    g[0] = c.createGain();
    o[0].connect(g[0]);
    g[0].connect(c.destination);
    o[0].frequency.value = f1;
    g[0].gain.value = 0;
    g[0].gain.linearRampToValueAtTime(.5,now+0.01);
    g[0].gain.linearRampToValueAtTime(0,now+2.6);
    o[0].start(now);
    o[0].stop(now+3);
    o[1] = c.createOscillator();
    g[1] = c.createGain();
    o[1].connect(g[1]);
    g[1].connect(c.destination);
    o[1].frequency.value = f2;
    g[1].gain.value = 0;
    g[1].gain.linearRampToValueAtTime(.25,now+0.01);
    g[1].gain.linearRampToValueAtTime(0,now+2.6);
    o[1].start(now);
    o[1].stop(now+3);
    o[2] = c.createOscillator();
    g[2] = c.createGain();
    o[2].connect(g[2]);
    g[2].connect(c.destination);
    o[2].frequency.value = f3;
    g[2].gain.value = 0;
    g[2].gain.linearRampToValueAtTime(.2,now+0.01);
    g[2].gain.linearRampToValueAtTime(0,now+2.6);
    o[2].start(now);
    o[2].stop(now+3);
  if (paused) {
    setTimeout(play, 3000);
    paused = false;
  }
}

// This function is used by the "NOTE" button to play the given note back
function playback(...chord) {
  if (playing) {
    stop();
    paused = true;
  }
  var o = [];
  var g = [];
  for (i = 0; i < chord.length; i++) {
    o[i] = c.createOscillator();
  g[i] = c.createGain();
  o[i].connect(g[i]);
  g[i].connect(c.destination);
  o[i].frequency.value = chord[i];
  g[i].gain.value = 0;
  var now = c.currentTime;
  g[i].gain.linearRampToValueAtTime(1,now+0.01);
  g[i].gain.linearRampToValueAtTime(0,now+0.6);
  o[i].start(now);
  o[i].stop(now+1);
  }
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