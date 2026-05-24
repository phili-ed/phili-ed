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
    document.querySelectorAll('.mc-check-btn').forEach(button => {
        // Find the collapse element target manually
        const targetSelector = button.getAttribute('data-bs-target');
        const collapseEl = document.querySelector(targetSelector);
        
        // Initialize Bootstrap's Collapse handler dynamically (removes glitching)
        const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });

        button.addEventListener('click', function(e) {
            const practiceId = this.getAttribute('data-practice-id');
            const correctAnswer = this.getAttribute('data-correct');
            const evaluationBox = collapseEl.querySelector('.evaluation-box');
            
            const currentLang = this.getAttribute('data-lang');
            const isChinese = (currentLang === "Chi");

            // Fallback safety if it's an old PDF layout style question
            if (!correctAnswer) {
                bsCollapse.toggle();
                return;
            }

            // Target the selected radio button input row
            const selectedRadio = document.querySelector('input[name="answers[' + practiceId + ']"]:checked');
            
            if (!selectedRadio) {
                // 1. Force the collapse panel to open so they can see the warning alert box
                bsCollapse.show();
                
                // 2. Format warning layout states
                evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold";
                evaluationBox.innerHTML = isChinese 
                    ? `⚠️ 请先选择一个选项再查看答案！` 
                    : `⚠️ Please select an option before checking the answer!`;
                
                // Reset button style to yellow outline warning condition state
                this.classList.remove('btn-success', 'btn-danger');
                this.classList.add('btn-outline-warning');
                return;
            }

            // Clear out warning layout color changes if they exist now
            this.classList.remove('btn-outline-warning');
            const studentChoice = selectedRadio.value;

            // Open the solution panel display dynamically
            bsCollapse.show();

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