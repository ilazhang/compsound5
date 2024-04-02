var audioCtx;
var osc;
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator();
    timings = audioCtx.createGain();
    timings.gain.value = 0;
    osc.connect(timings).connect(audioCtx.destination);
    osc.start();
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    let index = 0;
    const startTime = audioCtx.currentTime;

    const playNextNote = () => {
        const noteData = liveCodeState[index];
        const fadeDuration = 0.01;
        timings.gain.setValueAtTime(0.001, startTime + timeElapsedSecs);
        timings.gain.exponentialRampToValueAtTime(1, startTime + timeElapsedSecs + fadeDuration);
        const noteEndTime = startTime + timeElapsedSecs + (noteData["length"] / 10.0);
        timings.gain.exponentialRampToValueAtTime(0.001, noteEndTime - fadeDuration);

        osc.frequency.setValueAtTime(noteData["pitch"], startTime + timeElapsedSecs);

        timeElapsedSecs += noteData["length"] / 10.0 + 0.2;
        index = (index + 1) % liveCodeState.length;

        if (index < liveCodeState.length) {
            setTimeout(playNextNote, (timeElapsedSecs - (audioCtx.currentTime - startTime)) * 1000);
        }
    };
    playNextNote();
}






function parseCode(code) {
    let notes = code.split(" ");

    notes = notes.map(note => {
        noteData = note.split("@");
        return {"length": eval(noteData[0]), "pitch": eval(noteData[1])};
    });
    return notes;
}

function genAudio(data) {
    liveCodeState = data.flat();
    scheduleAudio();
}

function reevaluate() {
    var code1 = document.getElementById('code1').value;
    var code2 = document.getElementById('code2').value;

    if (code1 || code2) {
        var data1 = code1 ? parseCode(code1) : [];
        var data2 = code2 ? parseCode(code2) : [];

        var mergedData = code1 && code2 ? [data1, data2] : data1.concat(data2);

        genAudio(mergedData);
    } else {
        console.log("No input");
    }
}

playButton.addEventListener('click', function () {
    if (!audioCtx) {
        initAudio();
    }
    reevaluate();
});
