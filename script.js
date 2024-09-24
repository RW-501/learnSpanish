// Load sentences from the JSON file
let sentences = [];
let currentSentenceIndex = 0;
let currentUtterance = null; // To keep track of the current speech

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
    categorySelect.addEventListener('change', displaySentence);
}

// Display a sentence with highlighted words
function displaySentence() {
    const categorySelect = document.getElementById('category');
    const selectedCategory = categorySelect.value;
    const sentenceElement = document.getElementById('sentence');
    
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
    currentUtterance.rate = 0.7; // Slowing down the speech rate
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
