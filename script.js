let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let currentSentenceIndex = 0;
let autoPlayInterval = null;
let isAutoPlaying = false;
let currentSpeed = 1.0;
const synth = window.speechSynthesis;
let voices = [];

// Function to load voices available in the SpeechSynthesis API
function loadVoices() {
    voices = synth.getVoices();
    console.log("Loaded voices:", voices);
    if (!voices.length) {
        console.warn("No voices loaded. Retrying...");
        setTimeout(loadVoices, 100); // Retry loading voices if not available
    }
}

// Listen for voices changed event and load voices when available
window.speechSynthesis.onvoiceschanged = loadVoices;

// Ensure that the audio context is resumed on user interaction
window.addEventListener('click', () => {
    // Manually resume the AudioContext if it is suspended
    if (synth.speaking) {
        return;
    }
    let utterance = new SpeechSynthesisUtterance('');
    synth.speak(utterance); // Empty utterance to activate speech synthesis
}, { once: true });

// Load sentences based on the selected category
async function loadSentences() {
    const category = document.getElementById('category-dropdown').value;
    const response = await fetch('data.json');
    const data = await response.json();
    const sentences = category === 'playSaved' ? savedSentences : data[category];

    if (sentences && sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        displaySentence(sentences[randomIndex], category === 'playSaved');
    } else {
        document.getElementById('sentence-container').innerText = 'No sentences available in this category.';
    }
}

// Display the sentence and read it aloud
function displaySentence(sentence, isSaved) {
    const sentenceContainer = document.getElementById('sentence-container');

    if (isSaved) {
        let [english, spanish] = sentence.split('Español:'); // Split into English and Spanish
        // Remove 'English:' from the english part using replace
        english = english.replace('English:', '').trim(); 
        // Check if the Spanish part exists and remove any leading/trailing spaces
        spanish = spanish ? spanish.trim() : 'No Spanish part found';

        sentenceContainer.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
        readSentence(english, 'en-US'); // Read the English part
        readSentence(spanish, 'es-ES'); // Read the Spanish part

    } else {
        const [english, spanish] = sentence.split('|'); // Split into English and Spanish
        sentenceContainer.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
        readSentence(english, 'en-US'); // Read the English part
        readSentence(spanish, 'es-ES'); // Read the Spanish part
    }
}

// Read the sentence using the selected voice and current speed
function readSentence(sentence, lang) {
    const utterance = new SpeechSynthesisUtterance(sentence);

    // Ensure voices are available before proceeding
    if (voices.length === 0) {
        loadVoices(); // Load voices if they are not available
    }

    // Find a voice that matches the language
    const selectedVoice = voices.find(v => v.lang === lang);

    // Assign selected voice, if found, or use the first available voice
    utterance.voice = selectedVoice || voices[0] || null;

    // Log if no appropriate voice was found
    if (!selectedVoice) {
        console.warn(`No voice found for language: ${lang}`);
    }

    // Set the rate and speak the sentence
    utterance.rate = currentSpeed;
    synth.speak(utterance);
}

// Adjust speech speed
function changeSpeed() {
    currentSpeed = parseFloat(document.getElementById('speed-range').value);
    if (synth.speaking) {
        synth.cancel(); // Stop current speech so new speed can take effect
        loadSentences(); // Restart the sentence at the new speed
    }
}

// Play/Stop button functionality
function togglePlay() {
    if (synth.speaking) {
        synth.cancel();
        document.getElementById('play-button').innerText = 'Play'; // Change button text back
    } else {
        document.getElementById('play-button').innerText = 'Stop'; // Change button text back
        loadSentences();
    }
}

// Auto play functionality
function toggleAutoPlay() {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        document.getElementById('auto-play-button').innerText = 'Auto Play'; // Change button text back
    } else {
        autoPlayInterval = setInterval(() => {
            if (!synth.speaking) { // Only load new sentence if no speech is ongoing
                loadSentences();
            }
        }, 6000); // Change sentence every 6 seconds (increased interval)
        isAutoPlaying = true;
        document.getElementById('auto-play-button').innerText = 'Stop Auto'; // Change to 'Stop Auto' when playing
    }
}

// Save current sentence to local storage
function addToSavedList() {
    const currentSentence = document.getElementById('sentence-container').innerText;
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
}

