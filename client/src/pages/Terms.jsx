const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">
            Effective Date: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-yellow-800">
                <strong>Important:</strong> By accessing and using Cosmetics Store, you accept and agree to be bound by these 
                Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the Cosmetics Store website (the "Service"), you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">You must be at least 16 years old to create an account</li>
                <li className="text-gray-700">You are responsible for maintaining the confidentiality of your account credentials</li>
                <li className="text-gray-700">You agree to provide accurate and complete information</li>
                <li className="text-gray-700">You are responsible for all activities under your account</li>
                <li className="text-gray-700">We reserve the right to terminate accounts that violate our terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Products and Pricing</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Product Information</h3>
                  <p className="text-gray-600">
                    We strive to display accurate product information, including descriptions, images, and prices. 
                    However, we cannot guarantee that all information is completely accurate or error-free.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <p className="text-gray-600">
                    All prices are in Pakistani Rupees (PKR). We reserve the right to change prices at any time without notice.
                    In case of pricing errors, we reserve the right to cancel orders placed at incorrect prices.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <p className="text-gray-600">
                    All products are subject to availability. If a product becomes unavailable after you place an order, 
                    we will notify you and provide a refund or alternative options.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Payment</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processing Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Cash on Delivery</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Immediate</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Available for orders below Rs. 10,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">JazzCash</td>
                      <td className="px-4 py-3 text-sm text-gray-700">2-24 hours</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Send proof of payment to payments@cosmeticsstore.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Easypaisa</td>
                      <td className="px-4 py-3 text-sm text-gray-700">2-24 hours</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Send proof of payment to payments@cosmeticsstore.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Bank Transfer</td>
                      <td className="px-4 py-3 text-sm text-gray-700">24-48 hours</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Order processed after confirmation from bank</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Shipping and Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">Shipping Areas</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Karachi: 3-5 business days</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Lahore/Islamabad: 1-3 business days</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Other Major Cities: 4-7 business days</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span>Remote Areas: 7-14 business days</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">Shipping Costs</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Standard Shipping</span>
                      <span className="font-semibold text-emerald-600">Confirmed on WhatsApp</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Express Shipping</span>
                      <span className="font-semibold text-emerald-600">Confirmed on WhatsApp</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Same-day Delivery </span>
                      <span className="font-semibold text-emerald-600">Confirmed on WhatsApp</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-4xl mb-3">14</div>
                    <h4 className="font-semibold">Day Return Policy</h4>
                    <p className="text-sm text-gray-600">From delivery date</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-3">100%</div>
                    <h4 className="font-semibold">Refund Guarantee</h4>
                    <p className="text-sm text-gray-600">For unopened products</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-3">7</div>
                    <h4 className="font-semibold">Day Processing</h4>
                    <p className="text-sm text-gray-600">For refund requests</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h5 className="font-semibold mb-2">Return Conditions:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Products must be unopened and unused</li>
                    <li>• Original packaging must be intact</li>
                    <li>• Proof of purchase required</li>
                    <li>• Return shipping costs may apply</li>
                    <li>• Perishable items cannot be returned</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on this website, including but not limited to text, graphics, logos, images, and software, 
                is the property of Cosmetics Store or its content suppliers and is protected by intellectual property laws.
              </p>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">
                  <strong>Restriction:</strong> You may not reproduce, distribute, modify, or create derivative works 
                  from any content on this website without our express written permission.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="text-red-500 mr-3">✗</div>
                  <span className="text-gray-700">Use the website for illegal purposes</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="text-red-500 mr-3">✗</div>
                  <span className="text-gray-700">Upload viruses or malicious code</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="text-red-500 mr-3">✗</div>
                  <span className="text-gray-700">Attempt to gain unauthorized access</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="text-red-500 mr-3">✗</div>
                  <span className="text-gray-700">Harass other users or staff</span>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Cosmetics Store shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including but not limited to loss of profits, data, or use, arising from your use of the Service.
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Maximum Liability:</strong> Our maximum liability to you for any claim shall not exceed 
                  the amount you paid for the products or services giving rise to the claim.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of Pakistan. 
                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Karachi, Pakistan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms and Conditions at any time. We will notify you of significant 
                changes by posting the updated terms on our website. Your continued use of the Service after such changes 
                constitutes your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  For any questions regarding these Terms and Conditions, please contact us:
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p className="text-gray-600">hamzaxdevelopers1223@gmail.com</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p className="text-gray-600">+92 321 4203402</p>
                  </div>
                  <div>
                    <p className="font-semibold">Address:</p>
                    <p className="text-gray-600">Urdu Bazaar Near Goga Fabrics Kasur, Pakistan</p>
                  </div>
                  <div>
                    <p className="font-semibold">Business Hours:</p>
                    <p className="text-gray-600">11:00 AM - 10:00 PM (PST)</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;