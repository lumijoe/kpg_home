# kpg_home

cd workers && npm run dev


# pagesログ
Private → Public に変更したことが原因の可能性大
📝 GitHub Pages の仕様
Private リポジトリの場合

GitHub Pages は Pro/Team/Enterprise プランのみ
無料プランでは Pages が使えない
だから Actions も動かない

Public に変更した後

GitHub Pages が使えるようになる
でも自動で有効にはならない！
手動で Pages を有効化する必要がある

🔧 解決方法

Settings → Pages に行く
Source セクションで：

Source: Deploy from a branch を選択
Branch: main を選択
Folder: / (root) を選択
Save をクリック


数分待つと：

最初の pages-build-deployment が走る
その後、pushするたびに自動実行される！

# 貯金と引き落としのそれぞれの数字が瞬時に視覚化できる
- 口座毎の管理
- A口座、B口座、C口座、D口座、CASHもあり