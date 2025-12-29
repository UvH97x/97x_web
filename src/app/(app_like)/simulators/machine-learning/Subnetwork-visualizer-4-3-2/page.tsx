"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/** 4-3-2 ネット（出力層は常に有効） */
const INPUT = 4;   // 入力ノード数: 4
const HIDDEN = 3;  // 中間ノード数: 3
const OUTPUT = 2;  // 出力ノード数: 2

/** 有効なノードマスクの総数: (2^4-1) * (2^3-1) = 15 * 7 = 105 */
const TOTAL = 15 * 7; // id は 1..105

/**
 * id ↔ (inputMask, hiddenMask) の相互変換
 * 辞書順: id-1 = (hiddenIndex)*15 + (inputIndex)
 * - inputIndex ∈ [0,14] → 実マスクは +1..+15
 * - hiddenIndex ∈ [0,6] → 実マスクは +1..+7
 */
function idToMasks(id: number) {
  const clamped = Math.min(Math.max(id, 1), TOTAL) - 1; // 0..104 にクランプ
  const inputIndex = clamped % 15;                       // 0..14
  const hiddenIndex = Math.floor(clamped / 15);          // 0..6
  const inputMask = inputIndex + 1;                      // 1..15
  const hiddenMask = hiddenIndex + 1;                    // 1..7
  return { inputMask, hiddenMask };
}

function masksToId(inputMask: number, hiddenMask: number) {
  // 入力は1..15, 中間は1..7 を想定（範囲外はクランプ）
  const inputIndex = Math.min(Math.max(inputMask, 1), 15) - 1; // 0..14
  const hiddenIndex = Math.min(Math.max(hiddenMask, 1), 7) - 1; // 0..6
  return hiddenIndex * 15 + inputIndex + 1; // 1..105
}

/** URL クエリ ?id=.. と内部 state を同期するフック */
function useIdStateFromQuery() {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("id");

  // 初期化: URL の id を読み取り 1..TOTAL にクランプ
  const [id, setId] = useState<number>(() => {
    const n = Number(q);
    return Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 1), TOTAL) : 1;
  });

  // URL → state 反映
  useEffect(() => {
    const nq = sp.get("id");
    const n = Number(nq);
    setId(Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 1), TOTAL) : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // state → URL 反映
  const updateUrl = (next: number) => {
    const u = new URL(window.location.href);
    u.searchParams.set("id", String(next));
    router.replace(u.pathname + u.search);
  };

  // 巡回加減算（範囲外はラップアラウンド）
  const set = (next: number) => {
    const clamped = ((next - 1) % TOTAL + TOTAL) % TOTAL + 1; // 1..TOTAL に循環
    updateUrl(clamped);
  };

  return { id, setId: set };
}

/** レイヤ毎の描画座標を計算 */
function LayerPositions(width: number, height: number) {
  const padX = 80;
  const padY = 40;
  const colX = [padX, width / 2, width - padX];

  // 縦方向の等間隔配置ヘルパ
  const yPositions = (n: number) => {
    const usable = height - padY * 2;
    return Array.from({ length: n }, (_, i) => padY + (usable * (i + 1)) / (n + 1));
  };

  return {
    xIn: colX[0],
    xHid: colX[1],
    xOut: colX[2],
    yIn: yPositions(INPUT),
    yHid: yPositions(HIDDEN),
    yOut: yPositions(OUTPUT),
  };
}

