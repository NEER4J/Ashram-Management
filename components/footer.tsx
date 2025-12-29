import { Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer
      className="w-full py-6"
      style={{ backgroundColor: "#fbf9ef", borderTop: "2px solid #3c0212" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

          {/* Right Side - Social Media Icons */}
          <div className="flex items-center gap-3">
            <a 
              href="https://www.facebook.com/riteshwarji.dasanudas.9/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border-2"
              style={{ 
                borderColor: "#3c0212",
                backgroundColor: "transparent"
              }}
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" style={{ color: "#3c0212" }} />
            </a>
            <a 
              href="https://www.instagram.com/sadgurushririteshwar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border-2"
              style={{ 
                borderColor: "#3c0212",
                backgroundColor: "transparent"
              }}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" style={{ color: "#3c0212" }} />
            </a>
            <a 
              href="https://www.youtube.com/channel/UCMxl7IWKuTNQIYnmBksXfUA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border-2"
              style={{ 
                borderColor: "#3c0212",
                backgroundColor: "transparent"
              }}
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" style={{ color: "#3c0212" }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
