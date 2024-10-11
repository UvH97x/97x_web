// src/app/api/test-connection-to-supabase/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';


// GETリクエスト
export async function GET() {
  // Supabaseのデータベースに存在するテーブルを取得してみる
  const { data, error } = await supabase.from('articles').select('*');

  if (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ message: 'Database connection failed', error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Database connection successful', data }, { status: 200 });
}


// POSTリクエスト
export async function POST(request: Request) {
  const body = await request.json();

  const { fileName, isDirectory, title, description, author, tags, references } = body;

  // Supabaseにデータを挿入する
  const { data, error } = await supabase.from('articles').insert([
    {
      fileName,
      isDirectory,
      title,
      description,
      author,
      tags,
      references,
      created_at: new Date(), // 現在の日時を設定
      updated_at: new Date(), // 現在の日時を設定
    },
  ]);

  if (error) {
    console.error('Error adding article:', error);
    return NextResponse.json({ message: 'Failed to add article', error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Article added successfully', data }, { status: 200 });
}


// DELETEリクエスト
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id'); // URLパラメータからIDを取得

  if (!id) {
    return NextResponse.json({ message: 'ID is required to delete an article' }, { status: 400 });
  }

  // Supabaseから特定のIDの記事を削除
  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ message: 'Failed to delete article', error }, { status: 500 });
  }

  return NextResponse.json({ message: `Article with ID ${id} deleted successfully` }, { status: 200 });
}


// PUTリクエスト
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, fileName, isDirectory, title, description, author, tags, references } = body;

  if (!id) {
    return NextResponse.json({ message: 'ID is required to update an article' }, { status: 400 });
  }

  // Supabaseで記事のデータを更新
  const { data, error } = await supabase
    .from('articles')
    .update({ fileName, isDirectory, title, description, author, tags, references, updated_at: new Date() })
    .eq('id', id);

  if (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ message: 'Failed to update article', error }, { status: 500 });
  }

  return NextResponse.json({ message: `Article with ID ${id} updated successfully`, data }, { status: 200 });
}
