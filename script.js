// Load sentences from the JSON file
let sentences = [];
let currentSentenceIndex = 0;
let currentUtterance = null; // To keep track of the current speech
let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let autoPlayInterval = null; // For auto play
let currentSpeed = 1; // Default speed

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

// Add event listener for the Repeat button
document.getElementById('repeat-btn').addEventListener('click', () => {
    const sentenceElement = document.getElementById('sentence');
    const currentSentence = sentenceElement.textContent.replace(/<[^>]*>/g, ''); // Strip HTML tags
    readSentence(currentSentence);
});

// Add event listener for the Stop button
document.getElementById('stop-btn').addEventListener('click', () => {
    window.speechSynthesis.cancel();
});

// Add event listener for the Next button
document.getElementById('next-btn').addEventListener('click', () => {
    displaySentence();
});

// Add event listener for the Save Sentence button
document.getElementById('save-btn').addEventListener('click', () => {
    const sentenceElement = document.getElementById('sentence');
    const currentSentence = sentenceElement.textContent.replace(/<[^>]*>/g, ''); // Strip HTML tags
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
});

// Function to update the saved sentences list display
function updateSavedSentencesList() {
    const sentenceList = document.getElementById('sentence-list');
    sentenceList.innerHTML = ''; // Clear the list
    savedSentences.forEach(sentence => {
        const li = document.createElement('li');
        li.textContent = sentence;
        sentenceList.appendChild(li);
    });
}

// Add event listener for the Play Saved List button
document.getElementById('play-saved-btn').addEventListener('click', () => {
    if (savedSentences.length > 0) {
        currentSentenceIndex = 0;
        playSavedSentences();
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

// Add event listener for the Auto Play button
document.getElementById('auto-play-btn').addEventListener('click', () => {
    autoPlayInterval = setInterval(() => {
        displaySentence();
    }, 4000); // Change sentence every 4 seconds
});

// Add event listener for the Stop Auto Play button
document.getElementById('stop-auto-play-btn').addEventListener('click', () => {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
});

// Add event listener for the Speed control dropdown
document.getElementById('speed').addEventListener('change', (event) => {
    currentSpeed = parseFloat(event.target.value);
});

// Add event listener for the Clear List button
document.getElementById('clear-list-btn').addEventListener('click', () => {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
});

// Add event listener for the Suggestion button
document.getElementById('suggestion-btn').addEventListener('click', () => {
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
