const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 4000;
const countriesFilePath = 'countries.json';
const districtsFilePath = 'district.json';
const apiKey = 'e9Zp2QgnWv6RXfTkU1d0sM7aJqI8phoV';

const logStream = fs.createWriteStream('access.log', { flags: 'a' });

app.use(bodyParser.json());

app.use(
  session({
    secret: 'e9Zp2QgnWv6RXfTkU1d0sM7aJqI8phoV',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 30 * 60 * 1000,
    },
  })
);

app.use((req, res, next) => {
  const providedApiKey = req.headers['x-api-key'];
  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Author-Name', 'Subash');
  res.setHeader('X-Author-Email', 'subash.muthusamy@aspiresys.com');
  next();
});

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const url = req.url;
  const query = req.query;
  const requestBody = req.body;
  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks = [];

  res.write = function (chunk) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    }
    oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    }

    const responseBody = Buffer.concat(chunks).toString('utf8');
    const responseStatusCode = res.statusCode;
    console.log(`IP Address: ${ip}`);
    console.log(`Request Method: ${method}`);
    console.log(`Request URL: ${url}`);
    console.log(`Query Parameters:`, query);
    console.log(`Request Body:`, requestBody);
    console.log(`Response Status Code: ${responseStatusCode}`);
    console.log(`Response Body:`, responseBody);
    const logMessage = `IP Address: ${ip}, Request Method: ${method}, Request URL: ${url}, Query Parameters: ${JSON.stringify(
      query
    )}, Request Body: ${JSON.stringify(
      requestBody
    )}, Response Status Code: ${responseStatusCode}, Response Body: ${responseBody}`;
    logStream.write(`${logMessage}\n`);
    res.write = oldWrite;
    res.end = oldEnd;

    oldEnd.apply(res, arguments);
  };

  next();
});
const asianCountryCodes = [
  { country: 'Afghanistan', code: '+93' },
  { country: 'Armenia', code: '+374' },
  { country: 'Azerbaijan', code: '+994' },
  { country: 'Bahrain', code: '+973' },
  { country: 'Bangladesh', code: '+880' },
  { country: 'Bhutan', code: '+975' },
  { country: 'Brunei', code: '+673' },
  { country: 'Cambodia', code: '+855' },
  { country: 'China', code: '+86' },
  { country: 'Cyprus', code: '+357' },
  { country: 'Georgia', code: '+995' },
  { country: 'India', code: '+91' },
  { country: 'Indonesia', code: '+62' },
  { country: 'Iran', code: '+98' },
  { country: 'Iraq', code: '+964' },
  { country: 'Israel', code: '+972' },
  { country: 'Japan', code: '+81' },
  { country: 'Jordan', code: '+962' },
  { country: 'Kazakhstan', code: '+7' },
  { country: 'Kuwait', code: '+965' },
  { country: 'Kyrgyzstan', code: '+996' },
  { country: 'Laos', code: '+856' },
  { country: 'Lebanon', code: '+961' },
  { country: 'Malaysia', code: '+60' },
  { country: 'Maldives', code: '+960' },
  { country: 'Mongolia', code: '+976' },
  { country: 'Myanmar', code: '+95' },
  { country: 'Nepal', code: '+977' },
  { country: 'North Korea', code: '+850' },
  { country: 'Oman', code: '+968' },
  { country: 'Pakistan', code: '+92' },
  { country: 'Palestine', code: '+970' },
  { country: 'Philippines', code: '+63' },
  { country: 'Qatar', code: '+974' },
  { country: 'Saudi Arabia', code: '+966' },
  { country: 'Singapore', code: '+65' },
  { country: 'South Korea', code: '+82' },
  { country: 'Sri Lanka', code: '+94' },
  { country: 'Syria', code: '+963' },
  { country: 'Taiwan', code: '+886' },
  { country: 'Tajikistan', code: '+992' },
  { country: 'Thailand', code: '+66' },
  { country: 'Timor-Leste', code: '+670' },
  { country: 'Turkey', code: '+90' }, // Partially in Asia
  { country: 'Turkmenistan', code: '+993' },
  { country: 'United Arab Emirates', code: '+971' },
  { country: 'Uzbekistan', code: '+998' },
  { country: 'Vietnam', code: '+84' },
  { country: 'Yemen', code: '+967' },
];

let countriesData = [];
fs.readFile(countriesFilePath, 'utf8', (err, data) => {
  if (!err) {
    try {
      countriesData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing countries data:', parseError);
    }
  } else {
    console.error('Error reading countries file:', err);
  }
});

let districtsData = [];
fs.readFile(districtsFilePath, 'utf8', (err, data) => {
  if (!err) {
    try {
      districtsData = JSON.parse(data);

      startServer();
    } catch (parseError) {
      console.error('Error parsing districts data:', parseError);
    }
  } else {
    console.error('Error reading districts file:', err);
  }
});

function startServer() {
  app.post('/countries/states/districts', (req, res) => {
    const stateName = req.body.state;
    const state = districtsData.states.find(
      (state) => state.state === stateName
    );
    if (!state) {
      res.status(404).json({ error: 'State not found' });
    } else {
      res.json({ districts: state.districts });
    }
  });

  app.get('/countrycodes', (req, res) => {
    const countryCodes = asianCountryCodes.map((country) => country.code);
    res.json(countryCodes);
  });

  app.get('/countries', (req, res) => {
    const countryNames = countriesData.map((country) => country.name);
    res.json({ countries: countryNames });
  });

  app.post('/countries/states', (req, res) => {
    const countryName = req.body.country;
    const country = countriesData.find(
      (country) => country.name === countryName
    );
    if (!country) {
      res.status(404).json({ error: 'Country not found' });
    } else {
      res.json({ states: country.states });
    }
  });

  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
}
