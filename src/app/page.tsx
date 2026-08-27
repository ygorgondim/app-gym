"use client";
import dynamic from "next/dynamic";
import { PulseApp } from "@/components/pulse-app";
const WorkoutMap = dynamic(() => import("@/components/workout-map"), { ssr: false });
export default function Home() { return <PulseApp WorkoutMap={WorkoutMap} />; }
