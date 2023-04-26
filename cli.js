#!/usr/bin/env node

import minimist from 'minimist';
import moment from 'moment-timezone';
import fetch from 'node-fetch';

var argv = minimist(process.argv.slice(2))

if (argv.h) {
    console.log(
    "\nUsage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE\n\t" +
        "-h            Show this help message and exit.\n\t" +
        "-n, -s        Latitude: N positive; S negative.\n\t" +
        "-e, -w        Longitude: E positive; W negative.\n\t" +
        "-z            Time zone: uses tz.guess() from moment-timezone by default.\n\t" +
        "-d 0-6        Day to retrieve weather: 0 is today; defaults to 1.\n\t" +
        "-j            Echo pretty JSON from open-meteo API and exit.\n"
    )
    process.exit(0);
}

if ("t" in argv) {
    var timezone = argv["t"]
} else {
    var timezone = moment.tz.guess()
}

if ("s" in argv) {
    var lat = -1 * Math.round(argv["s"] * 100) / 100
} else {
    var lat = Math.round(argv["n"] * 100) / 100
}

if ("e" in argv) {
    var long = Math.round(argv["e"] * 100) / 100
} else {
    var long = -1 * Math.round(argv["w"] * 100) / 100
}

if ("d" in argv) {
    if (0 <= argv["d"] && argv["d"] <= 6) {
        var day = argv["d"]
    } else {
        console.error("Error: '-d' arg must be between 0-6")
        process.exit(0);
    }
} else {
    var day = 1
}

var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + long + "&daily=precipitation_hours&timezone=" + timezone

const response = await fetch(url);

const data = await response.json();

if ("j" in argv) {
    console.log(data);
    process.exit(0);
}

var weather = ""

if (data.daily.precipitation_hours[day] > 0) {
    weather += "You will need your galoshes "
} else {
    weather += "You will not need your galoshes "
}

if (day == 0) {
    weather += "today."
} else if (day > 1) {
    weather += "in " + day + " days."
} else {
    weather += "tomorrow."
}

console.log(weather)
process.exit(0);