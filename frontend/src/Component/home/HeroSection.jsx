// import { Search } from "lucide-react";

// export default function HeroSection({
//   searchQuery,
//   setSearchQuery,
//   restaurants,
// }) {
//   return (
//     // <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white">
//     <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 text-white">
//       {/* Background pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div className="absolute top-10 right-20 text-9xl">🍕</div>
//         <div className="absolute bottom-5 right-60 text-7xl">🍔</div>
//         <div className="absolute top-20 left-10 text-6xl">🌮</div>
//         <div className="absolute bottom-10 left-40 text-8xl">🍜</div>
//       </div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
//         <div className="max-w-2xl">
//           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
//             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//             1000+ restaurants online
//           </div>
//           <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
//             Craving something? <br />
//             <span className="text-yellow-300">DineVerse has it.</span>
//           </h1>
//           <p className="text-lg text-white/80 mb-8">
//             Order fast delivery or instantly reserve a table at your favorite
//             spot.
//           </p>

//           <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
//             <div className="relative flex items-center gap-2 px-3 flex-1">
//               <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
//               <input
//                 type="text"
//                 placeholder="Search restaurants, dishes, cuisines..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full text-gray-900 placeholder-gray-400 outline-none text-sm font-medium bg-transparent"
//               />
//               {/* Search Suggestions Dropdown */}
//               {searchQuery && restaurants?.length > 0 && (
//                 <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
//                   {(() => {
//                     const suggestions = restaurants
//                       .filter((r) => {
//                         const cuisineMatch = Array.isArray(r.cuisine)
//                           ? r.cuisine.some((c) =>
//                               c
//                                 .toLowerCase()
//                                 .includes(searchQuery.toLowerCase()),
//                             )
//                           : typeof r.cuisine === "string" &&
//                             r.cuisine
//                               .toLowerCase()
//                               .includes(searchQuery.toLowerCase());
//                         return (
//                           r.name
//                             ?.toLowerCase()
//                             .includes(searchQuery.toLowerCase()) || cuisineMatch
//                         );
//                       })
//                       .slice(0, 5);

//                     if (suggestions.length === 0) {
//                       return (
//                         <div className="p-4 text-gray-500 text-sm">
//                           No venues found
//                         </div>
//                       );
//                     }

//                     {
//                       /* Inside HeroSection.jsx suggestions mapping */
//                     }
//                     return suggestions.map((r) => (
//                       <a
//                         key={r._id || r.id}
//                         /* 🛠️ FIX: Map to the exact layout route matching your other card selections */
//                         href={`/RestaurantDetail?id=${r._id || r.id}`}
//                         className="block px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-0 transition-colors"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                             <img
//                               src={
//                                 r.image ||
//                                 "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"
//                               }
//                               alt={r.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div>
//                             <div className="text-gray-900 font-bold text-sm">
//                               {r.name}
//                             </div>
//                             <div className="text-gray-500 text-xs">
//                               {Array.isArray(r.cuisine)
//                                 ? r.cuisine.join(", ")
//                                 : r.cuisine}
//                             </div>
//                           </div>
//                         </div>
//                       </a>
//                     ));
//                   })()}
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={() => {
//                 const el = document.getElementById("restaurant-list");
//                 if (el) el.scrollIntoView({ behavior: "smooth" });
//               }}
//               className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-300 flex-shrink-0"
//             >
//               Explore Now
//             </button>
//           </div>

//           <div className="flex gap-6 mt-8 text-sm font-medium text-white/80">
//             <div className="flex items-center gap-2">
//               <span className="text-yellow-300 font-bold text-xl">4.8★</span>
//               <span>Top Rated</span>
//             </div>
//             <div className="w-px bg-white/30" />
//             <div>⚡Express Delivery</div>
//             <div className="hidden sm:block w-px bg-white/30" />
//             <div className="hidden sm:block">🛡️ Verified Partners</div>
//           </div>
//         </div>
//       </div>

//       <div
//         className="h-8 bg-gray-50"
//         style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
//       />
//     </div>
//   );
// }

import { Search } from "lucide-react";

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  restaurants,
}) {
  return (
    // <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white">
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 text-9xl">🍕</div>
        <div className="absolute bottom-5 right-60 text-7xl">🍔</div>
        <div className="absolute top-20 left-10 text-6xl">🌮</div>
        <div className="absolute bottom-10 left-40 text-8xl">🍜</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            1000+ restaurants online
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            Craving something? <br />
            <span className="text-lime-200">DineVerse has it.</span>
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Order fast delivery or instantly reserve a table at your favorite
            spot.
          </p>

          <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
            <div className="relative flex items-center gap-2 px-3 flex-1">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, dishes, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-gray-900 placeholder-gray-400 outline-none text-sm font-medium bg-transparent"
              />
              {/* Search Suggestions Dropdown */}
              {searchQuery && restaurants?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {(() => {
                    const suggestions = restaurants
                      .filter((r) => {
                        const cuisineMatch = Array.isArray(r.cuisine)
                          ? r.cuisine.some((c) =>
                              c
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                            )
                          : typeof r.cuisine === "string" &&
                            r.cuisine
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                        return (
                          r.name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) || cuisineMatch
                        );
                      })
                      .slice(0, 5);

                    if (suggestions.length === 0) {
                      return (
                        <div className="p-4 text-gray-500 text-sm">
                          No venues found
                        </div>
                      );
                    }

                    {
                      /* Inside HeroSection.jsx suggestions mapping */
                    }
                    return suggestions.map((r) => (
                      <a
                        key={r._id || r.id}
                        /* 🛠️ FIX: Map to the exact layout route matching your other card selections */
                        href={`/RestaurantDetail?id=${r._id || r.id}`}
                        className="block px-4 py-3 hover:bg-emerald-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={
                                r.image ||
                                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"
                              }
                              alt={r.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-gray-900 font-bold text-sm">
                              {r.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {Array.isArray(r.cuisine)
                                ? r.cuisine.join(", ")
                                : r.cuisine}
                            </div>
                          </div>
                        </div>
                      </a>
                    ));
                  })()}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("restaurant-list");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-gradient-to-r  from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-300/40 flex-shrink-0"
            >
              Explore Now
            </button>
          </div>

          <div className="flex gap-6 mt-8 text-sm font-medium text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-lime-200 font-bold text-xl">4.8★</span>
              <span>Top Rated</span>
            </div>
            <div className="w-px bg-white/30" />
            <div>⚡Express Delivery</div>
            <div className="hidden sm:block w-px bg-white/30" />
            <div className="hidden sm:block">🛡️ Verified Partners</div>
          </div>
        </div>
      </div>

      <div
        className="h-8 bg-gray-50"
        style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
      />
    </div>
  );
}
