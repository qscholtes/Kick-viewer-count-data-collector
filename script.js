const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

// Function to fetch sum and store it with timestamp
async function fetchAndStoreSum(data, username) {
  const url = `https://kick.com/${username}`;

  // Launch a headless browser with the new headless mode
  const browser = await puppeteer.launch({ headless: 'new' });
  
  // Open a new page
  const page = await browser.newPage();

  // Navigate to the user's page
  await page.goto(url);

  // Wait for the page to load completely (you may need to adjust the wait time)
  await page.waitForTimeout(5000);

  // Extract values from the rendered DOM
  const sum = await page.evaluate(() => {
    // Function to extract odometer digit values from the rendered DOM
    function extractOdometerDigitValues() {
      // Select all elements with the class 'odometer-digit'
      const odometerDigits = document.querySelectorAll('.odometer-value');

      // Initialize an empty string to store concatenated digit values
      let concatenatedDigits = '';

      // Loop through each element
      odometerDigits.forEach(element => {
        // Extract text content from the element and concatenate it
        concatenatedDigits += element.textContent.trim();
      });

      // Parse the concatenated string as an integer
      const sum = parseInt(concatenatedDigits, 10);

      return sum;
    }

    // Call the function to extract odometer digit values
    return extractOdometerDigitValues();
  });

  // Close the browser
  await browser.close();

  // Store the fetched sum with current timestamp
  const timestamp = new Date().toISOString();
  data.push({ timestamp, sum });

  // Return the fetched sum
  return sum;
}

// Function to periodically save data to a JSON file
async function saveDataToFile(data, filename) {
  try {
    // Write data to JSON file
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log('Data saved to', filename);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Main function to run continuously
async function runContinuously(data, username) {
  const filename = `${username}.data.json`;

  while (true) {
    const sum = await fetchAndStoreSum(data, username);
    console.log('Viewers:', sum);
    await saveDataToFile(data, filename);
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds
  }
}

// Initialize data array
const data = [];

// Define filename for saving data
const filename = 'data.json';

// Start running the script continuously
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user for the username
rl.question('Enter the username (e.g., username): ', (username) => {
  console.log(`Fetching data for user: ${username}`);
  runContinuously(data, username).catch(error => console.error('Error:', error));
});