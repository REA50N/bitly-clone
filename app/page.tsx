"use client"


import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <div className="flex ">
      <h1>hello</h1>
    </div>
    <div>
    <button className="border:6px" onClick={()=>signIn("google")}>Sign in With Google</button>
    </div>
    </>
  );
}
