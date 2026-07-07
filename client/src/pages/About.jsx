const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Cosmetics Store, your premier destination for beauty and skincare products.
              We're passionate about helping you look and feel your best.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Founded in 2024, Cosmetics Store began with a simple mission: to make premium beauty
              products accessible to everyone. What started as a small online shop has grown into
              one of Pakistan's leading beauty destinations.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We believe that beauty should be inclusive, accessible, and empowering. Our carefully
              curated collection features products from trusted brands around the world, all selected
              with quality, safety, and effectiveness in mind.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
            <ul className="text-gray-600 mb-6 list-disc pl-5 space-y-2">
              <li>100% authentic products with verified suppliers</li>
              <li>Free shipping on orders above Rs. 2000</li>
              <li>Easy returns within 14 days</li>
              <li>Expert beauty advice and recommendations</li>
              <li>Secure payment options</li>
              <li>Dedicated customer support</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-primary-700 mb-2">Authenticity</h3>
                <p className="text-primary-600 text-sm">
                  We guarantee genuine products from authorized distributors.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Quality</h3>
                <p className="text-blue-600 text-sm">
                  Every product meets our strict quality standards.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Customer First</h3>
                <p className="text-green-600 text-sm">
                  Your satisfaction is our top priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;