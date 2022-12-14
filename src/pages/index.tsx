import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Spinner from "../components/shared/Spinner";
import { NextSeo } from 'next-seo';

const Home: NextPage = () => {


  const serverTypes = ['Unturned', 'Rust', 'GMod', 'Minecraft'];

  const [serverType, updateServerType] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      updateServerType(s => {
        if (s === serverTypes.length - 1) {
          return 0
        }
        else {
          return s + 1
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);


  return (
    <>

      <NextSeo
        title="Home | Plugins"
      />
      <div>
        {/* Hero card */}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://cdn.cloudflare.steamstatic.com/steam/apps/304930/ss_2754a9cdb632e6ed242799e073711fe6306a4245.jpg"
                alt="People working on laptops"
              />
              <div className="absolute inset-0 bg-neutral-700 mix-blend-multiply" />
            </div>
            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-white">Plugins for your</span>
                <span className="block text-blue-700">{serverTypes[serverType]} Server</span>
              </h1>
            </div>
          </div>
        </div>
        {/*  */}
      </div>

    </>
  );
};

export default Home;
