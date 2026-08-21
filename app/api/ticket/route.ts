// app/api/ticket/route.ts
import { NextResponse } from "next/server";

// Fake data: để chung trong file này luôn
const ticketList = [
  {
    id: 1,
    type: "economy",
    code: 1,
    list: [
      {
        typeTicket: "Economy Saver Max",
        price: 1448000,
        desc: [
          { text: "Hành lý xách tay: 7kg", status: true },
          { text: "Không bao gồm hành lý ký gửi", status: false },
          { text: "Không được hoàn/hủy", status: false },
          { text: "Thay đổi trước giờ khởi hành: 600.000 VND (*)", status: true },
          { text: "Không thay đổi sau giờ khởi hành (*)", status: false },
          { text: "Hệ số cộng điểm Wanderlust Club: 0.25", status: true },
          { text: "Chọn ghế ngồi mất phí", status: false },
          { text: "Không áp dụng cho go-show", status: false },
        ],
      },

      {
        typeTicket: "Economy Smart",
        price: 1577000,
        desc: [
          { text: "Hành lý xách tay: 7kg", status: true },
          { text: "Không bao gồm hành lý ký gửi", status: false },
          { text: "Hoàn/hủy trước giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 600.000 VND (*)", status: true },
          { text: "Thay đổi trước giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Thay đổi sau giờ khởi hành: 600.000 VND (*)", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 0.5", status: true },
          { text: "Chọn ghế ngồi mất phí", status: true },
          { text: "Không áp dụng cho go-show", status: false },
        ],
      },

      {
        typeTicket: "Economy Flex",
        price: 3068000,
        desc: [
          { text: "Hành lý xách tay: 7kg", status: true },
          { text: "01 kiện hành lý ký gửi 20kg", status: true },
          { text: "Hoàn/hủy trước giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Thay đổi miễn phí", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 1.00", status: true },
          { text: "Chọn ghế ngồi miễn phí", status: true },
          { text: "Đổi chuyến tại sân bay miễn phí", status: true },
        ],
      },
    ],
  },
  {
    id: 2,
    code: 1,
    type: "business",
    list: [
      {
        typeTicket: "Business Smart",
        price: 5022000,
        desc: [
          { text: "Hành lý xách tay: 2 kiện, 7kg/kiện", status: true },
          { text: "01 kiện hành lý ký gửi 40kg", status: true },
          { text: "Hoàn/hủy trước giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Thay đổi trước giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Thay đổi sau giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 1.75", status: true },
          { text: "Chọn ghế ngồi miễn phí", status: true },
          { text: "Không áp dụng cho go-show", status: false },
        ],
      },
      {
        typeTicket: "Business Flex",
        price: 7074000,
        desc: [
          { text: "Hành lý xách tay: 2 kiện, 7kg/kiện", status: true },
          { text: "01 kiện hành lý ký gửi 40kg", status: true },
          { text: "Hoàn/hủy trước giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Thay đổi miễn phí", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 2.00", status: true },
          { text: "Chọn ghế ngồi miễn phí", status: true },
          { text: "Đổi chuyến tại sân bay miễn phí", status: true },
        ],
      },
    ],
  },
  {
    id: 3,
    type: "economy",
    code: 2,
    list: [
      {
        typeTicket: "Economy Smart",
        price: 1577000,
        desc: [
          { text: "Hành lý xách tay: 7kg", status: true },
          { text: "Không bao gồm hành lý ký gửi", status: false },
          { text: "Hoàn/hủy trước giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 600.000 VND (*)", status: true },
          { text: "Thay đổi trước giờ khởi hành: 450.000 VND (*)", status: true },
          { text: "Thay đổi sau giờ khởi hành: 600.000 VND (*)", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 0.5", status: true },
          { text: "Chọn ghế ngồi mất phí", status: true },
          { text: "Không áp dụng cho go-show", status: false },
        ],
      },

      {
        typeTicket: "Economy Flex",
        price: 3068000,
        desc: [
          { text: "Hành lý xách tay: 7kg", status: true },
          { text: "01 kiện hành lý ký gửi 20kg", status: true },
          { text: "Hoàn/hủy trước giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Thay đổi miễn phí", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 1.00", status: true },
          { text: "Chọn ghế ngồi miễn phí", status: true },
          { text: "Đổi chuyến tại sân bay miễn phí", status: true },
        ],
      },
    ],
  },
  {
    id: 4,
    code: 2,
    type: "business",
    list: [
      {
        typeTicket: "Business Flex",
        price: 7074000,
        desc: [
          { text: "Hành lý xách tay: 2 kiện, 7kg/kiện", status: true },
          { text: "01 kiện hành lý ký gửi 40kg", status: true },
          { text: "Hoàn/hủy trước giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Hoàn/hủy sau giờ khởi hành: 300.000 VND (*)", status: true },
          { text: "Thay đổi miễn phí", status: true },
          { text: "Hệ số cộng điểm Wanderlust Club: 2.00", status: true },
          { text: "Chọn ghế ngồi miễn phí", status: true },
          { text: "Đổi chuyến tại sân bay miễn phí", status: true },
        ],
      },
    ],
  },
];

// API GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const codeParam = searchParams.get("code"); // vd: "1" hoặc "2"
  const type = searchParams.get("type"); // "economy" | "business"

  // Không truyền query: trả full list
  if (!codeParam && !type) {
    return NextResponse.json(ticketList);
  }

  let result = ticketList;

  // Lọc theo code nếu có
  if (codeParam) {
    const code = Number(codeParam);
    result = result.filter((item) => item.code === code);
  }

  // Lọc theo type nếu có
  if (type) {
    result = result.filter((item) => item.type === type);
  }

  if (!result.length) {
    return NextResponse.json({ error: "Không tìm thấy vé tương ứng" }, { status: 404 });
  }

  return NextResponse.json(result);
}
