import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Mail,
  MapPin,
  Users,
  Briefcase,
  Newspaper,
  FileText,
  CreditCard,
  Truck,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
  Lock,
  LayoutGrid,
  ExternalLink,
  X,
  ArrowRight,
} from "lucide-react";

const svgProps = { fill: "currentColor", viewBox: "0 0 24 24" };

function FacebookIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const SOCIALS = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/",
    Icon: FacebookIcon,
    color: "#1877F2",
    desc: "Follow us for the latest deals and community fun.",
    detail: "Like our page for daily offers, giveaways and behind-the-scenes content.",
  },
  {
    name: "Twitter",
    url: "https://x.com/",
    Icon: TwitterIcon,
    color: "#1D9BF0",
    desc: "Real-time updates and quick support on X.",
    detail: "Tweet @ShopLogo for instant support and live announcements.",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/",
    Icon: InstagramIcon,
    color: "#E4405F",
    desc: "Style inspiration, stories and product drops.",
    detail: "Browse our lookbooks, reels and daily story highlights on Instagram.",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/",
    Icon: YouTubeIcon,
    color: "#FF0000",
    desc: "Unboxings, reviews and shopping guides.",
    detail: "Watch honest product reviews and how-to guides on our channel.",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/",
    Icon: LinkedInIcon,
    color: "#0A66C2",
    desc: "Careers, updates and company insights.",
    detail: "Connect with us on LinkedIn for jobs, news and thought leadership.",
  },
];

const INFO = {
  "Contact Us": {
    icon: Mail,
    color: "bg-sky-500",
    desc: "Reach our support team 24x7 for orders, refunds or any help.",
    detail:
      "Email us at support@flipkart.store, or chat live with an agent. We typically respond within 2 hours during business hours.",
  },
  "About Us": {
    icon: Users,
    color: "bg-violet-500",
    desc: "Our journey from a small store to India's trusted marketplace.",
    detail:
      "ShopLogo started in Bengaluru in 2019 with a mission to make quality products affordable and delivered fast — to every pin code in India.",
  },
  Careers: {
    icon: Briefcase,
    color: "bg-amber-500",
    desc: "We're hiring across engineering, design, operations and more.",
    detail:
      "Join a team of 2,000+ ShopLovers. Check open roles, our culture, perks and the interview process right here.",
  },
  "Flipkart Stories": {
    icon: Newspaper,
    color: "bg-rose-500",
    desc: "Behind-the-scenes stories, launches and company news.",
    detail:
      "From product drops to our Big Shopping Days, read the stories that make ShopLogo tick.",
  },
  Press: {
    icon: Newspaper,
    color: "bg-orange-500",
    desc: "Media kits, logos, and the latest press releases.",
    detail:
      "Download brand assets and read our official announcements. For interviews, email press@flipkart.store.",
  },
  "Corporate Information": {
    icon: FileText,
    color: "bg-slate-500",
    desc: "Legal entity details and corporate governance.",
    detail:
      "ShopLogo Internet Private Limited is registered in Bengaluru, Karnataka, India. GSTIN and CIN available on request.",
  },
  Payments: {
    icon: CreditCard,
    color: "bg-emerald-500",
    desc: "UPI, cards, wallets, NetBanking and COD — all secure.",
    detail:
      "Every transaction is PCI-DSS compliant with 3D-Secure. Pay via UPI, Visa, MasterCard, RuPay, GPay, PhonePe or Cash on Delivery.",
  },
  Shipping: {
    icon: Truck,
    color: "bg-indigo-500",
    desc: "Free, fast and trackable delivery to your doorstep.",
    detail:
      "Free shipping on orders above ₹499. Standard delivery in 2–5 days; express options available at checkout.",
  },
  Returns: {
    icon: RotateCcw,
    color: "bg-teal-500",
    desc: "7-day no-questions-asked returns & instant refunds.",
    detail:
      "Changed your mind? Request a return within 7 days of delivery. Refunds are initiated within 24 hours of pickup.",
  },
  FAQ: {
    icon: HelpCircle,
    color: "bg-cyan-500",
    desc: "Quick answers to the most common questions.",
    detail:
      "Find answers about orders, payments, shipping, returns, gift cards and account management in one place.",
  },
  "Terms Of Use": {
    icon: FileText,
    color: "bg-blue-500",
    desc: "The rules and guidelines for using ShopLogo.",
    detail:
      "By using ShopLogo you agree to our terms covering orders, pricing, listings, content and liability.",
  },
  Security: {
    icon: ShieldCheck,
    color: "bg-lime-500",
    desc: "Bank-grade encryption keeps your data safe.",
    detail:
      "All data is encrypted in transit and at rest. We never store full card numbers, and every payment is tokenized.",
  },
  Privacy: {
    icon: Lock,
    color: "bg-fuchsia-500",
    desc: "Your data stays yours. Here's how we protect it.",
    detail:
      "We collect only what's needed to serve you, never sell your data, and let you export or delete it anytime.",
  },
  Sitemap: {
    icon: LayoutGrid,
    color: "bg-pink-500",
    desc: "Browse every corner of ShopLogo.",
    detail:
      "Jump to categories, brand pages, deals, gift cards, orders and support from a single index of pages.",
  },
  Myntra: {
    icon: ExternalLink,
    color: "bg-pink-600",
    desc: "Fashion and lifestyle — opens in a new tab.",
    detail:
      "Myntra is a ShopLogo group company for fashion, beauty and lifestyle products.",
    external: "https://www.myntra.com/",
  },
  Cleartrip: {
    icon: ExternalLink,
    color: "bg-amber-600",
    desc: "Flights, hotels & travel — opens in a new tab.",
    detail:
      "Cleartrip is a ShopLogo group company for flights, hotels and holiday bookings.",
    external: "https://www.cleartrip.com/",
  },
  Shopsy: {
    icon: ExternalLink,
    color: "bg-violet-600",
    desc: "Value-first shopping — opens in a new tab.",
    detail:
      "Shopsy is a ShopLogo group company for affordable value shopping.",
    external: "https://www.shopsy.in/",
  },
  Facebook: {
    icon: FacebookIcon,
    color: "bg-blue-600",
    desc: "Follow us for the latest deals and community fun.",
    detail:
      "Like our page for daily offers, giveaways and behind-the-scenes content.",
    external: "https://www.facebook.com/",
  },
  Twitter: {
    icon: TwitterIcon,
    color: "bg-sky-500",
    desc: "Real-time updates and quick support on X.",
    detail: "Tweet @ShopLogo for instant support and live announcements.",
    external: "https://x.com/",
  },
  Instagram: {
    icon: InstagramIcon,
    color: "bg-pink-600",
    desc: "Style inspiration, stories and product drops.",
    detail: "Browse our lookbooks, reels and daily story highlights on Instagram.",
    external: "https://www.instagram.com/",
  },
  YouTube: {
    icon: YouTubeIcon,
    color: "bg-red-600",
    desc: "Unboxings, reviews and shopping guides.",
    detail: "Watch honest product reviews and how-to guides on our channel.",
    external: "https://www.youtube.com/",
  },
  LinkedIn: {
    icon: LinkedInIcon,
    color: "bg-blue-700",
    desc: "Careers, updates and company insights.",
    detail: "Connect with us on LinkedIn for jobs, news and thought leadership.",
    external: "https://www.linkedin.com/",
  },
};

