// resizeImage.js — Nén & thu nhỏ ảnh phía client trước khi lưu base64.
// Mục đích: tránh ảnh quá lớn làm document MongoDB vượt giới hạn 16MB (gây lỗi 500)
// và giúp tải trang nhẹ hơn. Giữ PNG cho ảnh có nền trong suốt (logo), còn lại dùng JPEG.

// format: 'png' (giữ nền trong suốt — dùng cho logo) | 'jpeg' (nhẹ — dùng cho ảnh/photo)
//         | mặc định 'auto' = theo định dạng tệp gốc.
export function resizeImage(file, { maxDim = 1280, quality = 0.82, format = "auto" } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Không phải tệp ảnh hợp lệ."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được tệp."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Ảnh không hợp lệ."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const usePng =
          format === "png" || (format === "auto" && file.type === "image/png");
        resolve(canvas.toDataURL(usePng ? "image/png" : "image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
