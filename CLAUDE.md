# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

カメラ撮影と音声認識機能を持つWebアプリケーション。バニラJavaScript、HTML、CSSで構築されたクライアントサイドのみのアプリケーション。

## アーキテクチャ

### ファイル構成
- `index.html`: アプリケーションのHTML構造
- `app.js`: すべてのJavaScriptロジック（カメラ、音声認識、UI制御）
- `style.css`: すべてのスタイリング

### 主要機能

#### 1. カメラ機能
- **MediaStream API** を使用して後方カメラ（`facingMode: 'environment'`）にアクセス
- Canvas API で画像をキャプチャ（PNG形式）
- 撮影した画像はメモリ内（Data URL）で管理、ダウンロード可能

#### 2. 音声認識機能
- **Web Speech API** (`SpeechRecognition`) を使用
- 日本語認識（`lang: 'ja-JP'`）に設定
- リアルタイム認識：`continuous: true`, `interimResults: true`
- 確定テキスト（`finalTranscript`）と途中結果（`interimTranscript`）を分離管理

#### 3. 状態管理
グローバル変数で状態を管理：
- `stream`: カメラストリーム
- `recognition`: 音声認識インスタンス
- `isRecording`: 録音状態
- `finalTranscript`: 確定した音声認識テキスト

## 開発方法

### ローカル実行
ビルドプロセスは不要。HTTPサーバーで実行：

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

ブラウザで `http://localhost:8000` にアクセス。

### カメラの向きを変更する場合
`app.js` の `startCamera()` 関数内の `facingMode` を変更：
- 後方カメラ: `'environment'`
- 前面カメラ: `'user'`

### 音声認識の言語を変更する場合
`app.js` の `initSpeechRecognition()` 関数内の `recognition.lang` を変更：
- 日本語: `'ja-JP'`
- 英語: `'en-US'`

## ブラウザ互換性の注意点

- **カメラアクセス**: HTTPS環境が必要（localhostは例外）
- **音声認識**: Chrome/Edge が推奨。Safari は `webkitSpeechRecognition` として部分対応
- **iOS Safari**: カメラの `facingMode` 指定が期待通り動作しない場合がある

## デバッグ

カメラストリームの情報を確認：
```javascript
console.log(stream.getVideoTracks()[0].getSettings());
```

音声認識のイベントを確認：
- `recognition.onresult`: 認識結果
- `recognition.onerror`: エラー情報
