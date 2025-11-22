export const convertToYMD = (d: string) => {
  const [day, month, year] = d.split("/");
  return `${year}-${month}-${day}`;
};

export function convertToDMY(date: string | Date) {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}


export function convertToLocalTime(date: string | Date) {
  const d = new Date(date);            // đang ở UTC
  const local = new Date(d.getTime() + 7 * 60 * 60 * 1000); // +7 giờ

  const hour = String(local.getHours()).padStart(2, "0");
  const minute = String(local.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}
