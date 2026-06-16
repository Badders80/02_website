export function FooterBar() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Evolution Stables. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/privacy" className="hover:text-gray-900">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gray-900">
              Terms
            </a>
            <a href="/contact" className="hover:text-gray-900">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
