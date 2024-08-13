import { useEffect } from "react";
import { PiMonitorArrowUpThin } from "react-icons/pi";

export default function ScrollToTop() {
  useEffect(() => {
    setTimeout(() => {
      const toTopBtn = document.getElementById("toTop");
      if (!toTopBtn) return;
      window.onscroll = () => {
        if (
          document.body.scrollTop > 20 ||
          document.documentElement.scrollTop > 20
        ) {
          toTopBtn.classList.remove("hidden");
        } else {
          toTopBtn.classList.add("hidden");
        }
      };
    }, 500);
  }, []);
  return (
    <div
      id="toTop"
      onClick={() => window.scrollTo({ top: 0 })}
      className="fixed bottom-3 right-5 cursor-pointer opacity-50 "
    >
      <PiMonitorArrowUpThin className="size-8" />
    </div>
  );
}
