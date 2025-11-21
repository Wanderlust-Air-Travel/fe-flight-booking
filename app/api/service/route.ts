// app/api/banner/route.ts
import { NextResponse } from 'next/server';

const itemServiceApi = [
  {
    image: "/s1.jpg", 
    title: "Tp. Hồ Chí Minh (SGN) đến Hà Nội (HAN)",
    link: "/service/1",  
    startDate: "02/03/2026",  // Start Date cho s1.jpg
    endDate: "", // End Date cho s1.jpg
    service: "Dịch vụ bay thẳng",
    price: "962,000 VND"
  },
  {
    image: "/s2.jpg", 
    title: "Tp. Hồ Chí Minh (SGN) đến Quy Nhơn (UIH)",
    link: "/service/2",  
    startDate: "25/12/2026",  // Start Date cho s2.jpg
    endDate: "", // End Date cho s2.jpg
    service: "Dịch vụ bay thẳng",
    price: "962,000 VND"
  },
  {
    image: "/s3.jpg", 
    title: "Hà Nội (HAN) đến Tp. Hồ Chí Minh (SGN)",
    link: "/service/3",  
    startDate: "10/02/2026",  // Start Date cho s3.jpg
    endDate: "", // End Date cho s3.jpg
    service: "Dịch vụ bay thẳng",
    price: "692,000 VND"
  },
  {
    image: "/s4.jpg", 
    title: "Tp. Hồ Chí Minh (SGN) đến Thanh Hóa (THD)",
    link: "/service/4",  
    startDate: "17/12/2025",  // Start Date cho s4.jpg
    endDate: "", // End Date cho s4.jpg
    service: "Dịch vụ bay thẳng",
    price: "692,000 VND"
  },
  {
    image: "/s5.jpg", 
    title: "Tp. Hồ Chí Minh (SGN) đến Hà Nội (HAN)",
    link: "/service/5",  
    startDate: "18/11/2025",  // Start Date cho s5.jpg
    endDate: "", // End Date cho s5.jpg
    service: "Dịch vụ bay thẳng",
    price: "5,222,000 VND"
  },
  {
    image: "/s6.jpg", 
    title: "Hà Nội (HAN) đến Đà Nẵng (DAD)",
    link: "/service/6",  
    startDate: "06/02/2026",  // Start Date cho s6.jpg
    endDate: "", // End Date cho s6.jpg
    service: "Dịch vụ bay thẳng",
    price: "931,000 VND"
  },
  {
    image: "/s7.jpg", 
    title: "Đà Nẵng (DAD) đến Tp. Hồ Chí Minh (SGN)",
    link: "/service/7",  
    startDate: "14/02/2026",  // Start Date cho s7.jpg
    endDate: "", // End Date cho s7.jpg
    service: "Dịch vụ bay thẳng",
    price: "788,000 VND"
  },
  {
    image: "/s8.jpg", 
    title: "Tp. Hồ Chí Minh (SGN) đến Đà Lạt (DLI)",
    link: "/service/8",  
    startDate: "06/02/2026",  // Start Date cho s8.jpg
    endDate: "", // End Date cho s8.jpg
    service: "Dịch vụ bay thẳng",
    price: "931,000 VND"
  },
  {
    image: "/s9.jpg", 
    title: "Hà Nội (HAN) đến Đà Nẵng (DAD)",
    link: "/service/9",  
    startDate: "14/02/2026",  // Start Date cho s9.jpg
    endDate: "", // End Date cho s9.jpg
    service: "Dịch vụ bay thẳng",
    price: "788,000 VND"
  },
  {
    image: "/s10.jpg", 
    title: "Đà Nẵng (DAD) đến Tp. Hồ Chí Minh (SGN)",
    link: "/service/10",  
    startDate: "18/12/2025",  // Start Date cho s10.jpg
    endDate: "", // End Date cho s10.jpg
    service: "Dịch vụ bay thẳng",
    price: "750,000 VND"
  }
];



export async function GET() {
  return NextResponse.json(itemServiceApi);
}
