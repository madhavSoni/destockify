import Link from 'next/link';
import Image from 'next/image';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function LocationsPage() {
  const STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA',
    'MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI',
    'SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY',
  ];

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
        <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-sm">
          <div className="relative">
            <select
              name="state"
              defaultValue=""
              className={`${hand.className} h-11 w-full appearance-none rounded-[14px] border-2 border-slate-900/80 bg-white px-4 pr-10 text-base text-slate-900 shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] focus:outline-none`}
            >
              <option value="" disabled>Shop by State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">▾</span>
          </div>
        </form>
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
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[12px] border-2 border-slate-900/80 bg-white py-3 px-4 text-left shadow-[3px_4px_0_0_rgba(2,6,23,0.85)]"
            >
              <p className={`${hand.className} text-base text-slate-800`}>
                Question {i} — placeholder text
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
