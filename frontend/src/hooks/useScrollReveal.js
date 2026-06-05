import { useEffect } from "react";

/**
 * Thêm class `.visible` cho mọi phần tử `.reveal` khi chúng cuộn vào khung nhìn,
 * kích hoạt hiệu ứng fade/slide định nghĩa trong variables.css.
 * Dùng MutationObserver để bắt cả nội dung tải bất đồng bộ (tin tức, video).
 */
export default function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target); // chỉ chạy một lần
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const observeAll = () =>
      document
        .querySelectorAll(".reveal:not(.visible)")
        .forEach((el) => io.observe(el));

    observeAll();

    // Nội dung động (news/videos) gắn thêm `.reveal` sau khi fetch xong.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
