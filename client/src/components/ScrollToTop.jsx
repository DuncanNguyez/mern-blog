import { PiMonitorArrowUpThin } from "react-icons/pi";

export default function ScrollToTop() {
  setTimeout(() => {
    const mybutton = document.getElementById("toTop");
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        mybutton.classList.remove("hidden");
      } else {
        mybutton.classList.add("hidden");
      }
    });
  }, 500);
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
