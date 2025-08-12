# kpg_home

家計管理アプリケーション - 貯金と引き落としを視覚化

## 概要

複数口座の貯金と引き落としを瞬時に視覚化できる家計管理ツール

### 主な機能
- 口座毎の管理（A口座、B口座、C口座、D口座、現金）
- 貯金と引き落としの視覚化
- リアルタイムでの残高確認

## 開発環境の起動

```bash
cd workers && npm run dev
```

## GitHub Pages デプロイメント設定

### Private → Public リポジトリへの変更時の注意

#### Private リポジトリの制限
- GitHub Pages は Pro/Team/Enterprise プランのみ利用可能
- 無料プランでは Pages が使えず、Actions も動作しない

#### Public リポジトリでの設定手順

1. **Settings → Pages** にアクセス
2. **Source セクション**で以下を設定：
   - Source: `Deploy from a branch` を選択
   - Branch: `main` を選択  
   - Folder: `/ (root)` を選択
3. **Save** をクリック

設定後、数分待つと最初の pages-build-deployment が実行され、以降は push のたびに自動デプロイされます。