import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-12">
          <div className="text-9xl md:text-[200px] font-bold text-gray-800 opacity-10">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">404</div>
            <div className="flex items-center justify-center text-red-500 mb-2">
              <FaExclamationTriangle className="mr-3 text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold">Page Not Found</h1>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Oops! The page you're looking for doesn't exist.
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            It seems you've ventured into uncharted territory. The page may have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Helpful Suggestions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Here are some helpful links:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              to="/"
              className="group p-6 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all border-2 border-transparent hover:border-primary-200"
            >
              <div className="flex flex-col items-center">
                <div className="p-4 bg-primary-100 text-primary-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <FaHome className="text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Home Page</h4>
                <p className="text-sm text-gray-600">Return to our homepage</p>
              </div>
            </Link>

            <Link
              to="/shop"
              className="group p-6 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <FaShoppingBag className="text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Shop</h4>
                <p className="text-sm text-gray-600">Browse our products</p>
              </div>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="group p-6 bg-gray-50 hover:bg-green-50 rounded-xl transition-all border-2 border-transparent hover:border-green-200"
            >
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <FaSearch className="text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Go Back</h4>
                <p className="text-sm text-gray-600">Return to previous page</p>
              </div>
            </button>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">Or try searching for what you need:</p>
            <div className="relative">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full px-6 py-4 pl-14 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.target.value;
                    if (query.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(query)}`);
                    }
                  }
                }}
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
              <p className="text-primary-100">
                Can't find what you're looking for? Our support team is here to help!
              </p>
            </div>
            <div className="space-x-4">
              <Link
                to="/contact"
                className="inline-block bg-white text-primary-600 hover:bg-gray-100 py-3 px-6 rounded-xl font-semibold"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@cosmeticsstore.com"
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-primary-600 py-3 px-6 rounded-xl font-semibold"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>

        {/* Fun Illustration */}
        <div className="mt-12">
          <div className="text-6xl mb-4">💄✨</div>
          <p className="text-gray-500">
            Don't worry, even the best beauty routines sometimes need a little adjustment!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;