"use client";
import Link from "next/link";
import Post from "./post/post";

export default async function Home() {
  // const res = await fetch(`https://...`)
  // const data = await res.json()
 
  // if (!res.ok) {
  //   return 'There was an error.'
  // }

  return (
    <>
      <h1>Hello Nguyễn Trọng Tín</h1>
      <div>
        {/* <Link href={'/products'}>Product</Link> <br/>
        <Link href={'/policy'}>Policy</Link> <br/>
        <Link href={'/ui'}>Signup</Link> */}
        <Post/>
      </div>
    </>
  );
}
