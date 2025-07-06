import "./FrontLayout.css";
import SessionWrapper from './SessionWrapper.js'


export const metadata = {
  title: "TravelInvestGPT",
  description: "AI Chat Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='Main-Class-Back'><SessionWrapper>{children}</SessionWrapper></body>
    </html>
  );
}
