// 1. Core Solution Video/Document Toggles
function loadAnswer(id, url) {
    var container = document.getElementById("div-" + id);
    if (container.innerHTML !== "") {
        container.innerHTML = ""; 
    } else {
        container.innerHTML = `<iframe src="${url}" width="80%" height="300px" style="border: none;"></iframe>`;
    }
}

// 2. Note Capture System
function downloadNote(id) {
    const textArea = document.getElementById('notes-' + id);
    const textContent = textArea.value;

    if (!textContent.trim()) {
        alert("The note is empty! Type something first.");
        return;
    }

    const blob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `Practice_${id}_Notes.txt`;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.URL.revokeObjectURL(link.href);
}

function saveLocally(id, text) {
    localStorage.setItem('practice_note_' + id, text);
}

function loadSavedNotes() {
    const textAreas = document.querySelectorAll('textarea[id^="notes-"]');
    textAreas.forEach(area => {
        const id = area.id.replace('notes-', '');
        const savedText = localStorage.getItem('practice_note_' + id);
        if (savedText) {
            area.value = savedText;
        }
    });
}

// 3. Unified Initialization Block (Combining everything into a single lifecycle hook)
document.addEventListener('DOMContentLoaded', function() {
    // Run Note Loader
    loadSavedNotes();

    // Event Delegation: Listen at document level so class changes never break bindings
    document.addEventListener('click', function(e) {
        // Target specifically our check button component
        const button = e.target.closest('.mc-check-btn');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation(); // Keeps Accordion panels stable

        const practiceId = button.getAttribute('data-practice-id');
        const correctAnswer = button.getAttribute('data-correct');
        const targetSelector = button.getAttribute('data-target');
        const panelEl = document.querySelector(targetSelector); 
        
        if (!panelEl) return;
        const evaluationBox = panelEl.querySelector('.evaluation-box');
        
        const currentLang = button.getAttribute('data-lang');
        const isChinese = (currentLang === "Chi");

        // Fallback state logic
        if (!correctAnswer) {
            panelEl.classList.toggle('d-none');
            return;
        }

        panelEl.classList.remove('d-none');

        // Check for active radio options
        const selectedRadio = document.querySelector(`input[name="answers[${practiceId}]"]:checked`);
        
        if (!selectedRadio) {
            evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold";
            evaluationBox.innerHTML = isChinese 
                ? `⚠️ 请先选择一个选项再查看答案！` 
                : `⚠️ Please select an option before checking the answer!`;
            
            button.classList.remove('btn-outline-success', 'btn-success', 'btn-danger');
            button.classList.add('btn-outline-warning');
            return; 
        }

        const studentChoice = selectedRadio.value;

        if (studentChoice === correctAnswer) {
            evaluationBox.className = "p-3 mb-3 border rounded text-success bg-success bg-opacity-10 text-center fw-bold fs-5";
            evaluationBox.innerHTML = isChinese 
                ? `🎉 正確！你的答案: ${studentChoice}` 
                : `🎉 Correct! Your Choice: ${studentChoice}`;
            
            button.classList.remove('btn-outline-success', 'btn-outline-warning', 'btn-danger');
            button.classList.add('btn-success');
        } else {
            evaluationBox.className = "p-3 mb-3 border rounded text-danger bg-danger bg-opacity-10 text-center fw-bold fs-5";
            evaluationBox.innerHTML = isChinese 
                ? `❌ 回答錯誤。你的回答 ${studentChoice}，正確答案: ${correctAnswer}` 
                : `❌ Incorrect. You chose ${studentChoice}. correct answer: ${correctAnswer}`;
            
            button.classList.remove('btn-outline-success', 'btn-outline-warning', 'btn-success');
            button.classList.add('btn-danger');
        }
    });
});