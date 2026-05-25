// 1. Solution Document Frame Frame Management
function loadAnswer(id, url) {
    var container = document.getElementById("div-" + id);
    if (container.innerHTML !== "") {
        container.innerHTML = ""; 
    } else {
        container.innerHTML = `<iframe src="${url}" width="80%" height="300px" style="border: none;"></iframe>`;
    }
}

// 2. Client Workspace Save System
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

// 3. Unified Interface Event Handling Lifecycle
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user workspaces
    loadSavedNotes();

    // Event Delegation: Listens directly at document level to protect against loop execution changes
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.mc-check-btn');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation(); // Insulates parent Accordion state targets

        const practiceId = button.getAttribute('data-practice-id');
        const correctAnswer = button.getAttribute('data-correct');
        const targetSelector = button.getAttribute('data-target');
        const panelEl = document.querySelector(targetSelector); 
        
        if (!panelEl) return;
        // CRITICAL STABILITY FIX: Finds element by structural path instead of a volatile utility class name
        const evaluationBox = panelEl.firstElementChild;
        if (!evaluationBox) return;
        
        const currentLang = button.getAttribute('data-lang');
        const isChinese = (currentLang === "Chi");

        if (!correctAnswer) {
            panelEl.classList.toggle('d-none');
            return;
        }

        panelEl.classList.remove('d-none');

        // Capture input choice state
        const selectedRadio = document.querySelector(`input[name="answers[${practiceId}]"]:checked`);
        
        if (!selectedRadio) {
            // Maintains structural placeholder baseline layout settings safely
            evaluationBox.className = "p-3 mb-3 border rounded text-warning bg-warning bg-opacity-10 text-center fw-bold evaluation-box";
            evaluationBox.innerHTML = isChinese 
                ? `⚠️ 請先作選擇` 
                : `⚠️ Please select an option`;
            
            button.className = "btn btn-sm btn-outline-warning mb-2 mc-check-btn";
            return; // Exits securely, keeping structural variables alive for follow-up attempts
        }

        const studentChoice = selectedRadio.value;

        if (studentChoice === correctAnswer) {
            evaluationBox.className = "p-3 mb-3 border rounded text-success bg-success bg-opacity-10 text-center fw-bold fs-5 evaluation-box";
            evaluationBox.innerHTML = isChinese 
                ? `🎉 正確！你的答案: ${studentChoice}` 
                : `🎉 Correct! Your Choice: ${studentChoice}`;
            
            button.className = "btn btn-sm btn-success mb-2 mc-check-btn";
        } else {
            evaluationBox.className = "p-3 mb-3 border rounded text-danger bg-danger bg-opacity-10 text-center fw-bold fs-5 evaluation-box";
            evaluationBox.innerHTML = isChinese 
                ? `❌ 錯誤。  選了 ${studentChoice}.` 
                : `❌ Incorrect.  ${studentChoice} was selected. `;
            
            button.className = "btn btn-sm btn-danger mb-2 mc-check-btn";
        }
    });
});