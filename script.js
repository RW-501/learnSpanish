let savedSentences = JSON.parse(localStorage.getItem('savedSentences')) || [];
let currentSentenceIndex = 0;
let autoPlayInterval = null;
let isAutoPlaying = false;
let currentSpeed = 1.0;
const synth = window.speechSynthesis;
let voices = [];

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

async function loadSentences() {
    const category = document.getElementById('category').value;
    const response = await fetch('data.json');
    const data = await response.json();
    const sentences = category === 'saved' ? savedSentences : data[category];

    if (sentences && sentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        displaySentence(sentences[randomIndex]);
    } else {
        document.getElementById('sentence').innerText = 'No sentences available in this category.';
    }
}

function displaySentence(sentence) {
    const [english, spanish] = sentence.split('|');
    const sentenceElement = document.getElementById('sentence');
    sentenceElement.innerHTML = `<strong>English:</strong> ${english}<br/><strong>Español:</strong> ${spanish}`;
    readSentence(english);
}

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

document.getElementById('play-stop-btn').addEventListener('click', () => {
    if (synth.speaking) {
        synth.cancel();
    } else {
        loadSentences();
    }
});

document.getElementById('auto-play-stop-btn').addEventListener('click', () => {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
    } else {
        autoPlayInterval = setInterval(loadSentences, 4000); // Change sentence every 4 seconds
        isAutoPlaying = true;
    }
});

document.getElementById('speed').addEventListener('change', (event) => {
    currentSpeed = parseFloat(event.target.value);
});

document.getElementById('save-btn').addEventListener('click', () => {
    const currentSentence = document.getElementById('sentence').innerText;
    if (currentSentence && !savedSentences.includes(currentSentence)) {
        savedSentences.push(currentSentence);
        localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
        updateSavedSentencesList();
    }
});

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

document.getElementById('clear-list-btn').addEventListener('click', () => {
    localStorage.removeItem('savedSentences');
    savedSentences = [];
    updateSavedSentencesList();
});

document.getElementById('suggestion-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'block';
});

document.getElementById('close-popup-btn').addEventListener('click', () => {
    document.getElementById('suggestion-popup').style.display = 'none';
});

document.getElementById('submit-suggestion-btn').addEventListener('click', () => {
    const suggestion = document.getElementById('suggestion-input').value;
    if (suggestion) {
        saveSuggestion(suggestion);
        document.getElementById('suggestion-response').innerText = 'Suggestion submitted!';
    }
});

async function saveSuggestion(suggestion) {
    const response = await fetch('submit_suggestion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion })
    });
    const result = await response.json();
    console.log(result.message);
}

window.onload = updateSavedSentencesList;
