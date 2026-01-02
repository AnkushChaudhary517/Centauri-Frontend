export function Footer() {
  return (
    <footer className="footer bg-white border-t border-gray-200 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
  <div className="h-6 bg-white rounded flex items-center justify-center overflow-hidden">
    <img
      src="/assets/vectors/footer-logo.png"
      alt="Centauri logo"
      className="w-full h-full object-contain"
    />
  </div>
</div>


          {/* Copyright */}
          <p className="text-sm text-gray-600 text-center sm:text-right">
            Copyright © 2025 Centauri. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
