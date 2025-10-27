// DOM要素の取得
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const micBtn = document.getElementById('mic-btn');
const photosContainer = document.getElementById('photos');
const transcriptionElement = document.getElementById('transcription');

let stream = null;
let recognition = null;
let isRecording = false;

/**
 * カメラを起動する
 */
async function startCamera() {
    try {
        // 後方カメラ（背面カメラ）で撮影
        const constraints = {
            video: {
                facingMode: 'environment', // 後方カメラを指定
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };

        // ユーザーのカメラにアクセス
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // ビデオ要素にストリームを設定
        video.srcObject = stream;

        // ストリームが開始されたことを確認
        console.log('カメラストリーム開始:', stream.getVideoTracks()[0].getSettings());
    } catch (error) {
        console.error('カメラへのアクセスエラー:', error);
        alert('カメラへのアクセスに失敗しました。カメラの使用を許可してください。');
    }
}

/**
 * 写真を撮影する
 */
function capturePhoto() {
    // ビデオのサイズに合わせてcanvasのサイズを設定
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // canvasに現在のビデオフレームを描画
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // canvasから画像データを取得
    const imageDataUrl = canvas.toDataURL('image/png');

    // 撮影した画像を表示エリアに追加
    addPhotoToGallery(imageDataUrl);
}

/**
 * 撮影した画像をギャラリーに追加
 * @param {string} imageDataUrl - 画像のData URL
 */
function addPhotoToGallery(imageDataUrl) {
    // 画像コンテナを作成
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';

    // 画像要素を作成
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.alt = '撮影した写真';

    // ダウンロードボタンを作成
    const downloadBtn = document.createElement('a');
    downloadBtn.href = imageDataUrl;
    downloadBtn.download = `photo_${Date.now()}.png`;
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = 'ダウンロード';

    // 削除ボタンを作成
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.onclick = () => photoItem.remove();

    // ボタンコンテナを作成
    const btnContainer = document.createElement('div');
    btnContainer.className = 'photo-buttons';
    btnContainer.appendChild(downloadBtn);
    btnContainer.appendChild(deleteBtn);

    // 要素を組み立て
    photoItem.appendChild(img);
    photoItem.appendChild(btnContainer);

    // ギャラリーの先頭に追加（新しい写真が上に来る）
    photosContainer.insertBefore(photoItem, photosContainer.firstChild);
}

/**
 * 音声認識を初期化する
 */
function initSpeechRecognition() {
    // ブラウザの音声認識APIを取得
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('このブラウザは音声認識に対応していません');
        micBtn.disabled = true;
        micBtn.textContent = '🎤 非対応';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP'; // 日本語に設定
    recognition.continuous = true; // 継続的に認識
    recognition.interimResults = true; // 途中結果も取得

    // 音声認識結果のイベントハンドラ
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // 認識結果を処理
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + '\n';
            } else {
                interimTranscript += transcript;
            }
        }

        // 結果を表示
        if (finalTranscript) {
            transcriptionElement.textContent += finalTranscript;
        }

        // 途中結果を末尾に表示
        if (interimTranscript) {
            const currentText = transcriptionElement.textContent;
            const lines = currentText.split('\n');
            const lastLine = lines[lines.length - 1];

            // 最後の行が途中結果の場合は置き換え、そうでなければ追加
            if (lastLine && !lastLine.trim()) {
                transcriptionElement.textContent = currentText + interimTranscript;
            } else {
                transcriptionElement.textContent = currentText + '\n' + interimTranscript;
            }
        }
    };

    // エラーハンドリング
    recognition.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        if (event.error === 'no-speech') {
            console.log('音声が検出されませんでした');
        } else if (event.error === 'not-allowed') {
            alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
        }
    };

    // 認識終了時のハンドラ
    recognition.onend = () => {
        if (isRecording) {
            // 継続的に録音する場合は再開
            recognition.start();
        } else {
            micBtn.classList.remove('recording');
            micBtn.textContent = '🎤 音声認識';
        }
    };
}

/**
 * 音声認識の開始/停止を切り替える
 */
function toggleSpeechRecognition() {
    if (!recognition) {
        alert('音声認識が初期化されていません');
        return;
    }

    if (isRecording) {
        // 録音停止
        isRecording = false;
        recognition.stop();
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤 音声認識';
    } else {
        // 録音開始
        isRecording = true;
        transcriptionElement.textContent = ''; // テキストをクリア
        recognition.start();
        micBtn.classList.add('recording');
        micBtn.textContent = '⏹️ 停止';
    }
}

// イベントリスナーの設定
captureBtn.addEventListener('click', capturePhoto);
micBtn.addEventListener('click', toggleSpeechRecognition);

// ページ読み込み時にカメラと音声認識を初期化
window.addEventListener('load', () => {
    startCamera();
    initSpeechRecognition();
});

// ページを離れる時にカメラストリームを停止
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
