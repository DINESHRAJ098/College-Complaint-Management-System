import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Agentflow AI - Agentic Automation Platform</title>
        <meta name="description" content="AI-powered workflow automation platform with multi-agent orchestration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-dark-bg text-gray-200">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
