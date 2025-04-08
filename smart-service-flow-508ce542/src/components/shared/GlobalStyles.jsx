import React from 'react';

// This component injects global styles into the app via a style tag
export default function GlobalStyles() {
  return (
    <style jsx global>{`
      /* Base */
      :root {
        --background: 0 0% 100%;
        --foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96.1%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 47.4% 11.2%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 47.4% 11.2%;
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --primary: 221.2 83.2% 53.3%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96.1%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --accent: 210 40% 96.1%;
        --accent-foreground: 222.2 47.4% 11.2%;
        --destructive: 0 100% 50%;
        --destructive-foreground: 210 40% 98%;
        --ring: 215 20.2% 65.1%;
        --radius: 0.5rem;
      }

      .dark {
        --background: 224 71% 4%;
        --foreground: 213 31% 91%;
        --muted: 223 47% 11%;
        --muted-foreground: 215.4 16.3% 56.9%;
        --popover: 224 71% 4%;
        --popover-foreground: 215 20.2% 65.1%;
        --card: 224 71% 4%;
        --card-foreground: 213 31% 91%;
        --border: 216 34% 17%;
        --input: 216 34% 17%;
        --primary: 210 40% 98%;
        --primary-foreground: 222.2 47.4% 1.2%;
        --secondary: 222.2 47.4% 11.2%;
        --secondary-foreground: 210 40% 98%;
        --accent: 216 34% 17%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 63% 31%;
        --destructive-foreground: 210 40% 98%;
        --ring: 216 34% 17%;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: rgb(249, 250, 251);
        color: rgb(17, 24, 39);
      }

      /* General Layout */
      .container {
        width: 100%;
        margin-right: auto;
        margin-left: auto;
        padding-right: 1rem;
        padding-left: 1rem;
      }
      @media (min-width: 640px) {
        .container {
          max-width: 640px;
        }
      }
      @media (min-width: 768px) {
        .container {
          max-width: 768px;
        }
      }
      @media (min-width: 1024px) {
        .container {
          max-width: 1024px;
        }
      }
      @media (min-width: 1280px) {
        .container {
          max-width: 1280px;
        }
      }
    `}</style>
  );
}