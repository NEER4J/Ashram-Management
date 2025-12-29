export function Footer() {
  return (
    <footer
      className="w-full py-4 text-center"
      style={{ backgroundColor: "#fbf9ef", borderTop: "2px solid #3c0212" }}
    >
      <p className="text-sm text-gray-600">
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
    </footer>
  );
}
