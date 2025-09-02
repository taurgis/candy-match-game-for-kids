export const translations = {
  en: {
    // ProfileSelection
    choosePlayer: 'Choose your Player',
    newPlayer: 'New Player',
    name: 'Name',
    chooseAvatar: 'Choose an animal friend:',
    createProfile: 'Create Profile',
    deleteProfileTitle: 'Delete Profile?',
    deleteProfileConfirm: 'Are you sure you want to delete',
    deleteProfileWarning: 'All progress will be lost!',
    parentalLock: 'Question for the parents:',
    parentalLockQuestion: 'What is 9 x 6?',
    incorrectAnswer: 'That is not correct. Please try again.',
    cancel: 'Cancel',
    delete: 'Delete',
    
    // MainMenu
    gameTitle1: 'Sweet Swap',
    gameTitle2: 'Saga',
    welcome: 'Welcome,',
    continueGame: 'Continue',
    newGame: 'New Game',
    playGame: 'Play Game',
    leaderboard: 'Leaderboard',
    switchProfile: 'Switch Profile',
    howToPlay: 'How to Play',

    // Leaderboard
    leaderboardTitle: 'Leaderboard',
    noScores: 'No scores yet. Be the first!',
    backToMenu: 'Back to Menu',

    // Scoreboard
    score: 'Score',
    level: 'Level',
    goal: 'Goal:',
    movesLeft: 'Moves Left',

    // GameBoard
    combo: 'Combo',

    // App/Modals
    gameOverTitle: 'Game Over!',
    finalScore: 'Your final score is',
    mainMenu: 'Main Menu',
    levelCompleteTitle: 'Level {level} Complete!',
    levelCompleteText: 'Well done! Your score is',
    nextLevel: 'To Level {level}',

    // InstructionsModal
    close: 'Close',
    instructionsGoalTitle: 'Goal of the Game',
    instructionsGoalText: 'Reach the target score within the moves limit to pass the level!',
    instructionsSwapTitle: 'Swap Candies',
    instructionsSwapText: 'Swap any two neighbor candies to make a line of 3 or more of the same color.',
    instructionsMatch4Title: 'Striped Candy',
    instructionsMatch4Text: 'Match 4 candies to create a Striped Candy. It clears a whole row or column!',
    instructionsMatch5Title: 'Bomb Candy',
    instructionsMatch5Text: 'Match 5 in a line to create a Bomb. Swap it with any candy to clear all candies of that color!',
    instructionsMatchLTTitle: 'Jelly Candy',
    instructionsMatchLTText: 'Match 5 in an "L" or "T" shape for a Jelly Candy. When matched, it clears all candies of its own color!',
    instructionsMatch6Title: 'Rainbow Candy',
    instructionsMatch6Text: 'Match 6 or more candies to create a powerful Rainbow Candy. It clears the entire board!',
  },
  nl: {
    // ProfileSelection
    choosePlayer: 'Kies je Speler',
    newPlayer: 'Nieuwe Speler',
    name: 'Naam',
    chooseAvatar: 'Kies een dierenvriendje:',
    createProfile: 'Maak Profiel',
    deleteProfileTitle: 'Profiel Verwijderen?',
    deleteProfileConfirm: 'Weet je zeker dat je',
    deleteProfileWarning: 'Alle voortgang gaat verloren!',
    parentalLock: 'Vraag voor de ouders:',
    parentalLockQuestion: 'Wat is 9 x 6?',
    incorrectAnswer: 'Dat is niet correct. Probeer het opnieuw.',
    cancel: 'Annuleren',
    delete: 'Verwijderen',

    // MainMenu
    gameTitle1: 'Zoete Wissel',
    gameTitle2: 'Saga',
    welcome: 'Welkom,',
    continueGame: 'Verdergaan',
    newGame: 'Nieuw Spel',
    playGame: 'Speel Spel',
    leaderboard: 'Scorebord',
    switchProfile: 'Wissel Profiel',
    howToPlay: 'Uitleg',

    // Leaderboard
    leaderboardTitle: 'Scorebord',
    noScores: 'Nog geen scores. Wees de eerste!',
    backToMenu: 'Terug naar Menu',

    // Scoreboard
    score: 'Punten',
    level: 'Level',
    goal: 'Doel:',
    movesLeft: 'Zetten Over',

    // GameBoard
    combo: 'Combo',

    // App/Modals
    gameOverTitle: 'Spel Voorbij!',
    finalScore: 'Je eindscore is',
    mainMenu: 'Hoofdmenu',
    levelCompleteTitle: 'Level {level} Voltooid!',
    levelCompleteText: 'Goed gedaan! Je score is',
    nextLevel: 'Naar Level {level}',

    // InstructionsModal
    close: 'Sluiten',
    instructionsGoalTitle: 'Doel van het Spel',
    instructionsGoalText: 'Behaal de doelscore binnen het aantal zetten om het level te halen!',
    instructionsSwapTitle: 'Wissel Snoepjes',
    instructionsSwapText: 'Wissel twee snoepjes van plek om een rij van 3 of meer van dezelfde kleur te maken.',
    instructionsMatch4Title: 'Gestreept Snoepje',
    instructionsMatch4Text: 'Maak een match van 4 om een Gestreept Snoepje te maken. Dit maakt een hele rij of kolom leeg!',
    instructionsMatch5Title: 'Bom Snoepje',
    instructionsMatch5Text: 'Match 5 op een rij voor een Bom. Wissel het met een snoepje om alle snoepjes van die kleur te verwijderen!',
    instructionsMatchLTTitle: 'Jelly Snoepje',
    instructionsMatchLTText: 'Maak een match van 5 in een "L" of "T" vorm voor een Jelly Snoepje. Als je het matcht, verwijdert het alle snoepjes van zijn eigen kleur!',
    instructionsMatch6Title: 'Regenboog Snoepje',
    instructionsMatch6Text: 'Maak een match van 6 of meer voor een supersterk Regenboog Snoepje. Dit maakt het hele bord leeg!',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en']; // or 'nl', they should be the same

const interpolate = (str: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`{${key}}`, String(value));
  }, str);
};


export const getTranslator = (language: Language) => (key: TranslationKey, params?: Record<string, string | number>) => {
  const translation = translations[language]?.[key] || translations['nl'][key]; // Fallback to Dutch
  if (params && translation) {
    return interpolate(translation, params);
  }
  return translation || key;
};