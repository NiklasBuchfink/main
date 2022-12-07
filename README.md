# Fetch LinkedIn Profile Data

This is a serverless function to fetch LinkedIn profile data. It uses puppeteer to get data from the LinkedIn profile page and returns the data in JSON format.

## Usage

1. Clone the repository
2. Run `yarn`
3. Run `yarn server`

or to run the script locally without the server:

1. Clone the repository
2. Run `yarn`
3. Run `yarn start`

## Serverless API

Local server: http://localhost:3000/serverless
Run `yarn serverless` to start the serverless API.

A typical request to a serverless function might look something like this:

```js
const response = await fetch('http://localhost:3000/serverless', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.linkedin.com/in/username',
  }),
});
```

## Testing

Send a POST request to http://localhost:3000 with the LinkedIn profile URL in the body. Example:

```bash
curl -X POST http://localhost:3000/linkedin -d '{"url": "https://www.linkedin.com/in/username/"}' -H "Content-Type: application/json"
```
