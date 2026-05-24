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

document.querySelectorAll('.mc-check-btn').forEach(button => {
    button.addEventListener('click', function() {
        const practiceId = this.getAttribute('data-practice-id');
        const correctAnswer = this.getAttribute('data-correct');
        const targetCollapseId = this.getAttribute('data-bs-target');
        const evaluationBox = document.querySelector(`${targetCollapseId} .evaluation-box`);
        
        // Skip entirely if this is an old structural PDF question without an MC option setup
        if (!correctAnswer) {
            if (evaluationBox) evaluationBox.remove(); // Remove the alert placeholder styling box cleanly
            return;
        }

        // Search for the checked radio button belonging to this specific practice question block
        const selectedRadio = document.querySelector(`input[name="answers[${practiceId}]"]:checked`);
        
        // Setup simple multi-lingual phrasing tracking your layout variable
        const isChinese = "{{ lang }}" === "Chi";

        if (!selectedRadio) {
            // Warn them to pick an answer choice variant first
            evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold";
            evaluationBox.innerHTML = isChinese 
                ? `⚠️ 请先选择一个选项再查看答案！` 
                : `⚠️ Please select an option before checking the answer!`;
            return;
        }

        const studentChoice = selectedRadio.value;

        if (studentChoice === correctAnswer) {
            // Correct Choice State Layout styling
            evaluationBox.className = "p-3 mb-3 border rounded text-success bg-success bg-opacity-10 text-center fw-bold fs-5";
            evaluationBox.innerHTML = isChinese 
                ? `🎉 回答正确！你的选择: ${studentChoice}` 
                : `🎉 Correct! Your Choice: ${studentChoice}`;
        } else {
            // Incorrect Choice State Layout styling
            evaluationBox.className = "p-3 mb-3 border rounded text-danger bg-danger bg-opacity-10 text-center fw-bold fs-5";
            evaluationBox.innerHTML = isChinese 
                ? `❌ 回答错误。你选了 ${studentChoice}，正确答案是: ${correctAnswer}` 
                : `❌ Incorrect. You chose ${studentChoice}. The correct answer is: ${correctAnswer}`;
        }
    });
});
