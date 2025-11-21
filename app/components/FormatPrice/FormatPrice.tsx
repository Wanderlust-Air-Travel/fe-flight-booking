const FormatPrice = (value:number) =>{
    if (value == null) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
}

export default FormatPrice