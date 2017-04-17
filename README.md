= RRP-VPE =

This is a Visual Programming Environment (VPE) for applications written using the Reactive Robot Programming (RRP) paradigm. We hope that by using visual tools and the reactive programming we can make it easier and more intuitive to develop applications.

RRP is a graph based notation for programming robots and other Internet of Things (IOT) devices.

The RRP-VPE is being developed by the Artificial Intelligence Laboratory of the University of Tsukuba, Japan.

We have developed the RRP-Runtime for running programs written using the RRP-VPE.

== RRP Graphs ==

RRP Graphs are based on the idea of Complex Event Processing. A developer defines the processing to transform inputs into outputs by using operators using a graph based structure. Some example operators are map, filter, sample, timestamp, combineLatest and subscribe. Most operators support procedural parameters (e.g. the name of a function or a lambda expression). One can think of this as the operator specifying what should be done, and the procedural parameter specifying how to do it.

A simple hello world (changing the intensity of a LED based on the distance to an object) looks as follows:
``` 
Distance - map(brightness) -> LED Brightness 
```
Where Distance is the distance stream, LED Brightness is the stream which contains the actual brightness of an LED, map is an operator which transforms inputs by applying the function it is given as procedural parameter, and brightness is the function passed as parameter to the map operator. Functions can be defined in a language supported by the RRP-Runtime.

An Python implementation of a distance function looks as follows:
```python
def brightness(distance):
    if distance > 20:
        return 0
    elif distance > 5:
        return (20-distance)/15.
    else:
        return 1
```
This function simply maps distance (ranging from 0 to infinite) to a value from 0 to 1 (where the maximum distance considered is 20 units, which will be mapped to a brightness value of 1, i.e. 100% brightness)

The following is an extended version of the previous example, written for running on a Softbank Robotics' NAO robot:
```
Ball - sample(50) -> BallSamples - map(ball_distance) -> Distance - map(brightness) -> LED Brightness
```
Where Ball is a ball detection "sensor", sample is an operator which samples a stream based on its parameter (expressed in msec). BallSamples and Distance are simply streams.

Most of the magic of an RRP program happens inside the sensors, functions and actuators.

== Getting started ==

The RRP-VPE consists of an ExpressJS web application build on top of a Neo4j graph database. To run applications a runtime environment is needed. We provide a Python-based runtime environment called RRP-Runtime.

== Thanks ==

This project is build using various Open Source projects, including ExpressJS, KnockoutJS, jsplumb, socket.io and bootstrap. The project is inspired by Reactive Extensions and its marble diagrams.