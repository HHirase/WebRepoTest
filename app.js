// DOM要素の取得
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const photosContainer = document.getElementById('photos');

let stream = null;

/**
 * カメラを起動する
 */
async function startCamera() {
    try {
        // iOS Safari では facingMode を { exact: 'user' } で指定する必要がある
        const constraints = {
            video: {
                facingMode: { exact: 'user' }, // 前面カメラを厳密に指定
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        // ユーザーのカメラにアクセス
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // ビデオ要素にストリームを設定
        video.srcObject = stream;
    } catch (error) {
        console.error('カメラへのアクセスエラー:', error);

        // facingMode: { exact: 'user' } で失敗した場合のフォールバック
        try {
            console.log('フォールバックモードで再試行中...');
            const fallbackConstraints = {
                video: {
                    facingMode: 'user' // exact を外して再試行
                },
                audio: false
            };
            stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            video.srcObject = stream;
        } catch (fallbackError) {
            console.error('フォールバックもエラー:', fallbackError);
            alert('カメラへのアクセスに失敗しました。カメラの使用を許可してください。');
        }
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

// イベントリスナーの設定
captureBtn.addEventListener('click', capturePhoto);

// ページ読み込み時にカメラを起動
window.addEventListener('load', startCamera);

// ページを離れる時にカメラストリームを停止
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
