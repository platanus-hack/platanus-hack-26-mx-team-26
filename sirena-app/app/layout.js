import Script from "next/script";
import "./design-system/styles.css";
import "./sirena/app.css";

export const metadata = {
  title: "ViShield · Consola",
  description:
    "ViShield — plataforma de concientización contra vishing: simulaciones éticas de phishing de voz para fortalecer la resiliencia de tu equipo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>
        <Script id="sirena-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('vishield-theme');if(t&&t!=='dark')document.documentElement.dataset.theme=t;}catch(e){}`}
        </Script>
        <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
