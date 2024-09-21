/*
  * src/app/applications/markdown-renderer-by-typst
  * .mdファイルを文章と数式・コードに分離して、別々のコンポーネントに順番にぶち込んで記事を自由に作れるようにしたいという試み。
*/
import path from "path";
import { ParsedFile, getParsedFile } from "@/src/lib/customParser";

export default function Page() {
  // まずは.mdファイルを読み込んで、metaデータ以外をstringで抽出
  const articlePath: string = path.join(process.cwd(), 'src/data/articles', `sample.md`);
  const articleData: ParsedFile = getParsedFile(articlePath);
  const articleContent: string = articleData.content;

  // articleContentを整形
  // 

  return (
    <>
      <p>a</p>
      <p>{articleContent}</p>
    </>
  );
}