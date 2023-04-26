#!/usr/bin/env node

import minimist from 'minimist';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const args = minimist(process.argv.slice(2));
const timezone = moment.tz.guess();

if (args.h) {
  console.log(`
Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.
  `);
  process.exit(0);
}

const latitude = (args.n || args.s) * (args.n ? 1 : -1);
const longitude = (args.e || args.w) * (args.e ? 1 : -1);
const timeZone = args.z || timezone;
const days = args.d === undefined ? 1 : args.d;
const jsonOutput = args.j;

const requestUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_hours&timezone=${timeZone}`;

async function getWeatherData() {
  try {
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (jsonOutput) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (days === 0) {
      console.log('today');
    } else if (days === 1) {
      console.log('tomorrow');
    } else {
      console.log(`in ${days} days`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getWeatherData();