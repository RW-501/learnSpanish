// Load sentences from the JSON file
let sentences = [];
let currentSentenceIndex = 0;

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
    
    // Randomly highlight one or two Spanish words
    const words = sentence.split(' ');
    const spanishWords = words.filter(word => /[áéíóúü]/.test(word));
    const highlightedIndices = [];
    
    while (highlightedIndices.length < Math.min(2, spanishWords.length)) {
        const randomIdx = Math.floor(Math.random() * spanishWords.length);
        if (!highlightedIndices.includes(randomIdx)) {
            highlightedIndices.push(randomIdx);
        }
    }

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
    const utterance = new SpeechSynthesisUtterance(sentence);
    window.speechSynthesis.speak(utterance);
}

// Add event listener for the Repeat button
document.getElementById('repeat-btn').addEventListener('click', () => {
    const sentenceElement = document.getElementById('sentence');
    const currentSentence = sentenceElement.textContent;
    readSentence(currentSentence);
});

// Add event listener for the Next button
document.getElementById('next-btn').addEventListener('click', displaySentence);
