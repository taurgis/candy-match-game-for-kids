# Sweet Swap Saga

> **Note**: This game has been completely "vibe coded" using Gemini 2.5 and GitHub Copilot - showcasing the power of AI-assisted development!

A delicious and colorful candy matching puzzle game for kids! Connect three or more candies to score points, clear levels, and get your name on the leaderboard. With infinite levels, the fun never stops!

## 🎮 Play Now
**[Play Sweet Swap Saga](https://taurgis.github.io/candy-match-game-for-kids/)**

 <!-- Placeholder - replace with actual gameplay gif if available -->

## Features

-   **Classic Match-3 Gameplay**: Intuitive and addictive puzzle fun.
-   **Player Profiles**: Save progress for multiple players on the same device.
-   **Infinite Levels**: The challenge grows with increasing target scores.
-   **Special Candies**: Make matches of 4 or 5 candies to create powerful power-ups that clear rows, columns, or entire colors!
-   **Combos & Chain Reactions**: Trigger spectacular chain reactions for huge bonus points.
-   **Leaderboard**: Compete for the high score and immortalize your name.
-   **Joyful Design**: Colorful graphics, fun animations, and satisfying sound effects.
-   **Background Music**: A cheerful, procedurally generated soundtrack featuring a rotating playlist of classic nursery rhymes like "Twinkle, Twinkle, Little Star," "Itsy Bitsy Spider," and more that children will love.
-   **Multilingual**: Fully playable in both Dutch and English.
-   **Offline Playable**: No internet connection needed after the game has loaded.

## How to Play

1.  **Choose a Profile**: Select an existing profile or create a new one with your name and a fun avatar.
2.  **Start the Game**: Choose "Play Game" or "Continue" if you have a saved game.
3.  **Swap Candies**: Click and drag (or tap and swipe) a candy to swap it with an adjacent one.
4.  **Make Matches**: The goal is to form a row or column of 3 or more identical candies.
5.  **Reach the Target Score**: Each level has a target score. Reach this score within the given number of moves to advance to the next level.
6.  **Use Power-ups**: Experiment with matching special candies to clear the board faster!

## Technical Implementation

This application is built with a modern frontend stack, focusing on performance and a great user experience.

-   **Framework**: [React](https://reactjs.org/) (v19) with [TypeScript](https://www.typescriptlang.org/) for a robust and scalable component architecture.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) is used for rapid and responsive UI development. Custom animations and transitions are added for a lively feel.
-   **State Management**: Game state is managed with React's built-in hooks (`useState`, `useEffect`, `useCallback`). The core logic is isolated in a custom hook (`useGameLogic`).
-   **Internationalization (i18n)**: The game supports multiple languages (Dutch and English) through a React Context-based translation system.
-   **Audio**: The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) is used to procedurally generate all sound effects and the background music, eliminating the need to load audio files.
-   **Data Persistence**: Player profiles, saved games, leaderboard, and audio preferences are stored in the browser's `localStorage`, preserving progress between sessions.
-   **Module Bundling**: The app uses [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) with an `importmap` in `index.html`, which means no build step is required. React packages are loaded directly from a CDN.

### File Structure

-   `index.html`: The entry point of the application. Loads necessary fonts, scripts, and styles.
-   `index.tsx`: The entrypoint for the React app, where the `App` component is rendered.
-   `App.tsx`: The main component that manages views (menu, game, leaderboard) and coordinates the application's overall state.
-   `/components`: Contains all reusable React components like `GameBoard`, `CandyPiece`, `Scoreboard`, etc.
-   `/context`: Contains the `LanguageContext` for internationalization.
-   `/hooks`: Contains custom React hooks. `useGameLogic.ts` contains the complete logic for matching candies, calculating scores, refilling the board, and activating special effects.
-   `/lib`: Contains utility modules. `audioManager.ts` is responsible for generating all sounds and music, and `i18n.ts` contains the translations.
-   `types.ts`: Defines all TypeScript types used throughout the application.
-   `constants.ts`: Contains game constants such as board size, candy colors, and target score formulas.
-   `metadata.json`: Contains metadata for the application.

## Running Tests

This project includes a browser-based test suite using Mocha, Chai, and React Testing Library. No complex setup or command-line tools are required.

To run the tests:

1.  Make sure the application is being served by a local development server.
2.  Open the `test.html` file in your browser.
3.  The test results will be displayed on the page.

The tests cover core game logic from the `useGameLogic` hook and component rendering for the `Scoreboard`. This helps ensure that new changes don't break existing functionality.

## Deployment to GitHub Pages

This project is configured for continuous deployment to GitHub Pages using GitHub Actions.

### How it Works

1.  A GitHub Actions workflow is defined in `.github/workflows/deploy.yml`.
2.  On every push to the `main` branch, the workflow automatically runs.
3.  Since this project doesn't require a build step, the workflow simply takes all the files in the repository and uploads them as a static site artifact.
4.  This artifact is then deployed to GitHub Pages.

### Setup Instructions

To enable deployment for your fork or repository, follow these steps:

1.  **Push the code**: Make sure your code is pushed to your GitHub repository.
2.  **Go to Settings**: In your repository, click on the "Settings" tab.
3.  **Navigate to Pages**: In the left sidebar, click on "Pages".
4.  **Select Source**: Under the "Build and deployment" section, choose "GitHub Actions" from the "Source" dropdown menu.

That's it! After your next push to `main`, the site will be deployed. You can view the deployment progress in the "Actions" tab of your repository. The live URL will be displayed in the "Pages" settings once the first deployment is successful.
