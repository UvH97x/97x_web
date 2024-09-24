import Link from 'next/link';

interface Params {
  path: string;
  title: string;
}

// パスの各セグメントに対する日本語のタイトルを定義
const titleMap: { [key: string]: string } = {
  // 必要に応じて他のカテゴリを追加
  'articles': '記事トップ',
  'physics': '物理',
  'mechanics': '力学',
};

const Breadcrumbs: React.FC<Params> = ({ path, title }) => {
  // pathを / で区切って配列にする
  const segments = path.split('/').filter(Boolean); // 空の要素を取り除く

  // 各セグメントに対応するリンクとタイトルを生成
  const breadcrumbs = segments.map((segment, index) => {
    // pathを階層ごとに組み立てる（前の階層を考慮）
    const href = '/' + segments.slice(0, index + 1).join('/');
    // セグメント名に対応するタイトルを取得
    const linkName = titleMap[segment] || title; // マッピングがない場合はそのまま表示

    return (
      <li className="flex items-center" key={href}>
        {index !== segments.length - 1 ? (
          // 最後のセグメントでなければリンクを表示
          <>
            <Link href={href}>
              <span className="text-blue-600 hover:underline">{linkName}</span>
            </Link>
            <span className="mx-2">{'>'}</span>
          </>
        ) : (
          // 最後のセグメントはリンクではなくテキストとして表示
          <span className="text-gray-500">{linkName}</span>
        )}
      </li>
    );
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">{breadcrumbs}</ol>
    </nav>
  );
};

export default Breadcrumbs;

