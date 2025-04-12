import "./FrontLayout.css";

export const metadata = {
  title: "TravelInvestGPT",
  description: "AI Chat Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='Main-Class-Back'>{children}</body>
    </html>
  );
}
