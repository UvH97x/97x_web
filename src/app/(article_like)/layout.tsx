import { SiteFooter } from '@/src/app/_components/SiteFooter'

export default function ArticleLikeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main" className="flex-1">
        <div className="mx-8 sm:mx-10 py-8 sm:py-10">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
