#!/usr/bin/env node

const axios = require('axios');
const moment = require('moment-timezone');
const yargs = require('yargs');

// Set up command line options
const options = yargs
  .usage('Usage: -d <number> -n <number> -s <number> -e <number> -w <number> -z <timezone>')
  .option('d', {
    alias: 'day',
    describe: 'Specify which day to check precipitation hours (0 for today, 1 for tomorrow, 2-6 for days in the future)',
    type: 'number',
    demandOption: true
  })
  .option('h', {
    alias: 'help',
    describe: 'Show this help message and exit.',
    type: 'boolean'
  })
  .option('j', {
    alias: 'json',
    describe: 'Echo pretty JSON from OpenMeteo API and exit.',
    type: 'boolean'
  })
  .option('n', {
    alias: 'latitude-north',
    describe: 'Specify the northern latitude (positive number with at most 2 decimal places)',
    type: 'number',
    demandOption: true
  })
  .option('s', {
    alias: 'latitude-south',
    describe: 'Specify the southern latitude (negative number with at most 2 decimal places)',
    type: 'number',
    demandOption: true
  })
  .option('e', {
    alias: 'longitude-east',
    describe: 'Specify the eastern longitude (positive number with at most 2 decimal places)',
    type: 'number',
    demandOption: true
  })
  .option('w', {
    alias: 'longitude-west',
    describe: 'Specify the western longitude (negative number with at most 2 decimal places)',
    type: 'number',
    demandOption: true
  })
  .option('z', {
    alias: 'timezone',
    describe: 'Specify the timezone (e.g. America/New_York)',
    type: 'string'
  })
  .argv;

if (argv.j) {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=51&longitude=7')
    .then(res => res.json())
    .then(data => {
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

// Get the system timezone if not specified
const timezone = options.timezone ? options.timezone : moment.tz.guess();

// Make a request to Open-Meteo API
axios.get(`https://api.open-meteo.com/v1/forecast?latitude_from=${options.s}&latitude_to=${options.n}&longitude_from=${options.w}&longitude_to=${options.e}&timezone=${timezone}`)
  .then(response => {
    const data = response.data;
    const dayIndex = options.day;
    const precipitationHours = data.forecast_24h[dayIndex].precipitation_hours;

    // Determine if galoshes are needed based on precipitation hours
    const message = precipitationHours > 0 ? 'You might need your galoshes' : 'You will not need your galoshes';
    console.log(message);

    // Output the correct day
    let dayMessage;
    if (dayIndex === 0) {
      dayMessage = 'today';
    } else if (dayIndex === 1) {
      dayMessage = 'tomorrow';
    } else {
      dayMessage = `in ${dayIndex} days`;
    }
    console.log(`Precipitation hours ${dayMessage}: ${precipitationHours}`);
  })
  .catch(error => {
    console.error(error);
  });
