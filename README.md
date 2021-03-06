# RRP-VPE

This is a Visual Programming Environment (VPE) for writing applications using the Reactive Robot Programming (RRP) paradigm. We hope that by using visual tools and reactive programming we can make it easier and more intuitive to develop applications.

RRP is a graph based notation for programming robots and other Internet of Things (IOT) devices.

The RRP-VPE is being developed by the [Artificial Intelligence Laboratory](http://ai.iit.tsukuba.ac.jp) of the [University of Tsukuba](http://www.tsukuba.ac.jp), Japan.

We have also developed a [runtime architecture](https://github.com/FlorisE/cep_runtime) for running programs written using the RRP-VPE.

# Caution

This project is designed to be run on a local machine which is connected with the robot. Sanitation of user input is mostly done client side at this point, hence there is some chance of a user abusing the system and even doing injection in the Cypher code used to query the graph database. We will be improving this in the near future, but for now we recommend not publically exposing a running instance.

We have tested the RRP-VPE under Chrome on Ubuntu 16.10, 17.10 and Windows 10. Currently we do not have the resources to test this project using multiple and older versions of browsers and other operating systems. 

# RRP Graphs

RRP Graphs are based on the concept of Complex Event Processing. A developer defines the processing to transform inputs into outputs by using connectors using a graph based structure. Some example operators are map, filter, sample, timestamp, combineLatest and subscribe. Most connectors support procedural parameters (e.g. the name of a function or a lambda expression). One can think of this as the connector specifying what should be done, and the procedural parameter specifying how to do it.

A simple hello world (changing the intensity of a LED based on the distance to an object) looks as follows:
``` 
Distance - map(brightness) -> LED Brightness 
```
Where Distance is the distance stream, LED Brightness is the stream which contains the actual brightness of an LED, map is a connector which transforms inputs by applying the function it is given as procedural parameter, and brightness is the function passed as parameter to the map operator. Functions can be defined in a language supported by the RRP-Runtime.

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
Where Ball is a ball detection "sensor", sample is a connector which samples a stream based on its parameter (expressed in msec). BallSamples and Distance are simply streams.

Most of the magic of an RRP program happens inside the sensors, procedural parameters and actuators.

# Getting started

The RRP-VPE consists of an ExpressJS web application build on top of a Neo4j graph database. To run applications a runtime environment is needed. We provide a Python-based runtime environment called RRP-Runtime.

## Manual installation
To install this project follow these steps:
1. Install the current version of NodeJS (we do not currently support the LTS version)
2. Clone (`git clone https://github.com/FlorisE/RRP`) this repository and `cd` into it
3. Run `npm install`
4. Install Neo4j (we have tested the RRP-VPE using the community edition). Start it and go to the Neo4j Browser (usually at http://localhost:7474). Log in using the default username and password (typically `neo4j` as username and `neo4j` as password). RRP by default uses `neo4j` as username and `rrp` as password. This can be changed in line 5 of `util/ClientHandler.js`.
5. Copy the example database in the `example_db` folder into the Neo4j data folder (for the location of the Neo4j databases, see https://neo4j.com/docs/operations-manual/current/configuration/file-locations/)
6. Run `node bin/www` to start. Access the RRP-VPE using your web browser at http://localhost:3000

## Installation using Docker
Make sure you have Docker and Docker-Compose installed (see https://docs.docker.com/compose/install/)

Simply running `docker-compose up` in the checked out repository should get you up and running. The RRP-VPE will be available from http://localhost:3000.

# Thanks

This project is build using various Open Source projects, including ExpressJS, KnockoutJS, jsplumb, socket.io and bootstrap. The project is inspired by Reactive Extensions and its marble diagrams.
