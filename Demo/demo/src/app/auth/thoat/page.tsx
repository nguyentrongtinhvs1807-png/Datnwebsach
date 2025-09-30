"use client";
import { useRouter } from "next/navigation";
import {useEffect} from 'react';
export default function Thoat(){
    const router= useRouter();
    useEffect(()=>{
        sessionStorage.clear();
        window.dispatchEvent(new CustomEvent("login",{detail:""}));
        router.push("/");

    },[])
    return(<p>Thoat</p>)
}