// app/api/banner/route.ts
import { NextResponse } from 'next/server';

const tripList = [
  {
    icon: "Hawaiian Airlines", 
    startTime: "7:00 AM",
    airline: "Hawaiian Airlines",
    duration: "16h 45m",
    price: "$624",
    stopCount: 1,
    stopDuration: "2h 45m in HNL",
  },
  {
    icon: "Japan Airlines", 
    startTime: "7:35 AM",
    airline: "Japan Airlines",
    duration: "18h 22m",
    price: "$663",
    stopCount: 1,
    stopDuration: "50m in HKG",
  },
  {
    icon: "Hawaiian Airlines", 
    startTime: "8:20 AM",
    airline: "Hawaiian Airlines",
    duration: "18h 04m",
    price: "$690",
    stopCount: 1,
    stopDuration: "1h 50m in PVG",
  },
  {
    icon: "Delta", 
    startTime: "9:47 AM",
    airline: "Delta",
    duration: "18h 52m",
    price: "$756",
    stopCount: 1,
    stopDuration: "4h 05m in ICN",
  },
  {
    icon: "Hawaiian Airlines", 
    startTime: "11:15 AM",
    airline: "Hawaiian Airlines",
    duration: "16h 05m",
    price: "$837",
    stopCount: 0,
    stopDuration: "Nonstop",
  },
  {
    icon: "Delta", 
    startTime: "10:55 AM",
    airline: "Delta",
    duration: "15h 45m",
    price: "$839",
    stopCount: 0,
    stopDuration: "Nonstop",
  },
];




export async function GET() {
  return NextResponse.json(tripList);
}
