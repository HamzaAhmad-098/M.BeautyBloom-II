import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Reveal from '../components/common/Reveal';

const categories = [
  { icon: '💐', name: 'Rose Bouquets', category: 'rose-bouquets' },
  { icon: '💵', name: 'Money Bouquets', category: 'money-bouquets' },
  { icon: '🍰', name: 'Cake Bouquets', category: 'cake-bouquets' },
  { icon: '🍫', name: 'Chocolate Boxes', category: 'chocolate-boxes' },
  { icon: '🧸', name: 'Teddy & Plush', category: 'teddy-plush' },
  { icon: '👜', name: 'Gift Bags', category: 'gift-bags' },
  { icon: '📖', name: 'Nikkah Booklets', category: 'nikkah-booklets' },
  { icon: '🎁', name: 'Eid & Occasion Boxes', category: 'eid-boxes' },
];

const features = [
  { icon: '🎀', title: 'Handmade with Love', desc: 'Every bouquet & box crafted by hand, just for you' },
  { icon: '🚴', title: 'Fast Local Delivery', desc: 'Same-day delivery across the city' },
  { icon: '💬', title: 'Order on WhatsApp', desc: 'Chat with us directly to customize your gift' },
];

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const whatsappUrl = `https://wa.me/923214203402?text=${encodeURIComponent('Hi! I want to order a gift from Mani Gift Center 🎁')}`;

  return (
    <div className="min-h-screen bg-[#fdf9ec] animate-fade-in overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-ink-900 via-ink-800 to-emerald-600 text-white py-16 sm:py-28 overflow-hidden">
        <div className="gift-blob w-72 h-72 bg-primary-400 top-[-40px] left-[-40px]" />
        <div className="gift-blob w-96 h-96 bg-emerald-500 bottom-[-60px] right-[-60px]" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block glass-gold text-primary-800 font-semibold text-xs sm:text-sm tracking-wide px-4 py-1.5 rounded-full mb-5 animate-fade-in">
            🎁 Handcrafted Gifts &middot; Made With Love
          </span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-5 hero-title-reveal">
            <span className="text-gold-gradient shimmer-text">M.BeautyBloom</span>
            <br />
            <span className="text-xl sm:text-3xl font-medium text-white/90">Mani Gift Center</span>
          </h1>
          <p className="text-base sm:text-xl mb-8 sm:mb-10 max-w-xl mx-auto text-white/80 px-2">
            Money bouquets, rose bouquets, cake bouquets, chocolate boxes & personalized gifts — crafted by hand for every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/shop"
              className="clay-btn inline-block text-ink-900 font-bold text-base sm:text-lg px-8 py-4 mobile-tap-target"
            >
              Explore Gifts
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 glass text-white font-semibold text-base sm:text-lg px-7 py-4 rounded-full hover:bg-white/20 transition-all duration-300 mobile-tap-target"
            >
              <svg viewBox="0 0 32 32" width="22" height="22" fill="#25D366"><path d="M16.004 3C9.375 3 4 8.373 4 15c0 2.34.65 4.53 1.78 6.4L4 29l7.78-1.75A11.9 11.9 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3z"/></svg>
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal as="h2" className="font-display text-2xl sm:text-4xl font-bold text-center mb-10 sm:mb-14 text-ink-800">
            Why Gift With Us?
          </Reveal>
          <Reveal grid className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="clay p-8 text-center hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="text-4xl mb-4 animate-float">{feature.icon}</div>
                <h3 className="font-display text-xl font-bold mb-2 text-ink-800">{feature.title}</h3>
                <p className="text-ink-400">{feature.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Categories */}
      <div className="py-14 sm:py-20 bg-gradient-to-b from-primary-50 to-white px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal as="h2" className="font-display text-2xl sm:text-4xl font-bold text-center mb-3 text-ink-800">
            Shop by Category
          </Reveal>
          <Reveal as="p" delay={80} className="text-center text-ink-400 mb-10 sm:mb-14">Handpicked gifts for every relationship & occasion</Reveal>
          <Reveal grid className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.category}
                to={`/shop?category=${cat.category}`}
                className="glass-gold rounded-3xl p-5 sm:p-7 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 active:scale-95 mobile-tap-target"
              >
                <div className="text-3xl sm:text-4xl mb-2">{cat.icon}</div>
                <h3 className="font-semibold text-sm sm:text-base text-ink-800">{cat.name}</h3>
              </Link>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal as="h2" className="font-display text-2xl sm:text-4xl font-bold text-center mb-10 sm:mb-14 text-ink-800">
            What Our Customers Say
          </Reveal>
          <Reveal grid className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { text: "The money bouquet I ordered for my sister's eidi was stunning — better than the pictures!", author: 'Ayesha K.' },
              { text: 'Nikkah booklet was so personalized and beautifully made. Everyone at the wedding loved it.', author: 'Hamna R.' },
              { text: 'Ordered a cake bouquet last minute via WhatsApp and they delivered same day. Amazing service!', author: 'Bilal S.' },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="clay p-7 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <span className="text-primary-500 text-xl">★★★★★</span>
                </div>
                <p className="text-ink-700 mb-4 text-sm sm:text-base italic">"{testimonial.text}"</p>
                <p className="font-bold text-ink-900">- {testimonial.author}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* WhatsApp CTA Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-ink-900 text-white py-14 sm:py-16 px-4 overflow-hidden">
        <div className="gift-blob w-80 h-80 bg-primary-400 top-[-50px] right-[10%]" />
        <Reveal type="zoom" className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            Have Something Special in Mind?
          </h2>
          <p className="mb-8 text-white/80">
            Message us on WhatsApp for custom gift requests, bulk orders, or same-day delivery.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="clay-btn inline-flex items-center gap-2 text-ink-900 font-bold px-8 py-4 mobile-tap-target"
          >
            <svg viewBox="0 0 32 32" width="22" height="22" fill="#128C4A"><path d="M16.004 3C9.375 3 4 8.373 4 15c0 2.34.65 4.53 1.78 6.4L4 29l7.78-1.75A11.9 11.9 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3z"/></svg>
            Chat With Us Now
          </a>
        </Reveal>
      </div>
    </div>
  );
};

export default Home;
