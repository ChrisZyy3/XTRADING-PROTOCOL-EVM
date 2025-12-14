"use client";

import type { NextPage } from "next";
import { Ecological } from "~~/components/landing/Ecological";
import { Hero } from "~~/components/landing/Hero";
import { Footer, PartnerApp } from "~~/components/landing/PartnerApp";
import { PresaleNode } from "~~/components/landing/PresaleNode";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <PresaleNode />
      <Ecological />
      <PartnerApp />
      <Footer />
    </div>
  );
};

export default Home;
