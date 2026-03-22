let globalPaperFingerprints = [];
let savedQuestions = [];

function syncAll() {
    const fieldMap = {
        'acadYear': 'v-acadyear',
        'regulation': 'v-regulation',
        'branch': 'v-branch',
        'yearSem': ['v-yearsem', 'v-header-yearsem'],
        'midTerm': ['v-midterm', 'v-header-mid'],
        'examMonthYear': 'v-header-monthyear',
        'subjNameCode': 'v-subj',
        'maxMarks': 'v-maxmarks',
        'duration': 'v-duration',
        'qpSet': 'v-qpset',
        'partAInst': 'v-partAInst',
        'partAMarks': 'v-partAMarks',
        'partBInst': 'v-partBInst',
        'partBMarks': 'v-partBMarks'
    };

    for (let inputId in fieldMap) {
        const input = document.getElementById(inputId);
        const targetIds = fieldMap[inputId];
        if (input) {
            let val = input.value;
            if (Array.isArray(targetIds)) {
                targetIds.forEach(id => {
                    const target = document.getElementById(id);
                    if (target) target.innerText = val || '---';
                });
            } else {
                const target = document.getElementById(targetIds);
                if (target) {
                    target.innerText = (inputId.includes('Marks') && !inputId.includes('max') && val) ? "Marks " + val : (val || '---');
                }
            }
        }
    }
}

function addQuestion() {
    const text = document.getElementById('qText').value.trim();
    const num = document.getElementById('qNum').value.trim();
    const co = document.getElementById('co').value;
    const l = document.getElementById('blooms').value;
    const m = document.getElementById('marks').value;
    const tableId = document.getElementById('partSelect').value;

    if (!text || !num) return;

    const noise = ["what", "are", "is", "the", "give", "write", "explain", "define"];
    let tokens = text.toLowerCase().replace(/[?!.,]/g, "").split(/\s+/).filter(word => !noise.includes(word) && word.length > 1);
    const fingerprint = tokens.sort().join(" ");

    if (globalPaperFingerprints.includes(fingerprint)) {
        document.getElementById('alert-message').innerText = `TOPIC REJECTED: Topic already exists!`;
        document.getElementById('modal-overlay').style.display = 'flex';
        return;
    }

    globalPaperFingerprints.push(fingerprint);
    savedQuestions.push({ num, text, co, l, m, type: tableId });

    const tbody = document.getElementById(tableId);
    const row = document.createElement('tr');
    row.dataset.fingerprint = fingerprint;
    row.innerHTML = `
        <td style="text-align:center">${num}</td>
        <td>${text} <button class="no-print dlt-btn" onclick="deleteRow(this)">Delete</button></td>
        <td style="text-align:center">${co}</td>
        <td style="text-align:center">${l}</td>
        <td style="text-align:center">${m}</td>
    `;
    tbody.appendChild(row);

    if (tableId === 'part-b-body' && num.toLowerCase().includes('(b)') && parseInt(num) % 2 !== 0) {
        addOrRow();
    }

    updateTopicList();
    document.getElementById('qText').value = "";
}

function addOrRow() {
    const tbody = document.getElementById('part-b-body');
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5" style="text-align:center; font-weight:bold; height:30px; background:#f9f9f9; border: 1px solid black;">(Or) <button class="no-print dlt-btn" onclick="this.closest('tr').remove()">Delete</button></td>`;
    tbody.appendChild(row);
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    globalPaperFingerprints = globalPaperFingerprints.filter(f => f !== row.dataset.fingerprint);
    row.remove();
    updateTopicList();
}

function updateTopicList() {
    const list = document.getElementById('used-topics');
    list.innerHTML = "";
    globalPaperFingerprints.forEach(f => {
        const li = document.createElement('li');
        li.innerText = `• ${f.toUpperCase()}`;
        list.appendChild(li);
    });
}

function saveAsJSON() {
    const faculty = document.getElementById('facultyName').value.trim() || "Faculty";
    const subjCode = document.getElementById('subjNameCode').value.trim() || "NoCode";
    const midTerm = document.getElementById('midTerm').value.trim() || "Mid-X";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const paperData = {
        metadata: { faculty, subjCode, midTerm, timestamp },
        content: savedQuestions
    };

    const blob = new Blob([JSON.stringify(paperData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `${faculty}-${subjCode}-${midTerm}-${timestamp}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
}

function clearAll() {
    if(confirm("Wipe paper and start fresh?")) {
        document.getElementById('part-a-body').innerHTML = "";
        document.getElementById('part-b-body').innerHTML = "";
        globalPaperFingerprints = [];
        savedQuestions = [];
        updateTopicList();
    }
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

async function downloadPDF() {
    const dltBtns = document.querySelectorAll('.no-print');
    dltBtns.forEach(b => b.style.visibility = 'hidden');
    const canvas = await html2canvas(document.getElementById('print-area'), { scale: 2 });
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`VIET_QP_${Date.now()}.pdf`);
    dltBtns.forEach(b => b.style.visibility = 'visible');
}
