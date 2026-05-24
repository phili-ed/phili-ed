function loadAnswer(id, url) {
    var container = document.getElementById("div-" + id);
    
    // If it's already loaded, just toggle it
    if (container.innerHTML !== "") {
        container.innerHTML = ""; 
    } else {
        // Create the element only when clicked
        container.innerHTML = `<iframe src="${url}" width="80%" height="300px" style="border: none;"></iframe>`;
    }
}

function downloadNote(id) {
    const textArea = document.getElementById('notes-' + id);
    const textContent = textArea.value;

    if (!textContent.trim()) {
        alert("The note is empty! Type something first.");
        return;
    }

    // 1. Create a "Blob" containing the text
    const blob = new Blob([textContent], { type: 'text/plain' });

    // 2. Create a hidden link element
    const link = document.createElement('a');
    
    // 3. Set the file name (e.g., Practice_101_Notes.txt)
    link.download = `Practice_${id}_Notes.txt`;

    // 4. Create a URL for the blob and click it automatically
    link.href = window.URL.createObjectURL(blob);
    link.click();

    // 5. Cleanup memory
    window.URL.revokeObjectURL(link.href);
}

// 1. Save text to the browser's memory
function saveLocally(id, text) {
    localStorage.setItem('practice_note_' + id, text);
}

// 2. Look for saved text when the page loads
function loadSavedNotes() {
    // Find all textareas on the page
    const textAreas = document.querySelectorAll('textarea[id^="notes-"]');
    
    textAreas.forEach(area => {
        const id = area.id.replace('notes-', '');
        const savedText = localStorage.getItem('practice_note_' + id);
        
        if (savedText) {
            area.value = savedText;
        }
    });
}

// Run the load function as soon as the page is ready
document.addEventListener('DOMContentLoaded', loadSavedNotes);



document.addEventListener('DOMContentLoaded', loadSavedNotes);

// --- Multiple Choice Checker Logic ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.mc-check-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();    // Stops the <a> tag from jumping the page
            e.stopPropagation();   // 🔥 CRITICAL: Stops click from bubbling up into the Bootstrap Accordion headers!
            
            const practiceId = this.getAttribute('data-practice-id');
            const correctAnswer = this.getAttribute('data-correct');
            const targetSelector = this.getAttribute('data-target');
            const panelEl = document.querySelector(targetSelector); 
            
            if (!panelEl) return;
            const evaluationBox = panelEl.querySelector('.evaluation-box');
            
            const currentLang = this.getAttribute('data-lang');
            const isChinese = (currentLang === "Chi");

            // Safe fallback if it's an old open-ended question
            if (!correctAnswer) {
                panelEl.classList.toggle('d-none');
                return;
            }

            // Reveal the answer panel immediately on click
            panelEl.classList.remove('d-none');

            // Find selected radio option
            const selectedRadio = document.querySelector(`input[name="answers[${practiceId}]"]:checked`);
            
            if (!selectedRadio) {
                // Formatting for warning banner
                evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold";
                evaluationBox.innerHTML = isChinese 
                    ? `⚠️ 请先选择一个选项再查看答案！` 
                    : `⚠️ Please select an option before checking the answer!`;
                
                // Keep classes consistent, just switch the warning color class
                this.className = "btn btn-sm btn-outline-warning mb-2 mc-check-btn";
                return; // Exits safely, ready for a second click!
            }

            const studentChoice = selectedRadio.value;

            if (studentChoice === correctAnswer) {
                evaluationBox.className = "p-3 mb-3 border rounded text-success bg-success bg-opacity-10 text-center fw-bold fs-5";
                evaluationBox.innerHTML = isChinese 
                    ? `🎉 正確！你的答案: ${studentChoice}` 
                    : `🎉 Correct! Your Choice: ${studentChoice}`;
                
                this.className = "btn btn-sm btn-success mb-2 mc-check-btn";
            } else {
                evaluationBox.className = "p-3 mb-3 border rounded text-danger bg-danger bg-opacity-10 text-center fw-bold fs-5";
                evaluationBox.innerHTML = isChinese 
                    ? `❌ 回答錯誤。你的回答 ${studentChoice}，正確答案: ${correctAnswer}` 
                    : `❌ Incorrect. You chose ${studentChoice}. correct answer: ${correctAnswer}`;
                
                this.className = "btn btn-sm btn-danger mb-2 mc-check-btn";
            }
        });
    });
});

