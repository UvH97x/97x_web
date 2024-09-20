---
title: "Next.js & App Routerでのmetadata反映方法"
author: UvH
description: "Next.jsのappルーターを使い、ページごとにメタデータを設定する方法"
created_at: "2024-09-20"
updated_at: ""
tags: ["Next.js", "Metadata", "App Router", "TypeScript"]
references:
  - "Next.JS Metadata, https://nextjs.org/docs/app/building-your-application/optimizing/metadata"
---

## Next.jsのappルーターでのメタデータ設定

Next.jsのappディレクトリでページごとにmetadataを設定するためには、`metadata`オブジェクトをエクスポートする。これにより、SEOやOGタグなどのメタデータをページ単位で設定することができる。なお、Headタグによる設定は反映されない場合があり、特に最新のバージョンを採用している場合は以下の方法が確実とされる。

### メタデータ設定の基本構造

`metadata`オブジェクトを使って、ページのタイトルや説明、OGタグなどのメタデータを設定します。以下に基本的な例を示す。

```tsx
// src/app/articles/[page_title]/page.tsx

export const metadata = {
  title: "記事のタイトル",
  description: "この記事の説明です。",
  openGraph: {
    title: "記事のタイトル",
    description: "OGタグの説明です。",
    url: "https://example.com/article",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 800,
        height: 600,
        alt: "OGイメージの説明",
      },
    ],
  },
};
```

### メタデータについて

1. **`title`**: ページのタイトルを指定。ブラウザのタブや検索エンジンの結果に表示される。
2. **`description`**: ページの説明を設定。検索エンジンやSNSで表示される要約である。
3. **`openGraph`**: SNSで共有された際に表示される情報（OGタグ）を設定。例えば、FacebookやTwitterでの表示に利用される。`openGraph`プロパティには、以下のような情報を設定できる:
    - **`title`**: SNSで表示されるタイトルを指定。`title`フィールドと同じ内容にすることが多い。
    - **`description`**: SNSで表示される説明文。`description`フィールドと同様に、ページの内容を簡潔に説明する。
    - **`url`**: ページのURLを指定。
    - **`images`**: SNSで表示されるサムネイル画像を設定。`url`、`width`、`height`、`alt`などのフィールドを持つオブジェクトで構成される。

### 動的なメタデータ設定

ページごとに異なるメタデータを設定する場合は、Next.jsのgenerateMetadata関数を使って動的に設定できる。

```tsx
// src/app/articles/[page_title]/page.tsx

interface Params {
  page_title: string;  // 動的ルートパラメータ
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { page_title } = params;

  return {
    title: `${page_title} - My Blog`,
    description: `This is an article about ${page_title}`,
    openGraph: {
      title: `${page_title} - My Blog`,
      description: `OG tags for ${page_title}`,
      url: `https://example.com/articles/${page_title}`,
      images: [
        {
          url: `https://example.com/images/${page_title}.jpg`,
          width: 800,
          height: 600,
          alt: `${page_title} image`,
        },
      ],
    },
  };
}
```

このように**generateMetadata**関数を使うことで、URLパラメータやデータベースから取得した情報を元に動的にメタデータを生成することができる。
