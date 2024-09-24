// Variables
const sentenceDisplay = document.getElementById('sentence-display');
const repeatButton = document.getElementById('repeat-button');
let currentSentence = '';
let currentWords = [];

// Load sentences from JSON file based on selected category
function loadSentences() {
    const category = document.getElementById('category').value;
    if (!category) return;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const sentences = data[category];
            const randomIndex = Math.floor(Math.random() * sentences.length);
            currentSentence = sentences[randomIndex];
            currentWords = currentSentence.split(' ');
            displaySentence(currentSentence);
            repeatButton.disabled = false; // Enable the repeat button
        })
        .catch(error => console.error('Error loading sentences:', error));
}

// Display the sentence and highlight the Spanish word
function displaySentence(sentence) {
    const words = sentence.split(' ');
    sentenceDisplay.innerHTML = ''; // Clear previous sentence

    words.forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        sentenceDisplay.appendChild(span);

        // Highlight the Spanish word (for demo, let's assume the second word is Spanish)
        if (word === 'español' || word === 'comida' || word === 'ropa') { // Example Spanish words
            span.classList.add('highlight');
        }
    });

    // Play the audio
    playAudio(sentence);
}

// Play audio of the sentence
function playAudio(sentence) {
    const speech = new SpeechSynthesisUtterance(sentence);
    speech.lang = 'es-ES'; // Set language to Spanish for pronunciation
    speech.onstart = () => {
        highlightWords();
    };
    speech.onend = () => {
        resetHighlight();
    };
    window.speechSynthesis.speak(speech);
}

// Highlight words as they are spoken
function highlightWords() {
    currentWords.forEach((word, index) => {
        setTimeout(() => {
            const spans = sentenceDisplay.getElementsByTagName('span');
            spans[index].classList.add('highlight');
        }, index * 1000); // Change timeout duration based on your preference
    });
}

// Reset highlighting after the sentence is spoken
function resetHighlight() {
    const spans = sentenceDisplay.getElementsByTagName('span');
    for (let span of spans) {
        span.classList.remove('highlight');
    }
}

// Repeat the current sentence
function repeatSentence() {
    if (currentSentence) {
        playAudio(currentSentence);
    }
}
