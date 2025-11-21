export const convertToYMD = (d: string) => {
    const [day, month, year] = d.split("/");
    return `${year}/${month}/${day}`;
  };