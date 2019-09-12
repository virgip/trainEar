# TrainEar
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![title](https://66.media.tumblr.com/561c299469a3f1eac6fcbb6c54950688/tumblr_inline_pozn7q1t1B1szlklo_540.png "t")



A web-app for relative pitch training that makes use of Micro Bit's accelerometer turning it into a knob for playing simple music games. 

Choose among 4 exercises about different topics and with various levels of difficulty to improve and challenge your ability to recognise and reproduce different notes, pitches, intervals and chords!
 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![Exercises](http://oi65.tinypic.com/wcjps5.jpg "Es")

## Aim and audience
What we would like to achieve throught this project is creating a tool for the musician and the amateur which might come in handy when in need of improving the relative pitch skills; in doing so, we decided to create a nice and simple interface that is also everywhere accessible, provided the users has Micro Bit at disposal. The code is designed to be easily editable to accomodate different needs and experiences as for precision, difficulty level, and musical parameters.

## What you need
 * An internet connection
 * A Micro Bit
 * A device provided with Bluetooth connection
 * Headphones are recommended to improve the experience

## How to start
* Connect Micro Bit via USB to your device and inject the provided code, you can download it from the folder above or from https://makecode.microbit.org/_gDFCWT03gdmj
* Disconnect the USB cable from Micro Bit and plug Micro Bit to its battery supply.
* Open the web-app: http://trainear-home.surge.sh/ (not all feature are available on surge, so we suggest to download the code)
* Choose an exercise
* Make sure Bluetooth is activated on your device
* Connect Micro Bit via Bluetooth pressing the "Search device" button on top right and selecting "BBC micro:bit [device code]" from the BT devices list, where "[device code]" is a particular code for identifying your Micro Bit as a BT device.
* Once the "Connected!" string appears right below the "Search device" button, you are ready to play!


## The code behind the exercises 
 The core point of this project application is communicating with Mirco bit, a microcontroller based on a small electronic board provided with leds, pins, and sensors. In particular, we exploited its accelerometer on one axis (X, the one cutting the longest side in two) to turn the device into a knob. Micro Bit is able to detect overall 129 different values rotating from the starting face-up position 90° clockwise and 90° counterclockwise. In any of the cases, the rotation position is mapped into a frequency variation speed value, which tells how fast the pitch of the note you can control varies. The communication with Micro Bit takes advantage of the Bluetooth protocol, through the built-in tools for Bluetooth services that come with Micro Bit. The web-app is triggered whenever a Bluetooth signal is sensed, and acts accordingly to the received signal type. A "pitch-shifter-oscillator" produces the sound whose variation in pitch is controlled by Micro Bit's position (the horizontal position of the knob corresponds to a still note pitch, so zero-variation), while pressing buttons on Micro Bit triggers useful functions for accomplishing the exercises goals. What the user is supposed to do is to rotate the knob to change the "pitch-shifter-oscillator" frequency and get as close as possible to the note the games require to find from time to time, and then confirm that particular tone to be the answer to the request.
 
## Exercises
 A set of instructions appears at the top of the page, whose language can be changed from Italian to English.
 Micro Bit's buttons are used to perform the same functions as the buttons on the interface. 
 
### Pitch Reproduction  

This is considered the easiest execise: the user has just to listen to a note and then try to reproduce the same note either with the same pitch or with a higher/lower one (different octaves), accordingly to what is written as request each different time.

### Interval Reproduction
The idea behind this exercise is similar to the one of the previous one, but instead of reproducing the same note, the user is asked to find a tone set to a specific distance from the given one. In order to help the users to learn better and to really improve their skills, it's possible to set three distinct levels of difficulty, which determine the number of intervals that can be asked. The interval is chosen randomply by a simulated slot machine.

### Chord Reproduction
During this exercise, the user is asked to select the notes appearing in a specific chord. The large amount of possible choices is aimed to give the user exactly the kind of request they want to go for, as for a set of musical parameters (harmony scale, mode, scale root, chord root and chor type), to build the chord.
The choices can be made in random order. Once the user is satisfied with their selections, they may press the red button in order to generate an actual request. The system then performs a random choice among all the selected values, one for each parameter, to finally build the chord. If no choice is made, the final selection is performed randomly among all the possible values for all the parameters. If the user decides to change the options, the red button has to be pressed again to make the changes effective and generate a new chord.

### Read and Play the Note

This exercise is the most complicated one and requires the user to have at least a good relative pitch training, but actually absolute pitch is what comes about within this exercise. Indeed, in this case we require the user guesses the target note just by reading it on screen. This target note is chosen by chance by a simulated slot machine. Here's a trick: if you don't own absolute pitch, but all you need is a reference, known, note, you might press the "PLAY" button before the knob is connected via Bluetooth: this will allow you to listen to the starting note for the pitch-shifter-oscillator, which is an A4! ;j

#### Future Developement
* A point, score and challenges system will be added to boost the interest on the various games.
* Negative intervals (i.e., going backwards from the interval's base note) will be integrated in the Interval Reproduction exercise.

#### Additional Info
Atom was used for developing the code for Micro Bit's data management, the modeling of musical aspects and for the interface. The app has been implemented using Javascript, HTML and CSS and was uplodaded online using surge.sh.
