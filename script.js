const startBtn = document.getElementById("startBtn");
const speedSelect = document.getElementById("speedSelect");

startBtn.addEventListener("click", () => startAlignment());

function startAlignment() {
    const seq1 = document.getElementById("seq1").value.toUpperCase().trim();
    const seq2 = document.getElementById("seq2").value.toUpperCase().trim();

    if (!seq1 || !seq2) {
        alert("Please enter both sequences");
        return;
    }

    const MATCH = 1, MISMATCH = -1, GAP = -2;

    const speed = Math.max(1, parseInt(speedSelect.value) || 1);
    const dpDelay = Math.round(700 / speed);
    const btDelay = Math.round(700 / speed);

    const m = seq1.length, n = seq2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i * GAP;
    for (let j = 0; j <= n; j++) dp[0][j] = j * GAP;

    const matrixDiv = document.getElementById("matrix");
    const stepsDiv = document.getElementById("steps");
    const backtrackDiv = document.getElementById("backtrackMatrix");
    const btLog = document.getElementById("btSteps");
    const alignmentDiv = document.getElementById("alignment");

    matrixDiv.innerHTML = "";
    stepsDiv.innerHTML = "";
    backtrackDiv.innerHTML = "";
    btLog.innerHTML = "<h4>Backtracking Steps:</h4>";
    alignmentDiv.innerHTML = "";

    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    headerRow.appendChild(document.createElement("th"));

    for (let j = 0; j < n; j++) {
        let th = document.createElement("th");
        th.textContent = seq2[j];
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    for (let i = 0; i <= m; i++) {
        let row = document.createElement("tr");

        let rhead = document.createElement("th");
        rhead.textContent = i === 0 ? "" : seq1[i - 1];
        row.appendChild(rhead);

        let leftIndex = document.createElement("th");
        leftIndex.textContent = dp[i][0];
        leftIndex.id = `cell-${i}-0`;
        row.appendChild(leftIndex);

        for (let j = 1; j <= n; j++) {
            let td = document.createElement("td");
            td.id = `cell-${i}-${j}`;
            if (i === 0) td.textContent = dp[0][j];
            row.appendChild(td);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    matrixDiv.appendChild(table);

    document.querySelector("thead tr th:nth-child(2)").id = "cell-0-0";

    startBtn.disabled = true;

    let i = 1, j = 1;

    function fillCell() {
        if (i > m) {
            for (let ii = 0; ii <= m; ii++)
                for (let jj = 0; jj <= n; jj++)
                    document.getElementById(`cell-${ii}-${jj}`).textContent = dp[ii][jj];

            drawBacktrackStepByStep(dp, seq1, seq2, MATCH, MISMATCH, GAP, btDelay);
            return;
        }

        const scoreDiag = dp[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? MATCH : MISMATCH);
        const scoreUp = dp[i - 1][j] + GAP;
        const scoreLeft = dp[i][j - 1] + GAP;
        const chosen = Math.max(scoreDiag, scoreUp, scoreLeft);

        dp[i][j] = chosen;

        const cell = document.getElementById(`cell-${i}-${j}`);
        cell.textContent = chosen;

        document.querySelectorAll("#matrix td, #matrix th")
            .forEach(el => el.classList.remove("active"));
        cell.classList.add("active");

        const stepP = document.createElement("p");
        stepP.className = "current-step";
        stepP.textContent = `Cell [${i},${j}]: diag=${scoreDiag}, up=${scoreUp}, left=${scoreLeft} → chosen=${chosen}`;
        stepsDiv.appendChild(stepP);
        stepsDiv.scrollTop = stepsDiv.scrollHeight;

        j++;
        if (j > n) {
            j = 1;
            i++;
        }

        setTimeout(fillCell, dpDelay);
    }

    fillCell();
}

function drawBacktrackStepByStep(dp, seq1, seq2, MATCH, MISMATCH, GAP, btDelay) {
    const m = seq1.length, n = seq2.length;

    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    headerRow.appendChild(document.createElement("th"));
    headerRow.appendChild(document.createElement("th"));

    for (let j = 0; j < n; j++) {
        let th = document.createElement("th");
        th.textContent = seq2[j];
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    for (let i = 0; i <= m; i++) {
        let row = document.createElement("tr");

        let rhead = document.createElement("th");
        rhead.textContent = i === 0 ? "" : seq1[i - 1];
        row.appendChild(rhead);

        let leftIndex = document.createElement("th");
        leftIndex.textContent = dp[i][0];
        leftIndex.id = `bcell-${i}-0`;
        row.appendChild(leftIndex);

        for (let j = 1; j <= n; j++) {
            let td = document.createElement("td");
            td.textContent = dp[i][j];
            td.id = `bcell-${i}-${j}`;
            row.appendChild(td);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);

    const backtrackDiv = document.getElementById("backtrackMatrix");
    backtrackDiv.innerHTML = "";
    backtrackDiv.appendChild(table);

    let i = m, j = n;
    let align1 = "", align2 = "";
    const btLog = document.getElementById("btSteps");

    function highlightCell(ii, jj) {
        document.querySelectorAll("#backtrackMatrix td, #backtrackMatrix th")
            .forEach(el => el.classList.remove("active"));

        const el = document.getElementById(`bcell-${ii}-${jj}`);
        if (el) el.classList.add("active");
    }

    function stepBacktrack() {
        if (i === 0 && j === 0) {
            document.getElementById("alignment").innerHTML =
                `<pre>${align1}\n${align2}</pre>`;
            startBtn.disabled = false;
            return;
        }

        highlightCell(i, j);

        let action = "";

        if (i > 0 && j > 0 &&
            dp[i][j] === dp[i - 1][j - 1] +
            (seq1[i - 1] === seq2[j - 1] ? MATCH : MISMATCH)) {

            align1 = seq1[i - 1] + align1;
            align2 = seq2[j - 1] + align2;
            action = `Diagonal → ${seq1[i - 1] === seq2[j - 1] ? "Match" : "Mismatch"} at [${i},${j}]`;
            i--;
            j--;
        }

        else if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP) {
            align1 = seq1[i - 1] + align1;
            align2 = "-" + align2;
            action = `Up → Gap in Seq2 at [${i},${j}]`;
            i--;
        }

        else {
            align1 = "-" + align1;
            align2 = seq2[j - 1] + align2;
            action = `Left → Gap in Seq1 at [${i},${j}]`;
            j--;
        }

        const p = document.createElement("p");
        p.textContent = action;
        btLog.appendChild(p);
        btLog.scrollTop = btLog.scrollHeight;

        setTimeout(stepBacktrack, btDelay);
    }

    stepBacktrack();
}
