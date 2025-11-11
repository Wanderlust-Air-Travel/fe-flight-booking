// app/api/banner/route.ts
import { NextResponse } from 'next/server';

const bannerHomeApi = {
  title:"Wellcome to Bamboo",
  name: "banner-home",
  url: "/banner.png",
};

export async function GET() {
  return NextResponse.json(bannerHomeApi);
}
