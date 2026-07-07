const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Cosmetics Store. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li className="text-gray-700">Name and contact details (email, phone number, address)</li>
                <li className="text-gray-700">Payment information (processed securely through payment gateways)</li>
                <li className="text-gray-700">Account credentials (if you create an account)</li>
                <li className="text-gray-700">Order history and preferences</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">IP address and browser type</li>
                <li className="text-gray-700">Device information</li>
                <li className="text-gray-700">Cookies and usage data</li>
                <li className="text-gray-700">Pages visited and time spent on site</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Order Processing</h4>
                  <p className="text-gray-600 text-sm">
                    To process and deliver your orders, send order confirmations, and provide customer support.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Personalization</h4>
                  <p className="text-gray-600 text-sm">
                    To personalize your shopping experience and recommend products you might like.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Communication</h4>
                  <p className="text-gray-600 text-sm">
                    To send you updates about your orders, respond to inquiries, and send marketing communications (with consent).
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Improvement</h4>
                  <p className="text-gray-600 text-sm">
                    To improve our website, products, and services based on how you use our platform.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">SSL encryption for all data transmissions</li>
                <li className="text-gray-700">Secure payment gateways (Stripe, JazzCash, Easypaisa)</li>
                <li className="text-gray-700">Regular security audits and updates</li>
                <li className="text-gray-700">Limited access to personal data for authorized personnel only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Access your personal data</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Correct inaccurate data</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Request data deletion</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Opt-out of marketing</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Data portability</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded mr-3">✓</div>
                    <span className="text-gray-700">Withdraw consent</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li className="text-gray-700">Remember your preferences and shopping cart</li>
                <li className="text-gray-700">Understand how you use our site</li>
                <li className="text-gray-700">Provide personalized content</li>
                <li className="text-gray-700">Improve website performance</li>
              </ul>
              <p className="text-gray-700">
                You can control cookies through your browser settings. However, disabling cookies may affect your experience on our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We may share your information with trusted third parties who assist us in operating our website, 
                conducting our business, or serving you, so long as they agree to keep this information confidential.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Payment Processors</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Secure payment processing</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Payment information, order details</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Shipping Partners</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Order delivery</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Name, address, phone number</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Analytics Services</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Website improvement</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Usage data, cookies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                Our website is not intended for children under 16 years of age. We do not knowingly collect personal 
                information from children under 16. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the 
                new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@cosmeticsstore.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +92 300 1234567
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> DHA Phase 5, Karachi, Pakistan
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;