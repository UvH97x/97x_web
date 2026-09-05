# 97x_web

## Codex / GPT-6 Astra

本プロジェクトのCodex開発用設定は `.codex/config.toml` で管理します。

```toml
model = "gpt-6-astra"
model_reasoning_effort = "medium"
```

推論の強度は通常の開発向けの初期値として `medium` にしています。複雑な調査や設計では、タスクに応じて変更してください。

プロジェクトを信頼済みとして開き、新しいCodexセッションでモデル選択が **GPT-6 Astra** になっていることを確認してください。既存タスクのモデル選択や明示的な起動オプションがある場合は、そちらも確認してください。このファイルの追加だけで、進行中のタスクのモデルが切り替わることは保証されません。

CLIでモデルと推論の強度を明示する場合は、プロジェクトルートで実行します。

```powershell
codex --model gpt-6-astra -c 'model_reasoning_effort="medium"'
```

この設定は開発エージェント用です。Webサイトには現在OpenAI API連携がなく、サイト実行用のAPIキーは不要です。モデルの利用には、使用するCodex環境とアカウントでGPT-6 Astraが利用可能である必要があります。

公式資料（2026-09-05確認）:

- [GPT-6 Astraガイド](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)
- [Codexの設定と優先順位](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Codex設定例](https://learn.chatgpt.com/ja-JP/docs/config-file/config-sample)
