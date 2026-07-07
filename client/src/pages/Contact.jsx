import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { SiTiktok } from 'react-icons/si';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  // Replace these with your EmailJS credentials
  const EMAILJS_SERVICE_ID = 'service_msz3srq'; // Get from EmailJS dashboard
  const EMAILJS_TEMPLATE_ID = 'template_pdjvz1l'; // Get from EmailJS dashboard
  const EMAILJS_PUBLIC_KEY = 'X-eQZUioHuL8ihsHf'; // Get from EmailJS dashboard

  // Initialize EmailJS with your public key
  emailjs.init(EMAILJS_PUBLIC_KEY);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject,
        message: formData.message,
        to_email: 'hamzaxdevelopers1223@gmail.com', // Your email address
        date: new Date().toLocaleString(),
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (result.status === 200) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Send email via your own backend (more secure)
  const handleSubmitViaBackend = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Call your backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'hamzaxdevelopers1223@gmail.com', // Your email
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: ['+92 3214203402', '+923086585333'],
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: ['hamzaxdevelopers1223@gmail.com', 'jhaji1223@gmail.com'],
      color: 'text-red-600 bg-red-50',
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Address',
      details: ['Urdu Bazaar Near Goga Fabrics, Kasur', 'Punjab Pakistan'],
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: <FaClock />,
      title: 'Business Hours',
      details: ['Monday - Friday: 9AM - 10PM', 'Saturday - Sunday: 10AM - 8PM'],
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const subjects = [
    'Order Inquiry',
    'Product Information',
    'Shipping & Delivery',
    'Returns & Refunds',
    'Account Issues',
    'Wholesale Inquiry',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help! Whether you have questions about products, orders, 
            or just want to say hello, we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`p-3 rounded-xl mr-4 ${info.color}`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-10 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://tiktok.com/@manibhai_00" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"
                  >
                    <SiTiktok size={20} />
                  </a>
                  <a 
                    href="https://www.instagram.com/manibhai_000?igsh=dW13M2UzdnR6ajFn" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200"
                  >
                    <FaInstagram size={20} />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-blue-100 text-blue-400 rounded-xl hover:bg-blue-200"
                  >
                    <FaTwitter size={20} />
                  </a>
                  <a 
                    href="https://wa.me/923214203402" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200"
                  >
                    <FaWhatsapp size={20} />
                  </a>
                </div>
              </div>

              {/* WhatsApp Direct */}
              <div className="mt-8">
                <a
                  href="https://wa.me/923086585333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold"
                >
                  <FaWhatsapp />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} id="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0300 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    * Required fields
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'How long does shipping take?',
                    a: 'Standard shipping takes 3-7 business days. Express shipping is available for major cities.',
                  },
                  {
                    q: 'What is your return policy?',
                    a: 'We offer a 14-day return policy for unopened and unused products in original packaging.',
                  },
                  {
                    q: 'Do you ship internationally?',
                    a: 'Currently, we only ship within Pakistan. We plan to expand internationally soon.',
                  },
                  {
                    q: 'Are your products authentic?',
                    a: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors.',
                  },
                ].map((faq, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
  <div className="grid grid-cols-1 md:grid-cols-3">
    <div className="md:col-span-2">
      {/* Interactive map placeholder with link */}
      <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 relative group cursor-pointer">
        <a
          href="https://www.google.com/maps/search/?api=1&query=Urdu+Bazaar+Near+Goga+Fabrics,+Kasur,+Punjab+Pakistan"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
          <div className="text-6xl mb-4 transition-transform group-hover:scale-110">📍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Location</h3>
          <p className="text-gray-600">Click to view on Google Maps</p>
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <p className="text-gray-800 font-medium">Urdu Bazaar Near Goga Fabrics</p>
            <p className="text-gray-600">Kasur, Punjab Pakistan</p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
            <span>View on Google Maps</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </a>
      </div>
    </div>
    <div className="p-8">
      <h3 className="text-xl font-bold mb-4">Visit Our Store</h3>
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="text-gray-500 mr-3 mt-1">📍</div>
          <div>
            <p className="font-medium text-gray-900">Address</p>
            <p className="text-gray-600">Urdu Bazaar Near Goga Fabrics, Kasur, Punjab Pakistan</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="text-gray-500 mr-3 mt-1">🕐</div>
          <div>
            <p className="font-medium text-gray-900">Hours</p>
            <p className="text-gray-600">10AM - 10PM (Mon-Sun)</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="text-gray-500 mr-3 mt-1">⭐</div>
          <div>
            <p className="font-medium text-gray-900">Facilities</p>
            <p className="text-gray-600">Expert consultation, Full Customization Live!</p>
          </div>
        </div>
      </div>
      
      {/* Get Directions Button */}
      <a
        href="https://www.google.com/maps/dir/?api=1&destination=Urdu+Bazaar+Near+Goga+Fabrics,+Kasur,+Punjab,+Pakistan"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        Get Directions
      </a>
      
      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href={`https://maps.apple.com/?q=${encodeURIComponent('Urdu Bazaar Near Goga Fabrics, Kasur, Punjab Pakistan')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-center text-sm flex items-center justify-center gap-1"
        >
          <span>🍏</span>
          Apple Maps
        </a>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Urdu+Bazaar+Near+Goga+Fabrics,+Kasur,+Punjab+Pakistan"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg text-center text-sm flex items-center justify-center gap-1"
        >
          <span>G</span>
          Google Maps
        </a>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default Contact;