import { useState } from 'react';
import { FaSearch, FaShippingFast, FaCreditCard, FaUndo, FaQuestionCircle, FaTag, FaUser, FaBox } from 'react-icons/fa';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: '❓' },
    { id: 'shipping', name: 'Shipping & Delivery', icon: '🚚' },
    { id: 'orders', name: 'Orders & Payments', icon: '💰' },
    { id: 'returns', name: 'Returns & Refunds', icon: '🔄' },
    { id: 'products', name: 'Products', icon: '💄' },
    { id: 'account', name: 'Account', icon: '👤' },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-7 business days within Pakistan. Express shipping is available for major cities with delivery in 1-2 business days. International shipping times vary by destination.',
      category: 'shipping',
    },
    {
      id: 2,
      question: 'Do you offer free shipping?',
      answer: 'Yes! We offer free shipping on all orders above Rs. 2,000 within Pakistan. For orders below Rs. 2,000, shipping charges are Rs. 200.',
      category: 'shipping',
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD), JazzCash, Easypaisa, Bank Transfer, and major credit/debit cards. All payments are processed securely.',
      category: 'orders',
    },
    {
      id: 4,
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order on our website using the "Track Order" feature.',
      category: 'orders',
    },
    {
      id: 5,
      question: 'What is your return policy?',
      answer: 'We offer a 14-day return policy for unopened and unused products in their original packaging. Some items like perishable goods or opened products cannot be returned for hygiene reasons.',
      category: 'returns',
    },
    {
      id: 6,
      question: 'How long do refunds take?',
      answer: 'Refunds are processed within 7-10 business days after we receive the returned items. The time it takes for the refund to reflect in your account depends on your payment method.',
      category: 'returns',
    },
    {
      id: 7,
      question: 'Are your products authentic?',
      answer: 'Yes! All our products are 100% authentic and sourced directly from authorized distributors and brands. We guarantee the quality and authenticity of every product we sell.',
      category: 'products',
    },
    {
      id: 8,
      question: 'Do you sell expired products?',
      answer: 'Absolutely not! We strictly check expiration dates and never sell products that are close to expiry. Most products have at least 12-24 months of shelf life remaining.',
      category: 'products',
    },
    {
      id: 9,
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" in the top navigation bar, fill in your details, and verify your email address. You can also checkout as a guest without creating an account.',
      category: 'account',
    },
    {
      id: 10,
      question: 'I forgot my password. What should I do?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address, and we will send you a password reset link. Follow the instructions in the email to reset your password.',
      category: 'account',
    },
    {
      id: 11,
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Pakistan. We are working on expanding our services internationally and will announce it on our website and social media.',
      category: 'shipping',
    },
    {
      id: 12,
      question: 'Can I change or cancel my order?',
      answer: 'You can change or cancel your order within 1 hour of placing it, provided it hasn\'t been processed for shipping yet. Contact our customer support immediately for assistance.',
      category: 'orders',
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    (activeCategory === 'all' || faq.category === activeCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const quickLinks = [
    {
      title: 'Track Your Order',
      description: 'Check delivery status',
      icon: <FaShippingFast />,
      link: '/track-order',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Payment Options',
      description: 'View payment methods',
      icon: <FaCreditCard />,
      link: '/checkout',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Return Policy',
      description: 'Learn about returns',
      icon: <FaUndo />,
      link: '/returns',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Contact Support',
      description: 'Get help instantly',
      icon: <FaQuestionCircle />,
      link: '/contact',
      color: 'from-red-500 to-red-600',
    },
  ];

  const stats = [
    { number: '24/7', label: 'Customer Support', icon: '⏰' },
    { number: '14', label: 'Day Returns', icon: '📦' },
    { number: '100%', label: 'Authentic Products', icon: '✅' },
    { number: '2,000+', label: 'Free Shipping Threshold', icon: '🚚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find quick answers to common questions about shopping, shipping, returns, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full px-6 py-4 pl-14 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg shadow-lg"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center p-4 rounded-xl transition-all ${
                      activeCategory === category.id
                        ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-10 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                <div className="space-y-4">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.link}
                      className={`block bg-gradient-to-r ${link.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{link.icon}</div>
                        <div>
                          <div className="font-semibold">{link.title}</div>
                          <div className="text-sm opacity-90">{link.description}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory === 'all' ? 'All Questions' : 
                   categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <span className="text-gray-600">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
                </span>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    Try a different search term or browse the categories
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50"
                      >
                        <div className="flex items-start">
                          <div className="mr-4 text-primary-500 mt-1">
                            <FaQuestionCircle />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{faq.question}</h3>
                            <div className="mt-1">
                              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {categories.find(c => c.id === faq.category)?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 ml-4">
                          {openItems[faq.id] ? '−' : '+'}
                        </div>
                      </button>
                      
                      {openItems[faq.id] && (
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          <div className="pl-10">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Questions */}
              <div className="mt-12 pt-10 border-t">
                <h3 className="text-xl font-bold mb-6">Popular Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {faqs.slice(0, 6).map((faq) => (
                    <a
                      key={faq.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveCategory(faq.category);
                        setOpenItems({ [faq.id]: true });
                        document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="mr-3 text-primary-500">
                          <FaQuestionCircle />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {faq.answer.substring(0, 80)}...
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Still Need Help Section */}
            <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our customer support team is here to help you 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-primary-600 hover:bg-gray-100 py-3 px-8 rounded-xl font-semibold"
                  >
                    Contact Support
                  </a>
                  <a
                    href="tel:+923001234567"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 py-3 px-8 rounded-xl font-semibold"
                  >
                    Call Now: +92 300 1234567
                  </a>
                </div>
                <p className="mt-6 text-primary-200">
                  Average response time: <strong>15 minutes</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;