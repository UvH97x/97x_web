// src/app/applications/test/page.tsx
// [ ]: articlesやtagテーブル、contents管理もデータベースへ移行し、apiから通信できるようにする。
// [ ]: genreやarticlesのデフォルトの表示順を決められるようにする

"use client";  // クライアントサイドで動作させるためのディレクティブ
import { useState } from "react";

export default function TestPage() {
  // フォームの入力状態
  const [oldTitle, setOldTitle] = useState("");
  const [title, setTitle] = useState("");
  const [oldGenre, setOldGenre] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  // POSTリクエストでデータを送信
  const handlePost = async () => {
    const response = await fetch("/api/communication-with-supabase/genres", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: title,
        genre: genre,
        description: description,
      }),
    });

    const data = await response.json();
    console.log("POST Response: ", data.data);
    setFetchedData(data.data);
  };

  // GETリクエストでgenresのデータを取得
  const handleGet = async () => {
    const response = await fetch("/api/communication-with-supabase/genres");
    const data = await response.json();
    console.log("GET Response:", data);
    setFetchedData(data.data);
  };

  // DELETEリクエストでoldName, oldGenre一致のものを削除
  const handleDelete = async () => {
    if (!checkOldInputs()) return;
    const response = await fetch("/api/communication-with-supabase/genres", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: oldTitle,
        genre: oldGenre
      }),
    });

    const data = await response.json();
    console.log("DELETE Response: ", data);
  }

  // PUTリクエストでoldName, oldGenre一致のものを更新
  const handleUpdate = async () => {
    if (!checkOldInputs()) return;
    const response = await fetch("/api/communication-with-supabase/genres", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldName: oldTitle,
        oldGenre: oldGenre,
        newName: title,
        newGenre: genre,
        newDescription: description
      }),
    });

    const data = await response.json();
    console.log("DELETE Response: ", data);
  }

  // oldデータの入力チェック
  const checkOldInputs = () => {
    if (!oldTitle || !oldGenre) {
      alert("Old Title と Old Genre を入力してください");
      return false;
    }
    return true;
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Genre Test Page</h1>

      {/* フォーム入力 */}
      <div className="mb-4">
        <label className="block mb-2">
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block mb-2">
          Genre:
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block mb-2">
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block mb-2">
          Old Title:
          <input
            type="text"
            value={oldTitle}
            onChange={(e) => setOldTitle(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block mb-2">
          Old Genre:
          <input
            type="text"
            value={oldGenre}
            onChange={(e) => setOldGenre(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

      <div className="flex flex-row gap-2">
        <button
          onClick={handlePost}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          POST Data
        </button>

        <button
          onClick={handleGet}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          GET Data
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        >
          DELETE Data
        </button>

        <button
          onClick={handleUpdate}
          className="bg-amber-500 text-white px-4 py-2 rounded mb-4"
        >
          UPDATE Data
        </button>
      </div>
      
      </div>

      {/* Responseデータ表示 */}
      <div className="mb-4">

        {fetchedData?.length > 0 && (
          <ul>
            {fetchedData.map((item) => (
              <li key={item.id} className="border p-2 mb-2">
                <strong>{item.name}</strong> - {item.genre}: {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
