/**
 * Test accounts seeded by `seed-full-database.ts` in backend.
 * MUST stay in sync with the mappings defined there.
 *
 * Convention: email = `{role_lowercase}@flightbooking.com`
 * Password (dev only): `Password123!`
 *
 * Mapping (roleCode -> email):
 *   CUSTOMER             -> customer@flightbooking.com
 *   TRAVEL_AGENT         -> travel_agent@flightbooking.com
 *   SCHEDULE_PLANNER     -> schedule_planner@flightbooking.com
 *   REVENUE_ANALYST      -> revenue_analyst@flightbooking.com
 *   ANCILLARY_MANAGER    -> ancillary_manager@flightbooking.com
 *   CALL_CENTER          -> call_center@flightbooking.com
 *   ADMIN                -> admin@flightbooking.com
 *   ACCOUNTING_STAFF     -> accounting_staff@flightbooking.com
 *   DISTRIBUTION_MANAGER -> distribution_manager@flightbooking.com
 *   FRAUD_ANALYST        -> fraud_analyst@flightbooking.com
 */
export interface TestAccount {
  role: string;
  roleName: string;
  email: string;
  password: string;
}

export const TEST_PASSWORD = "Password123!";

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    role: "CUSTOMER",
    roleName: "Khách hàng",
    email: "customer@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "TRAVEL_AGENT",
    roleName: "Đại lý Du lịch",
    email: "travel_agent@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "SCHEDULE_PLANNER",
    roleName: "Quản lý Lịch bay",
    email: "schedule_planner@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "REVENUE_ANALYST",
    roleName: "Quản lý Giá vé & Doanh thu",
    email: "revenue_analyst@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "ANCILLARY_MANAGER",
    roleName: "Quản lý Dịch vụ Phụ trợ",
    email: "ancillary_manager@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "CALL_CENTER",
    roleName: "Nhân viên Hỗ trợ/Đặt chỗ",
    email: "call_center@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "ADMIN",
    roleName: "Quản trị viên Hệ thống",
    email: "admin@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "ACCOUNTING_STAFF",
    roleName: "Chuyên viên Kế toán/Tài chính",
    email: "accounting_staff@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "DISTRIBUTION_MANAGER",
    roleName: "Quản lý Kênh Phân phối",
    email: "distribution_manager@flightbooking.com",
    password: TEST_PASSWORD,
  },
  {
    role: "FRAUD_ANALYST",
    roleName: "Phân tích An ninh & Gian lận",
    email: "fraud_analyst@flightbooking.com",
    password: TEST_PASSWORD,
  },
];
