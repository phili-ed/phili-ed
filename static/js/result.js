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

document.addEventListener('DOMContentLoaded', function() {
    // 1. Create a global Map object to house our persistent collapse instances
    const collapseInstances = new Map();

    // 2. Pre-initialize every collapse panel on the page immediately upon loading
    document.querySelectorAll('.mc-check-btn').forEach(button => {
        const targetSelector = button.getAttribute('data-bs-target');
        const collapseEl = document.querySelector(targetSelector);
        
        if (collapseEl) {
            // Create the official Bootstrap controller instance once
            const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
            // Store it in our map using its unique practice id string as the key
            const practiceId = button.getAttribute('data-practice-id');
            collapseInstances.set(practiceId, bsCollapse);
        }
    });

    // 3. Handle the click logic independently
    document.querySelectorAll('.mc-check-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const practiceId = this.getAttribute('data-practice-id');
            const correctAnswer = this.getAttribute('data-correct');
            const targetSelector = this.getAttribute('data-bs-target');
            const collapseEl = document.querySelector(targetSelector);
            const evaluationBox = collapseEl.querySelector('.evaluation-box');
            
            const currentLang = this.getAttribute('data-lang');
            const isChinese = (currentLang === "Chi");

            // Fetch our pre-initialized instance out of storage safely
            const bsCollapse = collapseInstances.get(practiceId);

            // Fallback safety if it's an old PDF layout style question
            if (!correctAnswer) {
                if (bsCollapse) bsCollapse.toggle();
                return;
            }

            // Target the selected radio button input row safely
            const selectedRadio = document.querySelector('input[name="answers[' + practiceId + ']"]:checked');
            
            if (!selectedRadio) {
                // Force the collapse panel window to slide open
                if (bsCollapse) bsCollapse.show();
                
                // Format warning banner visual states
                evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold";
                evaluationBox.innerHTML = isChinese 
                    ? `⚠️ 请先选择一个选项再查看答案！` 
                    : `⚠️ Please select an option before checking the answer!`;
                
                this.classList.remove('btn-success', 'btn-danger');
                this.classList.add('btn-outline-warning');
                return; // Code exits here perfectly cleanly without locking Bootstrap!
            }

            // Clear out warning layouts if an answer is selected now
            this.classList.remove('btn-outline-warning');
            const studentChoice = selectedRadio.value;

            // Expand panel display container dynamically
            if (bsCollapse) bsCollapse.show();

            if (studentChoice === correctAnswer) {
                evaluationBox.className = "p-3 mb-3 border rounded text-success bg-success bg-opacity-10 text-center fw-bold fs-5";
                evaluationBox.innerHTML = isChinese 
                    ? `🎉 正確！你的答案: ${studentChoice}` 
                    : `🎉 Correct! Your Choice: ${studentChoice}`;
                
                this.classList.remove('btn-outline-success', 'btn-danger');
                this.classList.add('btn-success');
            } else {
                evaluationBox.className = "p-3 mb-3 border rounded text-danger bg-danger bg-opacity-10 text-center fw-bold fs-5";
                evaluationBox.innerHTML = isChinese 
                    ? `❌ 回答錯誤。你的回答 ${studentChoice}，正確答案: ${correctAnswer}` 
                    : `❌ Incorrect. You chose ${studentChoice}. correct answer: ${correctAnswer}`;
                
                this.classList.remove('btn-outline-success', 'btn-success');
                this.classList.add('btn-danger');
            }
        });
    });
});