import { NextResponse } from 'next/server';
import path from 'path';
import { ParsedFile, getParsedFile } from '@/src/lib/customParser';
import { supabase } from '@/src/lib/supabaseClient';  // Supabaseクライアントのインポート

// POSTリクエストを受け取る
export async function POST(req: Request) {
  try {
    // リクエストボディからgenreとslugを受け取る
    const body = await req.json();
    const { genre, slug } = body;

    if (!genre || !slug) {
      return NextResponse.json({ message: 'Missing genre or slug' }, { status: 400 });
    }

    // 正しいパスを生成する
    const articlePath = path.join(process.cwd(), 'src/data/articles', genre, `${slug}.md`);
    console.log(`Looking for file at: ${articlePath}`);

    // 記事のデータを取得
    const articleData: ParsedFile = getParsedFile(articlePath);

    // まずslugからarticle_idを取得
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();  // slugはユニークなので1件だけ取得

    if (fetchError) {
      console.error(`Error fetching article_id for ${slug}:`, fetchError);
      return NextResponse.json({ message: `Error fetching article_id for ${slug}` }, { status: 500 });
    }

    const articleId = article?.id;

    // article_contentsに本文を挿入
    const { error: insertError } = await supabase
      .from('article_contents')
      .insert({
        article_id: articleId,  // 取得したarticle_idを使用
        content: articleData.content  // ParsedFileから本文を挿入
      });

    if (insertError) {
      console.error(`Error inserting content for ${slug}:`, insertError);
      return NextResponse.json({ message: `Error inserting content for ${slug}` }, { status: 500 });
    }

    console.log(`Content for ${slug} inserted successfully.`);
    return NextResponse.json({ message: `Content for ${slug} uploaded successfully` });
  } catch (error) {
    console.error('Error during content upload:', error);
    return NextResponse.json({ message: 'Error during content upload' }, { status: 500 });
  }
}
