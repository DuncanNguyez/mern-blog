import { useSelector } from "react-redux";

export default function ThemeProvider({ children }: any) {
  const { theme } = useSelector((state: any) => state.theme);
  return (
    <div className={theme}>
      <div className="bg-gray-100 text-gray-700 dark:text-gray-200 dark:bg-[rgb(23,30,48)] min-h-screen">
        {children}
      </div>
    </div>
  );
}