/** グラフ本体: マスクで有効ノード・エッジを強調 */
function Graph({ inputMask, hiddenMask }: { inputMask: number; hiddenMask: number }) {
  const W = 800;
  const H = 500;
  const pos = LayerPositions(W, H);

  // ビットマスクから各ノードの on/off を配列化（LSB を I0/H0 に対応）
  const inOn = useMemo(
    () => Array.from({ length: INPUT }, (_, i) => ((inputMask >> i) & 1) === 1),
    [inputMask]
  );
  const hidOn = useMemo(
    () => Array.from({ length: HIDDEN }, (_, j) => ((hiddenMask >> j) & 1) === 1),
    [hiddenMask]
  );
  const outOn = Array.from({ length: OUTPUT }, () => true); // 出力は常に有効

  // ノード配列生成（描画用の座標・種類・有効フラグ）
  const nodes = [
    ...pos.yIn.map((y, i) => ({ key: `in-${i}`, x: pos.xIn, y, kind: "in" as const, idx: i, on: inOn[i] })),
    ...pos.yHid.map((y, j) => ({ key: `hid-${j}`, x: pos.xHid, y, kind: "hid" as const, idx: j, on: hidOn[j] })),
    ...pos.yOut.map((y, k) => ({ key: `out-${k}`, x: pos.xOut, y, kind: "out" as const, idx: k, on: outOn[k] })),
  ];

  // 全エッジ列挙: (in→hid), (hid→out)
  const edgesAll: { from: ["in" | "hid", number]; to: ["hid" | "out", number] }[] = [];
  for (let i = 0; i < INPUT; i++) for (let j = 0; j < HIDDEN; j++) edgesAll.push({ from: ["in", i], to: ["hid", j] });
  for (let j = 0; j < HIDDEN; j++) for (let k = 0; k < OUTPUT; k++) edgesAll.push({ from: ["hid", j], to: ["out", k] });

  // エッジの幾何と有効判定を付与
  const edgesGeom = edgesAll.map((e, idx) => {
    const [fk, fi] = e.from;
    const [tk, ti] = e.to;
    const from = fk === "in" ? { x: pos.xIn, y: pos.yIn[fi], on: inOn[fi] } : { x: pos.xHid, y: pos.yHid[fi], on: hidOn[fi] };
    const to = tk === "hid" ? { x: pos.xHid, y: pos.yHid[ti], on: hidOn[ti] } : { x: pos.xOut, y: pos.yOut[ti], on: outOn[ti] };
    const on = from.on && to.on; // 両端が on のとき強調
    return { idx, from, to, on };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="rounded-2xl shadow">
      {/* 全エッジの下地（薄線） */}
      {edgesGeom.map(({ idx, from, to }) => (
        <line
          key={`all-${idx}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          strokeWidth={1}
          strokeOpacity={0.15}
          stroke="currentColor"
        />
      ))}
      {/* 有効エッジを太線で重ね描き */}
      {edgesGeom.map(({ idx, from, to, on }) =>
        on ? (
          <line
            key={`on-${idx}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            strokeWidth={3}
            strokeOpacity={0.9}
            stroke="currentColor"
          />
        ) : null
      )}
      {/* ノード本体（on/off で不透明度切替） */}
      {nodes.map((n) => (
        <g key={n.key} opacity={n.on ? 1 : 0.15}>
          <circle cx={n.x} cy={n.y} r={14} fill="white" strokeWidth={2} stroke="currentColor" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={10} className="select-none">
            {n.kind === "in" ? `I${n.idx}` : n.kind === "hid" ? `H${n.idx}` : `O${n.idx}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** ページ本体 */
export default function Page() {
  const { id, setId } = useIdStateFromQuery();
  const { inputMask, hiddenMask } = useMemo(() => idToMasks(id), [id]);

  const step = (delta: number) => setId(id + delta);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">4-3-2 部分ネット可視化（ノード・ドロップアウト流）</h1>

      <section className="grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <label className="block text-sm">サブネット ID（1..{TOTAL}）</label>
          <input
            className="w-full border rounded-xl p-2 font-mono"
            value={String(id)}
            onChange={(e) => setId(Number(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            <div className="p-2 rounded-xl bg-gray-50">
              <div className="opacity-60">inputMask (4bit, 1..15)</div>
              <div>dec: {inputMask}</div>
              <div>bin: {inputMask.toString(2).padStart(4, "0")}</div>
            </div>
            <div className="p-2 rounded-xl bg-gray-50">
              <div className="opacity-60">hiddenMask (3bit, 1..7)</div>
              <div>dec: {hiddenMask}</div>
              <div>bin: {hiddenMask.toString(2).padStart(3, "0")}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={() => step(-1)}>prev</button>
            <button className="px-3 py-2 rounded-xl border" onClick={() => step(1)}>next</button>
            <button className="px-3 py-2 rounded-xl border" onClick={() => setId(1)}>first</button>
            <button className="px-3 py-2 rounded-xl border" onClick={() => setId(TOTAL)}>last</button>
          </div>
          <p className="text-sm opacity-70">
            マッピング: <code>id = (hiddenIndex)*15 + (inputIndex) + 1</code>。ここで{" "}
            <code>inputIndex∈[0,14]</code>、<code>hiddenIndex∈[0,6]</code>、実マスクは{" "}
            <code>inputMask=inputIndex+1</code>、<code>hiddenMask=hiddenIndex+1</code>。
          </p>
          <p className="text-sm opacity-70">URL クエリ <code>?id=&lt;1..{TOTAL}&gt;</code> で直接指定可能。</p>
        </div>
        <div>
          <Graph inputMask={inputMask} hiddenMask={hiddenMask} />
        </div>
      </section>

      <section className="text-sm opacity-70 space-y-1">
        <h2 className="text-base font-medium">仕様</h2>
        <ul className="list-disc ml-5">
          <li>ノードマスク方式。出力層は常にアクティブ。</li>
          <li>入力・中間の全滅は除外済み。総数は (16-1)×(8-1)=105。</li>
          <li>非アクティブノードは淡色表示。非アクティブ端点を含むエッジは細線のみ。</li>
        </ul>
      </section>
    </main>
  );
}