const EXTERNAL = {
  Myntra: "https://www.myntra.com/",
  Cleartrip: "https://www.cleartrip.com/",
  Shopsy: "https://www.shopsy.in/",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [hovered, setHovered] = useState(null);
  const [openLink, setOpenLink] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenLink(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const columns = [
    {
      title: "ABOUT",
      links: [
        "Contact Us",
        "About Us",
        "Careers",
        "Flipkart Stories",
        "Press",
        "Corporate Information",
      ],
    },
    {
      title: "GROUP COMPANIES",
      links: ["Myntra", "Cleartrip", "Shopsy"],
    },
    {
      title: "HELP",
      links: ["Payments", "Shipping", "Returns", "FAQ"],
    },
    {
      title: "POLICY",
      links: ["Terms Of Use", "Security", "Privacy", "Sitemap"],
    },
  ];

  const payments = ["VISA", "MasterCard", "RuPay", "UPI", "GPay", "PhonePe"];
  const active = openLink ? INFO[openLink] : INFO[hovered];
  const InfoIcon = INFO[openLink]?.icon;

  const openModal = (e, name) => {
    e.preventDefault();
    setOpenLink(name);
  };

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="w-[50%] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
          <div>
            <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-1.5">
              <ShoppingBag size={16} className="text-yellow-400" />
              Shop<span className="text-yellow-400">Logo</span>
            </h3>
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="flex items-center gap-1.5">
                <Mail size={11} /> support@flipkart.store
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={11} /> Bengaluru, Karnataka, India
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-2 text-[11px] uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                {col.links.map((link) =>
                  EXTERNAL[link] ? (
                    <li key={link}>
                      <a
                        href={EXTERNAL[link]}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => setHovered(link)}
                        onMouseLeave={() => setHovered(null)}
                        className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        {link}
                        <ExternalLink
                          size={11}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        />
                      </a>
                    </li>
                  ) : (
                    <li key={link}>
                      <a
                        href="#"
                        onClick={(e) => openModal(e, link)}
                        onMouseEnter={() => setHovered(link)}
                        onMouseLeave={() => setHovered(null)}
                        className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        {link}
                        <ArrowRight
                          size={11}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        />
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Social media — hover to preview, click opens brand page */}
        <div className="mt-6">
          <div className="flex items-center justify-center gap-2.5">
            {SOCIALS.map(({ name, url, Icon, color }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                style={{ "--sc": color }}
                className="social-btn group relative flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon size={14} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
                  {name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Live info panel — appears on hover, auto-refreshes */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            active ? "max-h-40 mt-5 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {active && (
            <div className="animate-fade-up rounded-xl border border-gray-700/60 bg-gray-800/70 p-4 flex items-start gap-3">
              <span
                className={`${active.color} shrink-0 rounded-lg p-2 text-white shadow-lg`}
              >
                <active.icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold">
                  {hovered || openLink}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">{active.desc}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap justify-center gap-3">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 font-semibold text-gray-300"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-gray-500">© {year} ShopLogo. All rights reserved.</p>
        </div>
      </div>

      {/* Info modal on click */}
      {openLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenLink(null)}
          />
          <div className="animate-pop-in relative w-full max-w-md rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
            <button
              onClick={() => setOpenLink(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <span
                className={`${INFO[openLink].color} rounded-xl p-2.5 text-white shadow-lg`}
              >
                <InfoIcon size={20} />
              </span>
              <h3 className="text-lg font-bold">{openLink}</h3>
            </div>
            <p className="mt-4 text-sm text-gray-600">{INFO[openLink].desc}</p>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {INFO[openLink].detail}
            </p>
            <button
              onClick={() => setOpenLink(null)}
              className="mt-6 w-full rounded-lg bg-yellow-400 py-2.5 text-sm font-semibold text-gray-900 hover:bg-yellow-300 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
