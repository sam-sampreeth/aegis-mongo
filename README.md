# Aegis Password Manager

A simple password manager built using React and Bootstrap.

Live Demo: https://aegis-mongo-web.vercel.app/

You can save passwords in two different ways:
1. Local Storage (stores passwords in your browser, no server needed)
2. MongoDB (stores passwords in a local database via a Node/Express backend)

Local Storage is used by default so the app works out of the box without any setup.

## Running the App (Frontend)

To run the React frontend:

1. Open your terminal and go to the folder:
   ```bash
   cd aegis-mongo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## Running the MongoDB Backend

If you want to use the MongoDB mode, you need to run the backend server first:

1. Make sure you have MongoDB installed and running on your computer (default address is `mongodb://localhost:27017`).
2. Open a terminal and go to the backend folder:
   ```bash
   cd aegis-mongo/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   This runs the API on `http://localhost:3000`.

## Using MongoDB Mode in the App

1. Make sure the backend server is running on port 3000.
2. In the top navbar of the web app, click the dropdown menu and select "MongoDB (Local Server)".
3. If it can't connect to the backend, you'll see a help page telling you how to get it running.
