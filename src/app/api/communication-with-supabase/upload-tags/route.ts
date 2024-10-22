import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';  // Supabaseクライアントのインポート

export async function POST(req: Request) {
  try {
    // リクエストボディからslugを受け取る
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ message: 'Missing slug' }, { status: 400 });
    }

    // slugから記事のデータを取得
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, tags')  // 必要なフィールドだけを取得
      .eq('slug', slug)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ message: `Error fetching article or no article found for ${slug}` }, { status: 500 });
    }

    const { id: articleId, tags } = article;

    // 各タグを処理
    for (const tagName of tags) {
      // タグが既に存在するか確認
      let { data: existingTag, error: tagFetchError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single();

      // タグが存在しない場合は新しく挿入
      if (tagFetchError || !existingTag) {
        const { data: newTag, error: tagInsertError } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select()
          .single();

        if (tagInsertError) continue;

        existingTag = newTag;
      }

      const tagId = existingTag?.id;

      // article_tagsテーブルに挿入
      await supabase
        .from('article_tags')
        .insert({
          article_id: articleId,
          tag_id: tagId
        });
    }

    return NextResponse.json({ message: 'Tags processed successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error during tag processing' }, { status: 500 });
  }
}
