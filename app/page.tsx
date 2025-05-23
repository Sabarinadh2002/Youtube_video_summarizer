"use client"

import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col
          mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full ">
      <Hero />
      <Card />
      <Footer />
      </div>
    </main>
  );
}
