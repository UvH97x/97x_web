// page.tsx

"use client";

import { useEffect, useState } from "react";

import { GraphCanvas } from "./GraphCanvas";
import { ControlPanel } from "./ControlPanel";
import { LossDisplay } from "./LossDisplay";
import { ParameterSliders } from "./ParameterSliders";

import { generateData } from "./lib/generateData";
import { updateParameters } from "./lib/optimizer";
import { computeLoss } from "./lib/loss";
import { evaluateModel } from "./lib/modelUtils";

export default function SimulatorMain() {
  // 仮のデータ点とモデル曲線
  const [dataPoints, setDataPoints] = useState<[number, number][]>(generateData())
  const [modelCurve, setModelCurve] = useState<[number, number][]>(
    Array.from({ length: 100 }, (_, i) => {
      const x = -11 + (22 * i) / 99
      const y = x// 仮：y=xのモデル
      return [x, y]
    })
  )

  // 仮のパラメータ状態
  const [degree, setDegree] = useState<number>(1) // 多項式の次数
  const [parameters, setParameters] = useState<number[] | null>(null) // 多項式回帰のパラメータ
  const [regressionType, setRegressionType] = useState<string>("normal")  // 回帰方法
  const [currentLoss, setCurrentLoss] = useState<number>(0) // 現在の誤差関数の値
  const [lossType, setLossType] = useState<string>("mse")  // 誤差関数の種類
  const [delta, setDelta] = useState<number>(1e-2)  // ステップの大きさ（変更するスライダーは未実装）
  const [isRunning, setIsRunning] = useState<boolean>(false)  // シミュレーションが動いているかどうか

  // データ点の再生成
  const handleReset = () => {
    const newData = generateData()
    setDataPoints(newData)
  }

  // シミュレーションの進行状態切り替え
  const handleToggle = () => {
    setIsRunning((prev) => !prev)
  }

  const handleParameterChange = (index: number, value: number) => {
    const newParams = parameters ? [...parameters] : []
    newParams[index] = value
    setParameters(newParams)
  }

  // シミュレーションの1ステップ
  const simulateStep = () => {
    if (!parameters) return

    // パラメータ更新
    const newParams = updateParameters(parameters, delta, dataPoints, lossType)
    setParameters(newParams)

    // 新しい誤差計算
    const newLoss = computeLoss(dataPoints, newParams, lossType)
    setCurrentLoss(newLoss)

    // モデル曲線の再生成(x: [-11, 11]の範囲)
    const newCurve: [number, number][] = Array.from({ length: 100 }, (_, i) => {
      const x = -11 + (22 * i) / 99
      const y = evaluateModel(x, newParams)
      return [x, y]
    })
    setModelCurve(newCurve)
  }

  // Mの変更に応じてwを初期化（初期化関数を実装後変更）
  useEffect(() => {
    const newParams = Array.from({ length: degree + 1 }, () => Math.random() * 10-5)
    setParameters(newParams)

    // 曲線更新
    const newCurve: [number, number][] = Array.from({ length: 100 }, (_, i) => {
      const x = -11 + (22 * i) / 99
      const y = evaluateModel(x, newParams)
      return [x, y]
    })
    setModelCurve(newCurve)

    // 現在の誤差を更新
    const loss = computeLoss(dataPoints, newParams, lossType)
    setCurrentLoss(loss)
  }, [degree])

  // シミュレーションのループ管理
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      simulateStep()
    }, 33)// 約30fps

    return () => clearInterval(interval)
  }, [isRunning, parameters, dataPoints, delta, lossType])

  return(
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold"> 多項式回帰ビジュアライザ</h1>

      {/* グラフ表示 */}
      <GraphCanvas dataPoints={dataPoints} modelCurve={modelCurve} />

      {/* 操作パネルと誤差表示 */}
      <div className="w-full flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <ControlPanel
            degree={degree}
            onDegreeChange={setDegree}
            regressionType={regressionType}
            onRegressionChange={setRegressionType}
            lossType={lossType}
            onLossTypeChange={setLossType}
            onReset={handleReset}
            onToggle={handleToggle}
            isRunning={isRunning}
          />
        </div>

        <div className="flex-1">
          <LossDisplay
            lossType={lossType}
            currentLoss={currentLoss}
            idealLoss={0.0012}
          />
        </div>

        <div className="flex-1">
          {parameters && (
            <ParameterSliders
              parameters={parameters}
              onParameterChange={handleParameterChange}
            />
          )}
        </div>
      </div>
    </main>
  )
}

