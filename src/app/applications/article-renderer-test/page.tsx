import UvHArticleRenderer from "@/src/components/for_articles/UvHArticleRenderer";

function Page() {
  // テスト用の文字列
  const inputString = `
  これは通常のテキストです。
  $$数式のalt
    x &= r sin theta cos phi \\
    y &= r sin theta sin phi \\
    z &= r cos theta 
  $$
  <<<折り畳みコンテンツ
  折りたたまれたテキストです。
  \`\`\`ts
  console.log("Hello, World!");\`\`\`
  >>>
  表の説明[[[表のalt
    Col 1, Col 2, Col 3
    A1, B1, C1
    A2, B2, C2
    A3, B3, C3
  ]]]
`;
  return (
    <div>
      <UvHArticleRenderer articleContent={inputString} fileName="testPage" />
    </div>
  )
}

export default Page;