// Декоративная иллюстрация тарелки для главного экрана.
export function HeroPlate() {
  return (
    <svg viewBox="0 0 200 200" className="hero__art" role="img" aria-label="Иллюстрация сбалансированной тарелки">
      <defs>
        <radialGradient id="plate" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3ece0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="#fbf7f1" stroke="#e9e2d3" strokeWidth="2" />
      <circle cx="100" cy="100" r="78" fill="url(#plate)" stroke="#e9e2d3" strokeWidth="1" />
      {/* Овощи 1/2 */}
      <path d="M22 100 A78 78 0 0 1 178 100 Z" fill="#c7d4ad" opacity="0.95" />
      <circle cx="60" cy="78" r="6" fill="#a3b07a" />
      <circle cx="80" cy="68" r="5" fill="#7a8b5a" />
      <circle cx="115" cy="65" r="7" fill="#a3b07a" />
      <circle cx="140" cy="78" r="5" fill="#8a9c63" />
      <path d="M90 72 q6 -8 14 0" stroke="#5e6c43" strokeWidth="1.5" fill="none" />
      {/* Белок 1/4 */}
      <path d="M22 100 A78 78 0 0 0 100 178 L100 100 Z" fill="#f3dde2" />
      <ellipse cx="62" cy="138" rx="20" ry="12" fill="#c98b8b" />
      <ellipse cx="62" cy="135" rx="14" ry="7" fill="#c4677b" />
      {/* Гарнир 1/4 */}
      <path d="M178 100 A78 78 0 0 1 100 178 L100 100 Z" fill="#ecdfb6" />
      <circle cx="138" cy="138" r="5" fill="#d9b65d" />
      <circle cx="146" cy="148" r="4" fill="#c99e3a" />
      <circle cx="128" cy="148" r="4" fill="#c99e3a" />
      <circle cx="150" cy="130" r="4" fill="#d9b65d" />
      {/* Зелень */}
      <path d="M50 60 q10 -6 20 0" stroke="#5e6c43" strokeWidth="1.5" fill="none" />
      <path d="M120 50 q8 -4 16 2" stroke="#5e6c43" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
