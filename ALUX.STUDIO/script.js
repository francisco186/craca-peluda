// Variáveis de controle
document.addEventListener("DOMContentLoaded", () => {
    const instruments = [1, 2, 3];
    let mediaRecorders = {};
    let audioChunks = {};
    let streams = {};

    const audios = instruments.map(num => document.getElementById(`audio${num}`));
    const playAllButton = document.getElementById("btn-play-all");

    function checkIfAllLoaded() {
        return audios.every(audio => audio.src && audio.src !== "");
    }

    function enablePlayAllButton() {
        playAllButton.disabled = !checkIfAllLoaded();
    }

    function playAllSimultaneously() {
        audios.forEach(audio => {
            audio.currentTime = 0;
            audio.play().catch(error => console.error("Erro ao tocar áudio:", error));
        });
    }

    function playAllSequentially(index = 0) {
        if (index < audios.length) {
            audios[index].currentTime = 0;
            audios[index].play().then(() => {
                audios[index].onended = () => playAllSequentially(index + 1);
            }).catch(error => console.error("Erro ao tocar áudio:", error));
        }
    }

    playAllButton.addEventListener("click", () => {
        const playSequentially = confirm("Tocar os áudios em sequência? (OK = Sim, Cancelar = Simultâneo)");
        if (playSequentially) {
            playAllSequentially();
        } else {
            playAllSimultaneously();
        }
    });

    audios.forEach(audio => {
        audio.addEventListener("loadeddata", enablePlayAllButton);
    });

    instruments.forEach(num => {
        const btnRecord = document.getElementById(`btn-instrument${num}`);
        const btnStop = document.getElementById(`btn-stop${num}`);
        const audioElement = document.getElementById(`audio${num}`);
        const btnUpload = document.getElementById(`btn-upload${num}`);
        const btnDownload = document.getElementById(`btn-download${num}`);

        btnRecord.addEventListener("click", async () => {
            streams[num] = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorders[num] = new MediaRecorder(streams[num]);
            audioChunks[num] = [];

            mediaRecorders[num].ondataavailable = event => {
                audioChunks[num].push(event.data);
            };

            mediaRecorders[num].onstop = () => {
                const audioBlob = new Blob(audioChunks[num], { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioElement.src = audioUrl;
                enablePlayAllButton();
            };

            mediaRecorders[num].start();
            btnRecord.disabled = true;
            btnStop.disabled = false;
        });

        btnStop.addEventListener("click", () => {
            mediaRecorders[num].stop();
            streams[num].getTracks().forEach(track => track.stop());
            btnRecord.disabled = false;
            btnStop.disabled = true;
        });

        btnUpload.addEventListener("click", () => {
            alert("Função de upload ainda não implementada.");
        });

        btnDownload.addEventListener("click", () => {
            if (audioChunks[num]) {
                const audioBlob = new Blob(audioChunks[num], { type: "audio/wav" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(audioBlob);
                link.download = `instrumento${num}.wav`;
                link.click();
            }
        });
    });

    document.getElementById("btn-delete-all").addEventListener("click", () => {
        audios.forEach(audio => {
            audio.src = "";
        });
        enablePlayAllButton();
    });

    document.getElementById("btn-restart-all").addEventListener("click", () => {
        location.reload();
    });

    document.getElementById("btn-import").addEventListener("click", () => {
        document.getElementById("file-input").click();
    });

    document.getElementById("file-input").addEventListener("change", event => {
        const file = event.target.files[0];
        if (file) {
            alert("Importação ainda não implementada.");
        }
    });

    document.getElementById("btn-export").addEventListener("click", () => {
        alert("Exportação ainda não implementada.");
    });
});
