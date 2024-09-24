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
}

// Populate the voice options when they change
window.speechSynthesis.onvoiceschanged = loadVoices;

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
        sentenceContainer.innerText = sentence; // Display just the sentence
    } else {
        const [english, spanish] = sentence.split('|');
        sentenceContainer.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
    }

    readSentence(isSaved ? sentence : sentence.split('|')[0]); // Read only the sentence for saved entries
}

// Read the sentence using the selected voice
function readSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    const selectedVoice = voices.find(v => v.name === 'Google US English'); // Replace with desired voice
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    utterance.rate = currentSpeed;
    synth.speak(utterance);
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
        if (synth.speaking) {
        synth.cancel();
    }
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        document.getElementById('auto-play-button').innerText = 'Auto Play'; // Change button text back
                        document.getElementById('play-button').innerText = 'Play'; // Change button text back

    } else {
        autoPlayInterval = setInterval(loadSentences, 4000); // Change sentence every 4 seconds
        isAutoPlaying = true;
        document.getElementById('auto-play-button').innerText = 'Stop Auto'; // Change to 'Stop Auto' when playing
                        document.getElementById('play-button').innerText = 'Stop'; // Change button text back
    }
}

// Adjust speech speed
function changeSpeed() {
    currentSpeed = parseFloat(document.getElementById('speed-range').value);
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
