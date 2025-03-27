import "../styles/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import SessionProvider from "../providers/SessionProvider";
import { getServerSession } from "next-auth";
import SnackbarProvider from "../providers/SnackbarProvider";
import { authOptions } from "../lib/authOptions";

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <head>
        {/* <link rel="icon" href="" id="provider-favicon" /> */}
        <meta httpEquiv="cache-control" content="no-cache" />
        <meta httpEquiv="expires" content="0" />
        <meta httpEquiv="pragma" content="no-cache" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          // @ts-ignore
          crossOrigin="true"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <SessionProvider session={session}>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
};

export default RootLayout;
