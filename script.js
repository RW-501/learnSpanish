// Load sentences from the JSON file
let sentences = [];
let currentSentenceIndex = 0;
let currentUtterance = null; // To keep track of the current speech
let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let autoPlayInterval = null; // For auto play
let currentSpeed = 1; // Default speed
let isAutoPlaying = false; // To track auto play state

// Fetch data from the JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        sentences = data;
        populateCategories();
        displaySentence();
    });

// Populate category dropdown
function populateCategories() {
    const categorySelect = document.getElementById('category');
    for (const category in sentences) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    }

    // Add an option to play the saved sentences
    const playSavedOption = document.createElement('option');
    playSavedOption.value = 'saved';
    playSavedOption.textContent = 'Play Saved Sentences';
    categorySelect.appendChild(playSavedOption);

    categorySelect.addEventListener('change', displaySentence);
}

// Display a sentence with highlighted words
function displaySentence() {
    const categorySelect = document.getElementById('category');
    const selectedCategory = categorySelect.value;
    const sentenceElement = document.getElementById('sentence');

    if (selectedCategory === 'saved') {
        // If "Play Saved Sentences" is selected
        playSavedSentences();
        return;
    }

    const randomIndex = Math.floor(Math.random() * sentences[selectedCategory].length);
    currentSentenceIndex = randomIndex;

    const sentence = sentences[selectedCategory][randomIndex];

    // Highlight one or two Spanish words
    const words = sentence.split(' ');
    const spanishWords = words.filter(word => /[áéíóúü]/.test(word));
    const highlightedIndices = [];

    // Select random indices to highlight
    while (highlightedIndices.length < Math.min(2, spanishWords.length)) {
        const randomIdx = Math.floor(Math.random() * spanishWords.length);
        if (!highlightedIndices.includes(randomIdx)) {
            highlightedIndices.push(randomIdx);
        }
    }

    // Create highlighted sentence
    const highlightedSentence = words.map((word, index) => {
        if (highlightedIndices.includes(spanishWords.indexOf(word))) {
            return `<span class="highlight">${word}</span>`;
        }
        return word;
    }).join(' ');

    sentenceElement.innerHTML = highlightedSentence;
    readSentence(sentence);
}

// Function to read the sentence aloud
function readSentence(sentence) {
    // Stop any current speech
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }

    currentUtterance = new SpeechSynthesisUtterance(sentence);
    currentUtterance.rate = currentSpeed; // Use current speed
    window.speechSynthesis.speak(currentUtterance);
    currentUtterance.onend = () => {
        // Automatically move to the next sentence after speaking ends
        setTimeout(displaySentence, 2000); // 2 seconds delay before the next sentence
    };
}

// Update button states
function updatePlayStopButton() {
    const playStopBtn = document.getElementById('play-stop-btn');
    if (isAutoPlaying) {
        playStopBtn.textContent = 'Stop';
    } else {
        playStopBtn.textContent = 'Play';
    }
}

// Add event listener for the Play/Stop button
document.getElementById('play-stop-btn').addEventListener('click', () => {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        isAutoPlaying = false;
        updatePlayStopButton();
        window.speechSynthesis.cancel(); // Stop current speech
    } else {
        currentSentenceIndex = 0;
        playSavedSentences();
        isAutoPlaying = true;
        updatePlayStopButton();
    }
});

// Function to play saved sentences
function playSavedSentences() {
    if (currentSentenceIndex < savedSentences.length) {
        const currentSentence = savedSentences[currentSentenceIndex];
        const sentenceElement = document.getElementById('sentence');
        sentenceElement.innerHTML = currentSentence; // Display the current sentence
        readSentence(currentSentence);
        currentSentenceIndex++;
    } else {
        currentSentenceIndex = 0; // Reset to the start
    }
}

// Add event listener for the Auto Play/Stop button
document.getElementById('auto-play-stop-btn').addEventListener('click', () => {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        isAutoPlaying = false;
        updatePlayStopButton();
    } else {
        autoPlayInterval = setInterval(() => {
            displaySentence();
        }, 4000); // Change sentence every 4 seconds
        isAutoPlaying = true;
        updatePlayStopButton();
    }
});

// Add event listener for the Speed control dropdown
document.getElementById('speed').addEventListener('change', (event) => {
    currentSpeed = parseFloat(event.target.value);
});

// Add event listener for the Save Sentence button
document.getElementById('save-btn').addEventListener('click', () => {
    const currentSentence = document.getElementById('sentence').innerText;
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
});

// Update saved sentences list display
function updateSavedSentencesList() {
    const sentenceList = document.getElementById('sentence-list');
    sentenceList.innerHTML = ''; // Clear current list
    savedSentences.forEach(sentence => {
        const li = document.createElement('li');
        li.textContent = sentence;
        sentenceList.appendChild(li);
    });
}

// Add event listener for the Clear List button
document.getElementById('clear-list-btn').addEventListener('click', () => {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
});

// Show suggestion pop-up
document.getElementById('suggestion-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'block';
});

// Close suggestion pop-up
document.getElementById('close-popup-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'none';
});

// Add event listener for the Submit Suggestion button
document.getElementById('submit-suggestion-btn').addEventListener('click', () => {
    const suggestionInput = document.getElementById('suggestion-input');
    const suggestionResponse = document.getElementById('suggestion-response');

    if (suggestionInput.value) {
        suggestionResponse.textContent = `Thank you for your suggestion: "${suggestionInput.value}"!`;
        suggestionInput.value = ''; // Clear input field
    } else {
        suggestionResponse.textContent = 'Please enter a sentence to suggest.';
    }
});

// Initial load of saved sentences
updateSavedSentencesList();
