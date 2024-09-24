// Initialize saved sentences
let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let currentSentenceIndex = 0;
let autoPlayInterval = null;
let isAutoPlaying = false;
let currentSpeed = 1.0;

// Initialize speech synthesis
const synth = window.speechSynthesis;
let voices = [];

// Load voices
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

// Set initial voice selection
window.speechSynthesis.onvoiceschanged = loadVoices;

// Function to read a sentence
function readSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    const selectedVoice = document.getElementById('voice-select').value;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
        utterance.voice = voice;
    }
    utterance.rate = currentSpeed;
    synth.speak(utterance);
}

// Function to display the current sentence
function displaySentence() {
    const englishSentence = "This is the English version.";
    const spanishSentence = "Esta es la versión en español.";
    const sentenceElement = document.getElementById('sentence');
    sentenceElement.innerHTML = `<strong>English:</strong> ${englishSentence}<br/><strong>Español:</strong> ${spanishSentence}`;
    readSentence(englishSentence);
}

// Add event listener for the Play/Stop button
document.getElementById('play-stop-btn').addEventListener('click', () => {
    if (synth.speaking) {
        synth.cancel();
    } else {
        displaySentence();
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
    savedSentences.forEach((sentence, index) => {
        const li = document.createElement('li');
        li.textContent = sentence;
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            savedSentences.splice(index, 1); // Remove sentence
            localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
            updateSavedSentencesList(); // Update display
        });
        
        li.appendChild(removeBtn); // Append remove button to list item
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

// Volume control event listener
document.getElementById('volume').addEventListener('input', (event) => {
    const volume = event.target.value;
    synth.volume = volume; // Set the volume
});

// Initial load of saved sentences and voices
updateSavedSentencesList();
loadVoices();
