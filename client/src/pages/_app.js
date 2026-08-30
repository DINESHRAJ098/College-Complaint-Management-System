import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { getSocket } from '../services/socket';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Warm up socket connection
    getSocket();
  }, []);

  return (
    <>
      <Head>
        <title>CampusResolve | College Complaint & Grievance Management System</title>
        <meta
          name="description"
          content="Modern AI-assisted College Complaint & Grievance Management System for students, department authorities, and college administration."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
