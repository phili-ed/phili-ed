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