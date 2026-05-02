# 標準化団体への参加方法 — 個人 from Japan

---

## 1. W3C AIVS Community Group

**ステータス:** ✅ 今すぐ参加可能（無料）
**参加者:** 現在8名のみ（超初期）
**設立:** 2026年3月14日

### 参加手順（5分）
1. https://www.w3.org/account/request/ でW3Cアカウント作成（無料）
2. https://www.w3.org/community/aivs/ にアクセス
3. 「Join this group」をクリック
4. CLA（Contributor License Agreement）に同意
5. 参加完了 → メーリングリスト投稿・会議参加可能

### 注意点
- CLA = ロイヤリティフリーの著作権+特許ライセンス
- 45日間の特許オプトアウト期間あり
- 英語が作業言語
- 組織所属不要（個人OK）

### 提案方法
- メーリングリストに投稿
- GitHubリポジトリにPR
- グループ会議で発表

---

## 2. NIST AI Agent Identity

**ステータス:** ❌ コメント期間終了（4/2締切）
**次のチャンス:** 今後ラウンド2が来る可能性高い

### 今できること
1. safai-identity@nist.gov にメール（遅延コメント）
   - "Independent inventor from Japan"
   - agent.json仕様の概要を送る
2. NISTアラート登録: https://www.nist.gov/email-lists
3. プロジェクトページ監視: https://www.nccoe.nist.gov/projects/software-and-ai-agent-identity-and-authorization

### 次回ラウンドへの準備
- コメントは Regulations.gov or email で提出
- フォーマット: プレーンテキスト or PDF
- 形式自由（技術提案OK）

---

## 3. IETF Internet-Draft

**ステータス:** ✅ 随時提出可能（無料）
**有効期限:** 185日（更新で延長可能）

### 提出手順
1. RFCXML形式でDraftを書く
   - ツール: https://author-tools.ietf.org/
   - CLI: `pip install xml2rfc`
2. ファイル名: `draft-hori-agent-quality-graph-00.xml`
3. https://datatracker.ietf.org/submit/ でアップロード
4. 確認メール → 承認 → 公開（15分以内）
5. 関連WGメーリングリストにアナウンス

### 必須セクション
- Abstract (50-150 words)
- Introduction
- Security Considerations
- IANA Considerations
- References
- Authors' Addresses

### テンプレート
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rfc xmlns="http://tools.ietf.org/xml/rfcformat"
     docName="draft-hori-agent-quality-graph-00"
     ipr="trust200902"
     category="info">
  <front>
    <title>Agent Quality Graph Protocol</title>
    <author fullname="Takayuki Hori" initials="T." surname="Hori">
      <address>
        <email>your@email.com</email>
        <country>JP</country>
      </address>
    </author>
    <date year="2026"/>
    <abstract>
      <t>This document describes the Agent Quality Graph (AQG) protocol
         for evaluating and ranking AI agent trustworthiness based on
         delegation transaction graphs.</t>
    </abstract>
  </front>
  <middle>
    <section title="Introduction">
      <t>[Motivation and context]</t>
    </section>
    <section title="Security Considerations">
      <t>[Security discussion]</t>
    </section>
    <section title="IANA Considerations">
      <t>This document has no IANA actions.</t>
    </section>
  </middle>
  <back>
    <references title="Normative References">
    </references>
  </back>
</rfc>
```

---

## 比較サマリ

| | W3C AIVS | NIST | IETF Draft |
|---|---------|------|------------|
| 費用 | ¥0 | ¥0 | ¥0 |
| 組織不要 | ✅ | ✅ | ✅ |
| 今すぐ可能 | ✅ | ❌（遅延のみ） | ✅ |
| 法的制約 | CLA | なし | BCP 78/79 |

**優先順位:** IETF Draft → W3C参加 → NISTメール
