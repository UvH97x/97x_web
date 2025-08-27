// page.tsx

"use client";

import { useEffect, useState } from "react";

import { GraphCanvas } from "./GraphCanvas";
import { ControlPanel } from "./ControlPanel";
import { LossDisplay } from "./LossDisplay";
import { ParameterSliders } from "./ParameterSliders";

import { generateData } from "./lib/generateData";
import { updateParameters } from "./lib/optimizer";
import { computeTotalLoss } from "./lib/loss";
import { evaluateModel } from "./lib/modelUtils";

export default function PageMain() {
  const [dataPoints, setDataPoints] = useState<[number, number][]>(generateData())
  const [modelCurve, setModelCurve] = useState<[number, number][]>(
    Array.from({ length: 100 }, (_, i) => {
      const x = -6 + (12 * i) / 99
      const y = x// 仮：y=xのモデル
      return [x, y]
    })
  )
  const [degree, setDegree] = useState<number>(1) // 多項式の次数
  const [parameters, setParameters] = useState<number[] | null>(null) // 多項式回帰のパラメータ
  const [regType, setRegType] = useState<string>("normal")  // 回帰方法
  const [currentLoss, setCurrentLoss] = useState<number>(0) // 現在の誤差関数の値
  const [lossType, setLossType] = useState<string>("mse")  // 誤差関数の種類
  const [delta, setDelta] = useState<number>(0.1)  // ステップの大きさ（変更するスライダーは未実装）
  const [isRunning, setIsRunning] = useState<boolean>(false)  // シミュレーションが動いているかどうか
  const [lambda, setLambda] = useState<number>(0.1) // 正則化項の重み

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

  // Mの変更に応じてwを初期化（初期化関数を実装後変更）
  useEffect(() => {
    const newParams = Array.from({ length: degree + 1 }, () => Math.random() * 10-5)
    setParameters(newParams)

    // 曲線更新
    const newCurve: [number, number][] = Array.from({ length: 100 }, (_, i) => {
      const x = -6 + (12 * i) / 99
      const y = evaluateModel(x, newParams)
      return [x, y]
    })
    setModelCurve(newCurve)

    // 現在の誤差を更新
    const loss = computeTotalLoss(dataPoints, newParams, lossType, regType, lambda)
    setCurrentLoss(loss)
  }, [degree])

  // Parametersの変更に応じてグラフを更新
  useEffect(() => {
    if (!parameters) return
    const newCurve: [number, number][] = Array.from({ length: 100 }, (_, i) => {
      const x = -6 + (12 * i) / 99
      const y = evaluateModel(x, parameters)
      return [x, y]
    })
    setCurrentLoss(computeTotalLoss(dataPoints, parameters, lossType, regType, lambda))
    setModelCurve(newCurve)
  }, [parameters])

  // シミュレーションの1ステップ
  const simulateStep = () => {
    if (!parameters) return

    // パラメータ更新
    const newParams = updateParameters(parameters, delta, dataPoints, lossType, regType, lambda)
    setParameters(newParams)

    // 新しい誤差計算
    const newLoss = computeTotalLoss(dataPoints, newParams, lossType, regType, lambda)
    setCurrentLoss(newLoss)

    // モデル曲線の再生成(x: [-11, 11]の範囲)
    const newCurve: [number, number][] = Array.from({ length: 100 }, (_, i) => {
      const x = -6 + (12 * i) / 99
      const y = evaluateModel(x, newParams)
      return [x, y]
    })
    setModelCurve(newCurve)
  }

  // シミュレーションのループ管理
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      simulateStep()
    }, 33)// 約30fps

    return () => clearInterval(interval)
  }, [isRunning, parameters, dataPoints, delta, lossType])

  return(
    <main className="p-4 space-y-2">
      <span className="text-2xl font-bold"> 多項式回帰</span>
      <span className="px-2 text-xl font-semibold">- 未学習・過学習・正則化を見たい -</span>

      {/* グラフ表示 */}
      <GraphCanvas dataPoints={dataPoints} modelCurve={modelCurve} />

      {/* 操作パネルと誤差表示 */}
      <div className="w-full flex md:flex-row gap-6">
        <div className="flex-1">
          <ControlPanel
            degree={degree}
            onDegreeChange={setDegree}
            regType={regType}
            onRegChange={setRegType}
            lossType={lossType}
            onLossTypeChange={setLossType}
            delta={delta}
            onDeltaChange={setDelta}
            lambda={lambda}
            onLambdaChange={setLambda}
            onReset={handleReset}
            onToggle={handleToggle}
            isRunning={isRunning}
          />
        </div>

        <div className="flex-1">
          {parameters && (
            <ParameterSliders
              parameters={parameters}
              onParameterChange={handleParameterChange}
              delta={delta}
            />
          )}
        </div>

        <div className="flex-1">
          {parameters && 
          (<LossDisplay
            currentLoss={currentLoss}
            degree={degree}
            regType={regType}
            lossType={lossType}
          />)
          }
          
        </div>
      </div>
    </main>
  )
}

