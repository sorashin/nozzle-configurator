import { lazy, Suspense, useEffect, memo } from "react"
import { useModularStore } from "@/stores/modular"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom"
import ReactGA from "react-ga4"
import { useSettingsStore } from "./stores/settings"
import { useNavigationStore } from "./stores/navigation"

// NotFoundコンポーネント作成
const NotFound = () => (
  <div className="flex-1 flex items-center justify-center">Page Not Found</div>
)

// 動的インポートを静的にするためのマッピングオブジェクトを作成
const pageComponents: Record<string, any> = {
  bento3d: () =>
    import("./pages/bento3d/index").then((module) => ({
      default: module.Page,
    })),
  gridfinity: () =>
    import("./pages/gridfinity/index").then((module) => ({
      default: module.Page,
    })),
  tray: () =>
    import("./pages/tray/index").then((module) => ({
      default: module.Page,
    })),
}

// ModularInitializerコンポーネント - modularの初期化だけを担当
const ModularInitializer = memo(({ slug }: { slug?: string }) => {
  const initializeModular = useModularStore((state) => state.initializeModular)
  const loadGraph = useModularStore((state) => state.loadGraph)
  const modular = useModularStore((state) => state.modular)

  useEffect(() => {
    console.log("ModularInitializer mounted")
    initializeModular()
  }, [])

  useEffect(() => {
    if (modular && slug) {
      loadGraph(slug)
    }
  }, [modular, slug, loadGraph])

  return null
})
// GAの初期化を担当するコンポーネント
const GAInitializer = memo(({ slug }: { slug?: string }) => {
  const { setIsGAInitialized } = useSettingsStore((state) => state)
  const { currentNav } = useNavigationStore((state) => state)

  useEffect(() => {
    // Google Analytics 測定 ID を入力して設定
    ReactGA.initialize("G-J10ZQ1VRW8")
    setIsGAInitialized(true)
    ReactGA.send({
      hitType: "pageview",
      // アクセスしたパス (pathname) とクエリ文字列 (search) を送付する (必要に応じて編集する)
      page: `/${slug}/00${currentNav!}`,
    })
  }, [])
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      // アクセスしたパス (pathname) とクエリ文字列 (search) を送付する (必要に応じて編集する)
      page: `/${slug}/00${currentNav!}`,
    })
  }, [slug, currentNav])

  return null
})

// PageLoaderコンポーネント - memoを削除してslugの変更に確実に反応するように
const PageLoader = ({ slug }: { slug: string }) => {
  const PageComponent = lazy(() => {
    const loader = pageComponents[slug]
    return loader ? loader() : Promise.resolve({ default: NotFound })
  })

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center gap-1 flex-col">
          <img src="/images/loading.gif" alt="loading" className="size-24" />
          <span
            className="text-xs animate-pulse"
            style={{
              animation: "blink 1.5s infinite",
              animationTimingFunction: "steps(3, start)",
            }}>
            loading...
          </span>
          <style>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              25% { opacity: 0.3; }
              50% { opacity: 0.7; }
              75% { opacity: 0.2; }
            }
          `}</style>
        </div>
      }>
      <PageComponent />
    </Suspense>
  )
}

// GraphRendererコンポーネント - URLパラメータを取得しPageLoaderに渡す
const GraphRenderer = () => {
  const { slug } = useParams<{ slug: string }>()

  return (
    <>
      <ModularInitializer slug={slug} />
      <GAInitializer slug={slug} />
      {/* keyプロパティを追加して、slugが変わるたびにPageLoaderが再マウントされるようにする */}
      <PageLoader key={slug} slug={slug || ""} />
    </>
  )
}

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tray" replace />} />
          <Route path="/:slug" element={<GraphRenderer />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
