let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let currentSentenceIndex = 0;
let autoPlayInterval = null;
let isAutoPlaying = false;
let currentSpeed = 1.0;
const synth = window.speechSynthesis;
let voices = [];

// Load voices available in the SpeechSynthesis API
function loadVoices() {
    voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-select');
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

window.speechSynthesis.onvoiceschanged = loadVoices;

// Load sentences based on the selected category
async function loadSentences() {
    const category = document.getElementById('category').value;
    const response = await fetch('data.json');
    const data = await response.json();
    const sentences = category === 'saved' ? savedSentences : data[category];

    if (sentences && sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        displaySentence(sentences[randomIndex], category === 'saved');
    } else {
        document.getElementById('sentence').innerText = 'No sentences available in this category.';
    }
}

// Display the sentence and read it aloud
function displaySentence(sentence, isSaved) {
    const sentenceElement = document.getElementById('sentence');
    
    if (isSaved) {
        sentenceElement.innerText = sentence; // Display just the sentence
    } else {
        const [english, spanish] = sentence.split('|');
        sentenceElement.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
    }
    
    readSentence(isSaved ? sentence : sentence.split('|')[0]); // Read only the sentence for saved entries
}

// Read the sentence using the selected voice
function readSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    const selectedVoice = document.getElementById('voice-select').value;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
        utterance.voice = voice;
    }
    utterance.rate = currentSpeed;
    utterance.volume = document.getElementById('volume').value;
    synth.speak(utterance);
}

function playSavedSentences() {
    // Clear any existing speech
    speechSynthesis.cancel();

    // Iterate through saved sentences and play them
    savedSentences.forEach(sentence => {
        const [english, spanish] = sentence.split('|'); // Split the sentence into English and Spanish
        const utterance = new SpeechSynthesisUtterance(english + " " + spanish); // Combine the two sentences without labels
        speechSynthesis.speak(utterance);
    });
}

// Play/Stop button functionality
document.getElementById('play-stop-btn').addEventListener('click', () => {
    const button = document.getElementById('play-stop-btn');
    if (synth.speaking) {
        synth.cancel();
        button.innerText = 'Play';
    } else {
        loadSentences();
        button.innerText = 'Stop'; // Change to 'Stop' when playing
    }
});

// Auto play functionality
document.getElementById('auto-play-stop-btn').addEventListener('click', () => {
    const button = document.getElementById('auto-play-stop-btn');
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        button.innerText = 'Auto Play'; // Change button text back
    } else {
        autoPlayInterval = setInterval(loadSentences, 4000); // Change sentence every 4 seconds
        isAutoPlaying = true;
        button.innerText = 'Stop Auto'; // Change to 'Stop Auto' when playing
    }
});

// Speed adjustment for speech
document.getElementById('speed').addEventListener('change', (event) => {
    currentSpeed = parseFloat(event.target.value);
});

// Save current sentence to local storage
document.getElementById('save-btn').addEventListener('click', () => {
    const currentSentence = document.getElementById('sentence').innerText;
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
});

// Update the saved sentences list in the UI
function updateSavedSentencesList() {
    const sentenceList = document.getElementById('sentence-list');
    sentenceList.innerHTML = '';
    savedSentences.forEach((sentence, index) => {
        const li = document.createElement('li');
        li.textContent = sentence;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            savedSentences.splice(index, 1);
            localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
            updateSavedSentencesList();
        });

        li.appendChild(removeBtn);
        sentenceList.appendChild(li);
    });
}

// Clear the saved sentences
document.getElementById('clear-list-btn').addEventListener('click', () => {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
});

// Suggest a sentence functionality
document.getElementById('suggestion-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'block';
});

// Close the suggestion popup
document.getElementById('close-popup-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'none';
});

// Submit a suggestion
document.getElementById('submit-suggestion-btn').addEventListener('click', () => {
    const suggestion = document.getElementById('suggestion-input').value;
    if (suggestion) {
        saveSuggestion(suggestion);
        document.getElementById('suggestion-response').innerText = 'Suggestion submitted!';
    }
});

// Save suggestion to server
async function saveSuggestion(suggestion) {
    const response = await fetch('submit_suggestion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion })
    });
    const result = await response.json();
    console.log(result.message);
}

// Initialize saved sentences list on page load
window.onload = updateSavedSentencesList;
