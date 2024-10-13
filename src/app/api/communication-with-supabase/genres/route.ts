// src/app/api/communication-with-supabase/genres/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";


export async function GET() {
  // genresテーブルからすべてのデータを取得
  const { data, error } = await supabase
    .from("genres")
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "fetching data successful", data }, { status: 200 });
}


export async function POST(req: Request) {
  const { name, description, genre } = await req.json();

  // データを挿入
  const { data, error } = await supabase
    .from("genres")
    .insert([{ name, description, genre }]);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Genre added successfully", data }, { status: 200 });
}


export async function DELETE(req: Request) {
  const { name, genre } = await req.json();

  // DELETE操作: nameとgenreが一致するデータを削除
  const { data, error } = await supabase
    .from("genres")
    .delete()
    .match({ name, genre });

  if (error) {
    return NextResponse.json({ error: error.message }, {status: 500});
  }

  return NextResponse.json({ message: "Genre deleted successfully", data }, { status: 200 });
}


export async function PUT(req: Request) {
  const { oldName, oldGenre, newName, newGenre, newDescription } = await req.json();

  // PUT操作: oldNameとoldGenreが一致するデータを更新
  const { data, error } = await supabase
    .from("genres")
    .update({ name: newName, genre: newGenre, description: newDescription })
    .match({ name: oldName, genre: oldGenre });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Genre updated successfully", data }, { status : 200 });
}