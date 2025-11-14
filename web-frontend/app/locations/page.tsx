import Link from 'next/link';
import Image from 'next/image';
import { Patrick_Hand } from 'next/font/google';
import { StateSelector } from './state-selector';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function LocationsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Title */}
        <h1 className={`${hand.className} text-center text-4xl sm:text-5xl text-slate-900`}>
          Buy Wholesale Merchandise by Location
        </h1>
        <p className={`${hand.className} mt-2 text-center text-lg text-slate-700`}>
          Find Liquidation Pallets and Truckloads across multiple categories
        </p>

        {/* Marketplace pill */}
        <div className="mt-4 flex justify-center">
          <Link
            href="/suppliers"
            className={`${hand.className} inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-4 py-2 text-white text-sm shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 transition hover:-translate-y-[1px]`}
          >
            Marketplace
          </Link>
        </div>

        {/* FLAT MAP */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-full max-w-5xl">
            <Image
              src="/map.jpg"
              alt="USA Map"
              width={1600}
              height={900}
              priority
              className="block w-full h-auto select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Shop by State dropdown */}
        <StateSelector />
      </div>

      {/* Feature cards section */}
      <section className="mx-auto max-w-[95vw] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 py-20 md:grid-cols-2">
          {/* LEFT CARD — image on top */}
          <article className="overflow-hidden rounded-none bg-white">
            <div className="relative h-72 w-full">
              <Image
                src="/feature-desk.png"
                alt="Wholesale suppliers"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="p-7">
              <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
                Find Wholesale Suppliers in Florida
              </h3>
              <p className={`${hand.className} mt-4 text-base text-slate-700`}>
                The largest directory for truckload liquidation in the United States, featuring returns, overstock,
                general merchandise, and a wide variety of other categories.
              </p>
              <Link
                href="/suppliers?region=florida"
                className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-[10px] bg-[#2f6feb] px-4 py-2 text-white text-base shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80`}
              >
                Browse
              </Link>
            </div>
          </article>

          {/* RIGHT CARD — text top, image bottom */}
          <article className="overflow-hidden rounded-none bg-white flex flex-col">
            <div className="p-7">
              <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
                Find Liquidation Pallets Near You
              </h3>
              <p className={`${hand.className} mt-4 text-base text-slate-700`}>
                Buy wholesale clothing, shoes, and purses in bulk. Find mens, womens, and kids apparel for sale from
                suppliers near you.
              </p>
              <Link
                href="/suppliers"
                className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-[10px] bg-[#2f6feb] px-4 py-2 text-white text-base shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80`}
              >
                Browse
              </Link>
            </div>
            <div className="relative h-72 w-full">
              <Image
                src="/feature-family.png"
                alt="Family business"
                fill
                className="object-cover"
                priority
              />
            </div>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white text-center">
        <h2 className={`${hand.className} text-3xl text-slate-900 mb-8`}>FAQ</h2>
        <div className="mx-auto max-w-xl space-y-4">
          <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
              <div>
                <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                  How do I find suppliers in my state?
                </div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
              Use the "Shop by State" dropdown above to filter suppliers by location. You can also browse by region or search for specific cities. Each supplier profile shows their warehouse locations and service areas.
            </div>
          </details>

          <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
              <div>
                <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                  What types of products can I buy by location?
                </div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
              Suppliers offer a wide variety of liquidation merchandise including clothing, electronics, home goods, toys, and more. Each supplier profile lists their available categories and minimum order requirements. Filter by category to find specific product types in your area.
            </div>
          </details>

          <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
              <div>
                <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                  Do suppliers ship nationwide or only locally?
                </div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
              Shipping policies vary by supplier. Some offer nationwide shipping, while others prefer local pickup or have specific service areas. Check each supplier's profile for their logistics notes, which detail shipping options, freight costs, and pickup availability.
            </div>
          </details>

          <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
              <div>
                <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                  What's the minimum order quantity?
                </div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
              Minimum order requirements vary significantly by supplier. Some accept pallet orders (typically 500-1,500 units), while others require full truckloads. Each supplier profile displays their minimum order and lot size options. Contact suppliers directly for specific requirements.
            </div>
          </details>

          <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
              <div>
                <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                  How do I contact suppliers in my area?
                </div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
              Each supplier profile includes contact information including email, phone, and website. You can reach out directly through their listed contact methods. Many suppliers also have inquiry forms on their websites for bulk order requests.
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
