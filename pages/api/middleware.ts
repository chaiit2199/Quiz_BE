// // middleware.ts
// import { NextRequest, NextResponse } from 'next/server';

// // Cấu hình CORS
// export async function middleware(req: NextRequest) {
//   const origin = req.headers.get('origin');

//   // Kiểm tra nếu yêu cầu đến từ đúng nguồn (origin)
//   if (origin !== 'http://localhost:3002') {
//     // Trả về lỗi 403 nếu không phải từ localhost:3002
//     return new NextResponse('Forbidden', { status: 403 });
//   }

//   // Tiếp tục xử lý yêu cầu nếu origin hợp lệ
//   const res = NextResponse.next();

//   // Thêm CORS header vào phản hồi
//   res.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
//   res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.headers.set('Access-Control-Allow-Headers', 'Content-Type');

//   return res;
// }

// // Định nghĩa matcher để áp dụng middleware cho các API route
// export const config = {
//   matcher: ['/api/:path*'],
// };
