import { IBM_Plex_Sans, Inter } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// export const fontSerif = Playfair_Display({
//   subsets: ["latin"],
//   variable: "--font-serif",
// });

// export const fontSerif = Open_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-serif",
// });

// export const fontSerif = Nunito_Sans({
//   subsets: ["latin"],
//   weight: ["400", "600", "700"],
//   variable: "--font-serif",
// });


export const fontSerif = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});


