
let globalPaperFingerprints = []; 

function syncAll() {
    const fields = ['acadYear', 'regulation', 'branch', 'yearSem', 'subjNameCode', 'midTerm', 'maxMarks', 'duration', 'qpSet'];
    fields.forEach(id => {
        const val = document.getElementById(id).value;
        const target = document.getElementById('v-' + id.toLowerCase().replace('namecode','subj'));
        if (target) target.innerText = val || '---';
    });
}

function addQuestion() {
    const text = document.getElementById('qText').value.trim();
    const num = document.getElementById('qNum').value;
    const co = document.getElementById('co').value;
    const l = document.getElementById('blooms').value;
    const m = document.getElementById('marks').value;
    const tableId = document.getElementById('partSelect').value;

    if (!text || !num) return;

    
    
    const noise = ["what", "are", "is", "the", "give", "details", "about", "variety", "different", "of", "and", "with", "write", "explain", "define", "various"];
    
    let tokens = text.toLowerCase()
        .replace(/[?!.,]/g, "")
        .split(/\s+/)
        .filter(word => !noise.includes(word) && word.length > 1)
        .map(word => word.replace(/s\b/g, "")); 
    
    const currentFingerprint = tokens.sort().join(" ");

    
    if (globalPaperFingerprints.includes(currentFingerprint)) {
        document.getElementById('alert-message').innerText = `STRICT REJECTION: The topic and intent "${tokens.join(" ").toUpperCase()}" is already present on this paper!`;
        document.getElementById('modal-overlay').style.display = 'flex';
        return;
    }

    
    globalPaperFingerprints.push(currentFingerprint);
    
    
    const topicList = document.getElementById('used-topics');
    const li = document.createElement('li');
    li.style.color = "#3d5afe";
    li.style.fontWeight = "bold";
    li.innerText = `• ${tokens.join(" ").toUpperCase()}`;
    topicList.appendChild(li);

    const row = `<tr>
        <td style="text-align:center">${num}</td>
        <td>${text}</td>
        <td style="text-align:center">${co}</td>
        <td style="text-align:center">${l}</td>
        <td style="text-align:center">${m}</td>
    </tr>`;
    
    document.getElementById(tableId).innerHTML += row;
    document.getElementById('qText').value = "";
}

function closeModal() { 
    document.getElementById('modal-overlay').style.display = 'none'; 
}

function addOrRow() {
    const row = `<tr><td colspan="5" style="text-align:center; font-weight:bold; height:35px; background:#f5f5f5;">(OR)</td></tr>`;
    document.getElementById('part-b-body').innerHTML += row;
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const paper = document.getElementById('print-area');
    const canvas = await html2canvas(paper, { scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save("VIET_Final_Exam_Paper.pdf");
}