[![Build Status](https://travis-ci.org/tarciosaraiva/rpipeline-ui.svg?branch=master)](https://travis-ci.org/tarciosaraiva/rpipeline-ui)
[![Code Climate](https://codeclimate.com/github/tarciosaraiva/rpipeline-ui.png)](https://codeclimate.com/github/tarciosaraiva/rpipeline-ui)
[![Dependency Status](https://gemnasium.com/tarciosaraiva/rpipeline-ui.svg)](https://gemnasium.com/tarciosaraiva/rpipeline-ui)
[![Gitter chat](https://badges.gitter.im/tarciosaraiva/rpipeline-ui.png)](https://gitter.im/tarciosaraiva/rpipeline-ui)

Raspberry Pipeline GUI Config
=============================

UI for configuring [Raspberry Pipeline](https://github.com/jkelabora/raspberry-pipeline)

This project was born on the need of easily configuring an LED stripe - specifically [LPD8806](http://www.adafruit.com/products/306) - to work with the project referred above.

Since the project above was written in Python and I wanted to have the whole thing written in **nodejs**, this project was then born.

Features
---
* One LED strip, multiple jobs on your CI
* 4 animations to choose from
* Completely decoupled architecture
* No need to create complicated configuration files, use the UI and let the tool do the heavy lifting for you
* Play a sound on Success, Fail, Abort and Unstable build
* Compared to other build light solutions, value for money is indeed a feature! Just a bit over $100 with the Pi!

What you need
----
* [Raspberry Pi Type B](http://www.adafruit.com/category/105)
* [Occidentalis](https://learn.adafruit.com/adafruit-raspberry-pi-educational-linux-distro/overview)
* [nodejs for ARM processor](http://nodejs.org/dist/v0.10.26/node-v0.10.26-linux-arm-pi.tar.gz)

And here's the full list of components copied from the [Raspberry Pipeline project](https://github.com/jkelabora/raspberry-pipeline).

* [Digital RGB LED Weatherproof Strip 32 LED - (1m)](https://www.adafruit.com/products/306)
* [Adafruit Pi Cobbler Breakout Kit for Raspberry Pi](http://www.adafruit.com/products/914)
* [5V 2A (2000mA) switching power supply - UL Listed](https://www.adafruit.com/products/276)
* [Female DC Power adapter - 2.1mm jack to screw terminal block](https://www.adafruit.com/products/368)
* [4-pin JST SM Plug + Receptacle Cable Set](http://www.adafruit.com/products/578)

Electronics
----
You will need to do some soldering if you want the whole thing to hang together without worries. You can still get around with a breadboard but soldering is the best bet.

You can follow the wiring and hardware setup instructions detailed [here](http://learn.adafruit.com/light-painting-with-raspberry-pi/hardware).

How to run
----
Once you have everything setup then run...

    npm install -g rpipeline-ui

... and it will install the program. It may be required that you use `sudo` depending on your machine configuration.

After that execute...

    sudo rpipeline

... and off you go. Browse to [http://localhost:3000 ](http://localhost:3000) to access the configuration page.

**_Note:_** you need to use `sudo` here to communicate with the LED stripe. As a matter of fact, all GPIO communication has to be done using `sudo`. There's a Linux project that masks this ability and you can install using the distro's package manager but I don't remember which it is now.

What you can do
----
The configuration is a single page divided in four blocks:

* LEDs
* Pipeline
* Sounds
* Queue

### LEDs
You can configure the following items:

* Number of LEDs in the strip
* Colours for the following build status
  * Success
  * Fail
  * Aborted
  * Unstable
* Animation
  * Knight rider
  * Rainbow
  * Flashing
  * And a standard animation that is pretty cool
* Animation speed
* Animation colour

I also provide a feature for you to test your LED to check connectivity.

### Pipeline
You can create as many pipelines and stages as you want up to the number of LEDs in your strip. You can name the pipelines and stages and test them individually.

### Sounds
Upload one file per build status. It's completely optional.

### Queue
By default we use AWS.

TODO