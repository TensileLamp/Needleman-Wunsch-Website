const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
    startAlignment();
});

function startAlignment() {
    const seq1 = document.getElementById('seq1').value.toUpperCase();
    const seq2 = document.getElementById('seq2').value.toUpperCase();
    const match = 1, mismatch = -1, gap = -2;

    const speed = parseInt(document.getElementById('speedSelect').value);
    const dpDelay = 700 / speed;
    const btDelay = 700 / speed;

    const m = seq1.length;
    const n = seq2.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i * gap;
    for (let j = 0; j <= n; j++) dp[0][j] = j * gap;

    // DP Matrix HTML
    let matrixHTML = '<table><tr><th></th><th></th>';
    for (let j = 0; j < seq2.length; j++) matrixHTML += `<th>${seq2[j]}</th>`;
    matrixHTML += '</tr>';
    for (let i = 0; i <= seq1.length; i++) {
        matrixHTML += `<tr><th>${i === 0 ? '' : seq1[i - 1]}</th>`;
        for (let j = 0; j <= seq2.length; j++) {
            const value = (i === 0 || j === 0) ? dp[i][j] : '';
            matrixHTML += `<td id="cell-${i}-${j}">${value}</td>`;
        }
        matrixHTML += '</tr>';
    }

    document.getElementById('matrix').innerHTML = matrixHTML;
    document.getElementById('backtrackMatrix').innerHTML = '';
    document.getElementById('btSteps').innerHTML = '<h4>Backtracking Steps:</h4>';
    document.getElementById('alignment').innerHTML = '';
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';

    let i = 1, j = 1;

    function fillCell() {
        if (i > m) {
            drawBacktrackStepByStep(dp, seq1, seq2, match, mismatch, gap, btDelay);
            return;
        }

        const scoreDiag = dp[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? match : mismatch);
        const scoreUp = dp[i - 1][j] + gap;
        const scoreLeft = dp[i][j - 1] + gap;
        const chosen = Math.max(scoreDiag, scoreUp, scoreLeft);
        dp[i][j] = chosen;

        const cell = document.getElementById(`cell-${i}-${j}`);
        cell.textContent = chosen;
        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        cell.classList.add('active');

        const stepP = document.createElement('p');
        stepP.classList.add('current-step');
        stepP.textContent = `Cell [${i},${j}]: diag=${scoreDiag}, up=${scoreUp}, left=${scoreLeft} → chosen=${chosen}`;
        stepsDiv.appendChild(stepP);
        stepsDiv.scrollTop = stepsDiv.scrollHeight;

        j++;
        if (j > n) { j = 1; i++; }

        setTimeout(fillCell, dpDelay);
    }

    fillCell();
}

function drawBacktrackStepByStep(dp, seq1, seq2, match, mismatch, gap, btDelay) {
    const m = seq1.length;
    const n = seq2.length;

    let backHTML = '<table><tr><th></th><th></th>';
    for (let jj = 0; jj < seq2.length; jj++) backHTML += `<th>${seq2[jj]}</th>`;
    backHTML += '</tr>';
    for (let ii = 0; ii <= seq1.length; ii++) {
        backHTML += `<tr><th>${ii === 0 ? '' : seq1[ii - 1]}</th>`;
        for (let jj = 0; jj <= seq2.length; jj++) {
            backHTML += `<td id="bcell-${ii}-${jj}">${dp[ii][jj]}</td>`;
        }
        backHTML += '</tr>';
    }
    document.getElementById('backtrackMatrix').innerHTML = backHTML;

    let i = m, j = n;
    let align1 = '', align2 = '';
    const btLog = document.getElementById('btSteps');

    function stepBacktrack() {
        if (i === 0 && j === 0) {
            document.getElementById('alignment').innerHTML = `<pre>${align1}\n${align2}</pre>`;
            return;
        }

        document.querySelectorAll('#backtrackMatrix td').forEach(td => td.classList.remove('active'));

        let action = '';
        let cellId = `bcell-${i}-${j}`;

        if (i > 0 && j > 0 &&
            dp[i][j] === dp[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? match : mismatch)) {

            align1 = seq1[i - 1] + align1;
            align2 = seq2[j - 1] + align2;
            action = `Diagonal → Match/Mismatch at [${i},${j}]`;
            i--; j--;

        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gap) {

            align1 = seq1[i - 1] + align1;
            align2 = '-' + align2;
            action = `Up → Gap in Seq2 at [${i},${j}]`;
            i--;

        } else {

            align1 = '-' + align1;
            align2 = seq2[j - 1] + align2;
            action = `Left → Gap in Seq1 at [${i},${j}]`;
            j--;
        }

        document.getElementById(cellId).classList.add('active');

        const log = document.createElement('p');
        log.textContent = action;
        btLog.appendChild(log);
        btLog.scrollTop = btLog.scrollHeight;

        setTimeout(stepBacktrack, btDelay);
    }

    stepBacktrack();
}
