import { openSans } from '@/fonts';
import generatePageMetadata from '@/lib/utils/seo';
import { ArrowUpRight, Star } from 'lucide-react';

export const metadata = generatePageMetadata({
  title: "Home",
  description:
    "Techno Traders is a private trading education and community platform where members learn, discuss, and grow together. Access expert-led content, engage in a global forum, and collaborate with traders in real time.",
  image: "/og-home.jpg",
  url: "/",
  schemaType: "WebPage",
});

const Page = () => {
  return (
    <div className={`${openSans.className} relative min-h-screen w-full bg-[#05080a] text-white overflow-hidden font-sans`}>
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Glow */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #1a2b2b 0%, transparent 70%)' }}
        />
        {/* Center/Bottom Green Glow */}
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-full opacity-10 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #00ff9d 0%, transparent 70%)' }}
        />
        {/* Bottom Subtle Green Line/Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[200px] opacity-30 blur-[80px]"
          style={{ background: 'linear-gradient(to top, #00ff9d 0%, transparent 100%)' }}
        />
      </div>

      {/* Navigation */}
      <nav
        className={`${openSans.className}
    sticky top-0 z-50
    mx-auto w-full
    flex items-center justify-center gap-8
    px-10 py-4
    text-md font-semibold text-gray-300
    h-22
    backdrop-blur-xl
    border-b-2 border-gray-700/30
    bg-black/20
    text-gray-500
    shadow-[0_8px_30px_rgba(0,0,0,0.35)]
    `}>
        <a href="#" className="text-gray-400 hover:text-gray-400 transition-colors">
          About
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors">
          Courses
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors">
          How it works
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors">
          Testimonials
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors">
          FAQ
        </a>
      </nav>


      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 max-w-5xl mx-auto mt-10">
        <h1 className={`${openSans.className} text-6xl md:text-8xl font-sans font-semibold tracking-tight leading-[1.1] mb-7`}>
          Trading with<br />
          Option Mathematics
        </h1>

        <p className="text-gray-500 text-lg max-w-2xl mb-12 leading-relaxed font-semibold">
          Techno Traders teaches you Stock Marketing Trading with the help of Option Mathematics.
          Learn with the help of our own TT Calculator.
        </p>

        {/* CTA Button */}
        <button className="group relative flex items-center gap-2 bg-[#00ff9d] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#00e68e] transition-all duration-300 shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.5)]">
          Get started now
          <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {/* Trust Section */}
        <div className="mt-20 flex flex-col items-center gap-3">
          <span className="text-gray-500 text-sm uppercase tracking-widest">They trust us</span>
          <div className="flex items-center flex-col gap-1">
            <div className="flex items-center gap-3">
              {[...Array(5)].map((_, i) => (
                <div className="p-1 border rounded-full border-white/20 bg-white/10" key={i}>
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;