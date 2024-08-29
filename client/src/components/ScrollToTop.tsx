import { useEffect } from "react";
import { PiMonitorArrowUpThin } from "react-icons/pi";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  // Automatically scrolls to top whenever pathname changes
  useEffect(() => {
    const hash = location.hash;
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          window.scrollTo({
            top:
              element.getBoundingClientRect().top + window.scrollY - (66 + 4),
            behavior: "smooth",
          });
        }
      }, 2000);
    }
  }, [pathname]);

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
