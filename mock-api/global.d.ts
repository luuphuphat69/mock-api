// types/global.d.ts
export {}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: "light" | "dark"
          size?: "normal" | "compact"
          callback?: (token: string) => void
        }
      ) => string
      reset?: (widgetId?: string) => void
    }
  }
}