// SiteFooter.tsx
// 常時表示のフッター(薄く・簡潔に)
// モバイルで場所をとりすぎないよう注意

export function SiteFooter(){
  return(
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-2 text-sm text-gray-500">
        @ {new Date().getFullYear()} 97x - <a className="underline" href="https://github.com/UvH97x" target="_blank">GitHub</a>
      </div>
    </footer>
  )
}