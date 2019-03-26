# trainEar
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![title](https://66.media.tumblr.com/561c299469a3f1eac6fcbb6c54950688/tumblr_inline_pozn7q1t1B1szlklo_540.png "t")



Our fantastic web-app for relative pitch training that makes use of MicroBit's accelerometer turning it into a knob for playing simple music games. 

Choose from 4 exercises about different topics and with various levels of difficulty to improve and challenge your ability to recognise and reproduce different notes, pitches, intervals and chords! 
 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![Exercises](http://oi65.tinypic.com/wcjps5.jpg "Es")

## Aim and Audiance
What we would like to achieve throught this project is creating a tool for the musician and the amateur which might come in handy when in need of improving the relative pitch skills; in doing so, we decided to create a nice and simple interface that is also everywhere accessible. The code is designed to be easily editable to accomodate different needs and experiences as for precision, difficulty level, and musical parameters.

## What do you need
 * An internet connection
 * A Microbit
 * Hairless-midiserial (download it here: http://projectgus.github.io/hairless-midiserial/)
 * You can use headphones to improve the experience

## How to start
* Connect the MicroBit and download the provided code: https://makecode.microbit.org/53398-89763-46381-34336
* Open hairless
* Open the web-app: http://trainear-home.surge.sh/
* Choose an exercise!


## The code behind the exercises 

## Exercises
 At the top of the page there's a set of instruction, whose language can be changed from Italian to English.
 Microbit's buttons are used to perform the same functions as the buttons on the interface. 
### Pitch Reproduction  

Link:
This is considered the easiest execises and the user just has to listen to a note and then try to reproduce the same note either with the same pitch or with a higher/lower one (different octaves). 
The restart icon changes the reference note and the target. 

### Interval Reproduction
LINK:
The idea behind this exercise is similar to the one of the previous one, but instead of reproducing the same note, the user is asked to find a tone set to a specific distance from the given one. In order to help the users to learn better and to really improve their skills, it's possible to set three distinct levels of difficulty, which determine the number of intervals that can be asked. 
Microbit's range starts from an octave below the root of the requested interval.

### Chord Reproduction
LINK:
The large amount of possible choices is thought for giving the user exactly the kind of request they want to go for. If no choice is made, the final selection is performed randomly and the same happens in case of multiple choices.
The choices can be made in random order. Once the user is satisfied with their selections, he's going to press the red button in order to generate an actual request. If he/she decides to change the options, the red button has to be pressed again to make the changes effective. 


### Read and Play the Note
LINK:
This exercise is the most complicated one and requires the user to have at least a good relative pitch training. Indeed, in this case we require the user guesses the target note just by reading it on screen. This target note is chosen by chance by a simulated slot machine. 

#### Future Developement
* A gyroscope will be connected to MicroBit, in order to increase the amount of values at disposal for the spanning range.
* A point and challenges system will be added to boost the interest on the various games.
* A visual plot of the chord notes will be added to ease the exercise management 
* More kinds of chords could be added to the third exercise (semi-diminished, dominant 7th chords...)

#### Additional Info
Codepen was used for Microbit's data management, for the modeling of musical aspects and for the interface. The app was uplodaded online using surge.sh.
