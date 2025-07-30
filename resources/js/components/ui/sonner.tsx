import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  // Using light theme by default for government website design
  const theme = "light"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "#333333",
          "--normal-border": "#e5e7eb",
          "--success-bg": "#22c55e", // Success color
          "--success-text": "white",
          "--success-border": "#22c55e",
          "--error-bg": "#ef4444", // Error color
          "--error-text": "white",
          "--error-border": "#ef4444",
          "zIndex": 99999,
        } as React.CSSProperties
      }
      position="top-right"
      richColors
      {...props}
    />
  )
}

export { Toaster }