// Update the saved sentences list in the UI
function updateSavedSentencesList() {
    const sentenceList = document.getElementById('saved-sentences-list');
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
function clearSavedSentences() {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
}

// Suggest a sentence functionality
function showPopup() {
    document.getElementById('suggestion-popup').style.display = 'block';
}

// Close the suggestion popup
function closePopup() {
    document.getElementById('suggestion-popup').style.display = 'none';
}

// Submit a suggestion
async function submitSuggestion() {
    const suggestion = document.getElementById('suggestion-input').value;
    if (suggestion) {
        await saveSuggestion(suggestion);
        document.getElementById('suggestion-input').value = ''; // Clear input after submission
        closePopup();
    }
}

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

const synth = window.speechSynthesis;
let voices = [];

// Load voices available in the SpeechSynthesis API
function loadVoices() {
    voices = synth.getVoices();
    console.log("Loaded voices:", voices);
    if (!voices.length) {
        console.warn("No voices loaded. Retrying...");
        setTimeout(loadVoices, 100); // Retry loading voices
    }
}

// Populate the voice options when they change
window.speechSynthesis.onvoiceschanged = loadVoices;

// Ensure voices are loaded before using them
window.addEventListener('touchstart', () => {
    // User interaction to initialize speech synthesis
    if (!synth.speaking) {
        let utterance = new SpeechSynthesisUtterance('');
        synth.speak(utterance); // Empty utterance to activate speech synthesis
    }
}, { once: true });

// Load sentences based on the selected category
async function loadSentences() {
    const category = document.getElementById('category-dropdown').value;
    const response = await fetch('data.json');
    const data = await response.json();
    const sentences = category === 'playSaved' ? savedSentences : data[category];

    if (sentences && sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        displaySentence(sentences[randomIndex], category === 'playSaved');
    } else {
        document.getElementById('sentence-container').innerText = 'No sentences available in this category.';
    }
}

// Display the sentence and read it aloud
function displaySentence(sentence, isSaved) {
    const sentenceContainer = document.getElementById('sentence-container');

    if (isSaved) {
        let [english, spanish] = sentence.split('Español:'); // Split into English and Spanish
        // Remove 'English:' from the english part using replace
        english = english.replace('English:', '').trim(); 
        // Check if the Spanish part exists and remove any leading/trailing spaces
        spanish = spanish ? spanish.trim() : 'No Spanish part found';

        sentenceContainer.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
        readSentence(english, 'en-US'); // Read the English part
        readSentence(spanish, 'es-ES'); // Read the Spanish part

    } else {
        const [english, spanish] = sentence.split('|'); // Split into English and Spanish
        sentenceContainer.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
        readSentence(english, 'en-US'); // Read the English part
        readSentence(spanish, 'es-ES'); // Read the Spanish part
    }
}

// Read the sentence using the selected voice and current speed
function readSentence(sentence, lang) {
    const utterance = new SpeechSynthesisUtterance(sentence);

    // Ensure voices are available before proceeding
    if (voices.length === 0) {
        loadVoices(); // Load voices if they are not available
    }

    // Find a voice that matches the language
    const selectedVoice = voices.find(v => v.lang === lang);

    // Assign selected voice, if found, or use the first available voice
    utterance.voice = selectedVoice || voices[0] || null;

    // Log if no appropriate voice was found
    if (!selectedVoice) {
        console.warn(`No voice found for language: ${lang}`);
    }

    // Set the rate and speak the sentence
    utterance.rate = currentSpeed;
    synth.speak(utterance);
}

// Adjust speech speed
function changeSpeed() {
    currentSpeed = parseFloat(document.getElementById('speed-range').value);
    if (synth.speaking) {
        synth.cancel(); // Stop current speech so new speed can take effect
        loadSentences(); // Restart the sentence at the new speed
    }
}

// Play/Stop button functionality
function togglePlay() {
    if (synth.speaking) {
        synth.cancel();
        document.getElementById('play-button').innerText = 'Play'; // Change button text back
    } else {
        document.getElementById('play-button').innerText = 'Stop'; // Change button text back
        loadSentences();
    }
}

// Auto play functionality
function toggleAutoPlay() {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        document.getElementById('auto-play-button').innerText = 'Auto Play'; // Change button text back
    } else {
        autoPlayInterval = setInterval(() => {
            if (!synth.speaking) { // Only load new sentence if no speech is ongoing
                loadSentences();
            }
        }, 6000); // Change sentence every 6 seconds (increased interval)
        isAutoPlaying = true;
        document.getElementById('auto-play-button').innerText = 'Stop Auto'; // Change to 'Stop Auto' when playing
    }
}

// Save current sentence to local storage
function addToSavedList() {
    const currentSentence = document.getElementById('sentence-container').innerText;
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
}

// Update the saved sentences list in the UI
function updateSavedSentencesList() {
    const sentenceList = document.getElementById('saved-sentences-list');
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
function clearSavedSentences() {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
}

// Suggest a sentence functionality
function showPopup() {
    document.getElementById('suggestion-popup').style.display = 'block';
}

// Close the suggestion popup
function closePopup() {
    document.getElementById('suggestion-popup').style.display = 'none';
}

// Submit a suggestion
async function submitSuggestion() {
    const suggestion = document.getElementById('suggestion-input').value;
    if (suggestion) {
        await saveSuggestion(suggestion);
        document.getElementById('suggestion-input').value = ''; // Clear input after submission
        closePopup();
    }
}

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
