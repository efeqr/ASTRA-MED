/**
 * ASTRA-MED Vektör İkon ve Görsel Kütüphanesi (Mat ve Klinik Renk Paleti)
 */

window.ASTRA_ICONS = (function () {
  const ICONS = {
    logo: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="#222730" stroke="#3b4352" stroke-width="1.5"/>
      <path d="M18 8L22 18L18 16L14 18L18 8Z" fill="#e8ecf1"/>
      <path d="M9 24C13 20 23 20 27 24" stroke="#6c95bd" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="18" r="2.5" fill="#6c95bd"/>
    </svg>`,

    "cdr-kaya": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="10" fill="#222730" stroke="#3b4352" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="20" fill="#29313d" stroke="#5b82a6" stroke-width="1.6"/>
      <path d="M16 52C18 44 24 40 32 40C40 40 46 44 48 52" fill="#d0d7e2"/>
      <rect x="20" y="19" width="24" height="16" rx="8" fill="#15181e" stroke="#85a6c4" stroke-width="1.5"/>
      <path d="M24 23C27 21.5 31 21.5 34 22.5" stroke="#85a6c4" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    "plt-vance": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="10" fill="#222730" stroke="#3b4352" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="20" fill="#28303b" stroke="#6c8ead" stroke-width="1.6"/>
      <path d="M16 52C18 44 24 40 32 40C40 40 46 44 48 52" fill="#c2cad6"/>
      <rect x="20" y="19" width="24" height="16" rx="8" fill="#15181e" stroke="#8ea9c4" stroke-width="1.5"/>
      <path d="M24 23C27 21.5 31 21.5 34 22.5" stroke="#8ea9c4" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    "ms-sato": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="10" fill="#222730" stroke="#3b4352" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="20" fill="#24302d" stroke="#569478" stroke-width="1.6"/>
      <path d="M16 52C18 44 24 40 32 40C40 40 46 44 48 52" fill="#d0d7e2"/>
      <rect x="20" y="19" width="24" height="16" rx="8" fill="#15181e" stroke="#7ab398" stroke-width="1.5"/>
      <path d="M24 23C27 21.5 31 21.5 34 22.5" stroke="#7ab398" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    bp: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <circle cx="20" cy="18" r="8" stroke="#6c95bd" stroke-width="2"/>
      <path d="M20 18L24 14" stroke="#c26b6b" stroke-width="2" stroke-linecap="round"/>
      <path d="M13 29H27" stroke="#6c95bd" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="18" r="2" fill="#6c95bd"/>
    </svg>`,

    heartRate: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <path d="M9 21H14.5L17.5 14L22 27L25 19H31" stroke="#c96969" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    glucose: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <path d="M20 10C20 10 13 18.5 13 23.5C13 27.6 16.1 31 20 31C23.9 31 27 27.6 27 23.5C27 18.5 20 10 20 10Z" fill="rgba(194,142,56,0.16)" stroke="#c28e38" stroke-width="2"/>
      <path d="M17.5 23.5H22.5M20 21V26" stroke="#c28e38" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

    temperature: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <path d="M17.5 11.5C17.5 10.1 18.6 9 20 9C21.4 9 22.5 10.1 22.5 11.5V22C24.1 23 25 24.8 25 26.8C25 29.7 22.8 32 20 32C17.2 32 15 29.7 15 26.8C15 24.8 15.9 23 17.5 22V11.5Z" stroke="#c47d4e" stroke-width="2"/>
      <circle cx="20" cy="26.8" r="2.5" fill="#c47d4e"/>
      <path d="M20 15V24.5" stroke="#c47d4e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    sleepHours: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <path d="M25 26C19.5 26 15 21.5 15 16C15 13.9 15.7 12 16.8 10.4C12.5 11.5 9.5 15.4 9.5 20.1C9.5 25.6 14 30.1 19.5 30.1C24.2 30.1 28.1 27 29.2 22.8C27.9 24.7 25.9 26 25 26Z" fill="rgba(128,118,176,0.18)" stroke="#8c82ba" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,

    moodScore: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#222730" stroke="#333b48"/>
      <circle cx="20" cy="20" r="10" stroke="#589e7d" stroke-width="2"/>
      <path d="M16 22.2C17.2 24 18.5 24.8 20 24.8C21.5 24.8 22.8 24 24 22.2" stroke="#589e7d" stroke-width="2" stroke-linecap="round"/>
      <circle cx="16.8" cy="17.2" r="1.4" fill="#589e7d"/>
      <circle cx="23.2" cy="17.2" r="1.4" fill="#589e7d"/>
    </svg>`,

    head_sans: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <path d="M6 18C9 12.2 13.2 10 18 10C22.8 10 27 12.2 30 18C27 23.8 22.8 26 18 26C13.2 26 9 23.8 6 18Z" stroke="#6c95bd" stroke-width="1.8"/>
      <circle cx="18" cy="18" r="4" fill="rgba(108,149,189,0.25)" stroke="#6c95bd" stroke-width="1.8"/>
    </svg>`,

    brain_cns: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <path d="M18 9.5C13.8 9.5 10.5 12.2 10.5 16.5C10.5 21.2 13.2 25.5 18 26.5C22.8 25.5 25.5 21.2 25.5 16.5C25.5 12.2 22.2 9.5 18 9.5Z" stroke="#8c82ba" stroke-width="1.8"/>
      <path d="M18 9.5V26.5M13.5 15H22.5M12.5 20H23.5" stroke="#8c82ba" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    cardiovascular: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <path d="M18 27C18 27 9 21 9 14.8C9 11.8 11.4 9.5 14.2 9.5C16 9.5 17.3 10.4 18 11.8C18.7 10.4 20 9.5 21.8 9.5C24.6 9.5 27 11.8 27 14.8C27 21 18 27 18 27Z" fill="rgba(201,105,105,0.2)" stroke="#c96969" stroke-width="1.8"/>
    </svg>`,

    metabolic_endocrine: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <polygon points="18,8 26,13 26,23 18,28 10,23 10,13" stroke="#c28e38" stroke-width="1.8" fill="rgba(194,142,56,0.14)"/>
      <circle cx="18" cy="18" r="2.8" fill="#c28e38"/>
    </svg>`,

    renal_immune: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <path d="M18 8L26 11.5V18C26 23 22.5 26.8 18 28.5C13.5 26.8 10 23 10 18V11.5L18 8Z" fill="rgba(88,158,125,0.16)" stroke="#589e7d" stroke-width="1.8"/>
      <path d="M14.8 18L17 20.2L21.5 15.8" stroke="#589e7d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    musculoskeletal: `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="6" fill="#222730" stroke="#333b48"/>
      <path d="M12.5 10.5C11.2 10.5 10.3 11.6 10.8 12.9L14.5 18L10.8 23.1C10.3 24.4 11.2 25.5 12.5 25.5H23.5C24.8 25.5 25.7 24.4 25.2 23.1L21.5 18L25.2 12.9C25.7 11.6 24.8 10.5 23.5 10.5H12.5Z" stroke="#9aa4b2" stroke-width="1.8"/>
    </svg>`,

    tabDashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    tabBody: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M6 11h12M12 8v8M9 22l3-6 3 6"/></svg>`,
    tabCharts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 4 3 5-7"/></svg>`,
    tabGuide: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    tabTasks: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,

    checkCircle: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#589e7d" stroke-width="2"><circle cx="12" cy="12" r="10" fill="rgba(88,158,125,0.14)"/><path d="M8 12.5l2.8 2.8L16.5 9.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    badgeMedal: `<svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="15" r="9.5" fill="rgba(194,142,56,0.15)" stroke="#c28e38" stroke-width="1.8"/><path d="M13.5 23.5L11.5 32L18 28.8L24.5 32L22.5 23.5" stroke="#c28e38" stroke-width="1.8" stroke-linejoin="round"/><circle cx="18" cy="15" r="3.5" fill="#c28e38"/></svg>`
  };

  function get(name) {
    return ICONS[name] || ICONS.logo;
  }

  return { get };
})();
