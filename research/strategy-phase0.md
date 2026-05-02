# Agent Router 覇権戦略 — フェーズ0計画書
**Date:** May 3, 2026
**Author:** Takayuki Hori + Hermes AI
**Goal:** Agent発見・品質評価レイヤーの覇権確立（買収ターゲット化）

---

## 市場規模
- AI Agent市場: $7.84B (2025) → $52.62B (2030)
- 年成長率: 46.3%
- 104,504+ Agent散在、15+レジストリ、相互接続ゼロ
- 「Agent Discovery Crisis of 2026」とメディアで報道済み

## 競合マップ
| 競合 | 何をやった | 何をしてない | 脅威度 |
|------|-----------|-------------|--------|
| ARDP (Pioli) | 登録・発見IETF Draft | 品質評価・信頼・統合検索 | 低 |
| ERC-8004 | オンチェーンID+評判 | オフチェーン対応・汎用性 | 低 |
| aiia.ro | Registry + Trust API | 規模・エコシステム牽引力 | 低 |
| NIST | Agent Identity標準策定中 | 具体仕様未定 | 中 |
| W3C AIVS | 監査証明仕様策定中 | 品質評価・発見 | 中 |
| SAMEP | 記憶交換プロトコル（論文） | 実装なし | 低 |
| AGNTCY (Cisco) | 分散ディレクトリ IETF | 複雑すぎて普及困難 | 中 |

## なし得る覇権ポジション
**Agent Router = 全レジストリ統合検索 + 品質テスト + 信頼スコア**

npmがパッケージ管理を統一したように、
Agent RouterがAgent発見を統一する。

## フェーズ0（情報収集）完了条件
- [x] 全レジストリのAPI調査
- [x] 全スキーマフォーマットの比較
- [x] 競合の強み・弱み分析
- [x] 断片化ポイントの特定
- [x] 統合可能レジストリの優先順位付け
- [ ] W3C AIVS Community Group参加方法確認
- [ ] NIST意見提出プロセス確認
- [ ] IETF Draft提出プロセス確認

## フェーズ1（構築）計画
1. agent.json仕様書 v0.1 → GitHub公開
2. Agent Router API（Cloudflare Workers）
   - MCP Registry → Smithery → Glama → Aiia.ro の順で統合
3. Agent Test Runner（サンドボックス品質テスト）
4. W3C AIVS参加 + 仕様提案
5. NIST意見書提出

## 収益モデル
- Phase 1-2: 無料（覇権確立優先）
- Phase 3: Enterprise有料版
- Phase 4: 買収 or 独立IPO

## 投資額
- 初期: ¥0（Cloudflare無料枠）
- ドメイン: ¥1,000（オプション）
