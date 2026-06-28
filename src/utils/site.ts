export const SITE = {
  name: 'itsjath',
  title: 'Jathniel Ahonsi',
  description:
    'Backend and full-stack engineer building production systems across software, products, and creative experiences.',
  url: 'https://itsjath.com',
  email: 'jatahonsi@gmail.com',
  location: 'Fort Wayne, IN',
  linkedin: 'https://linkedin.com/in/jathniel-ahonsi',
  github: 'https://github.com/Roblemm',
  forestly: 'https://forestlygames.com',
} as const;

export const EDUCATION = {
  school: 'Purdue University',
  degrees: 'B.S. Computer Science & B.S. Business Analytics and Information Management',
  graduation: 'Expected May 2028',
  gpa: '3.92',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/resume.pdf', label: 'Resume' },
  { href: '/contact/', label: 'Contact' },
] as const;
