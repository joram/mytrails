#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const API_KEY = 'Iwn6Aqz9lZl84R1vIUDvJUjbdtIjEEpL';
const SERVER_URL = 'mcp.envariants.com';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    
    const options = {
      hostname: SERVER_URL,
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        console.log(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
    });

    req.write(JSON.stringify(data));
    req.end();
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});


