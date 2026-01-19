import { Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer
      className="w-full py-6"
      style={{ backgroundColor: "#fbf9ef", borderTop: "2px solid #3c0212" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center ">
          {/* Left Side - Powered By */}
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Powered by{" "}
            <a
              href="https://virtualxcellence.com/"
              target="_blank"
              className="font-bold hover:underline transition-colors"
              style={{ color: "#3c0212" }}
              rel="noreferrer"
            >
              Virtual Xcellence
            </a>
            {" "}© {new Date().getFullYear()}
          </p>

         
        </div>
      </div>
    </footer>
  );
}
