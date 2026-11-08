// src/app/applications/todo/DataTransfer.tsx
// データを JSON ファイルに書き出す・ファイルから読み込む。localStorage はデバイスごとなので、移行や控えに使う。
'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, Download, Upload } from 'lucide-react';
import { Modal, buttonClass } from './Modal';
import { exportFileName, parseData, serializeData, type TodoData } from './storage';

interface DataTransferProps {
  current: TodoData;
  onImport: (data: TodoData) => void;
}

function downloadData(data: TodoData) {
  const blob = new Blob([serializeData(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName();
  link.click();
  URL.revokeObjectURL(url);
}

function summary(data: TodoData) {
  const done = data.todos.filter(t => t.completed).length;
  return `クラス ${data.categories.length} 件・タスク ${data.todos.length} 件（うち完了 ${done} 件）`;
}

export default function DataTransfer({ current, onImport }: DataTransferProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ data: TodoData; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backedUp, setBackedUp] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 同じファイルをもう一度選んでも change が発火するように。
    if (!file) return;
    try {
      setPending({ data: parseData(await file.text()), fileName: file.name });
      setBackedUp(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました。');
    }
  };

  const linkClass =
    'flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-fg';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="px-2 text-xs font-semibold tracking-wide text-muted">データ</div>
      <div className="flex gap-2">
        <button type="button" onClick={() => downloadData(current)} className={linkClass} title="すべてのデータを JSON ファイルに保存">
          <Download size={14} /> 書き出し
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={linkClass} title="JSON ファイルから読み込み（現在のデータは置き換わります）">
          <Upload size={14} /> 読み込み
        </button>
      </div>
      <p className="px-2 text-xs leading-relaxed text-muted/80">
        データはこのブラウザだけに保存されます。別の端末へ移すときは書き出したファイルを読み込んでください。
      </p>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />

      {pending && (
        <Modal title="ファイルから読み込む" onClose={() => setPending(null)}>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                現在のクラスとタスクはすべて削除され、ファイルの内容に<strong>完全に置き換わります</strong>。
                この操作は元に戻せません。
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
              <dt className="text-muted">現在</dt>
              <dd>{summary(current)}</dd>
              <dt className="text-muted">ファイル</dt>
              <dd>
                {summary(pending.data)}
                <span className="block break-all text-xs text-muted">{pending.fileName}</span>
              </dd>
            </dl>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => { downloadData(current); setBackedUp(true); }}
                className={`${buttonClass.secondary} flex items-center justify-center gap-1.5 sm:mr-auto`}
              >
                <Download size={14} /> {backedUp ? '書き出しました' : '先に現在のデータを書き出す'}
              </button>
              <button type="button" onClick={() => setPending(null)} className={buttonClass.secondary}>
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => { onImport(pending.data); setPending(null); }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                上書きして読み込む
              </button>
            </div>
          </div>
        </Modal>
      )}

      {error && (
        <Modal title="読み込めませんでした" onClose={() => setError(null)}>
          <p className="text-sm leading-relaxed">{error}</p>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setError(null)} className={buttonClass.primary}>閉じる</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
