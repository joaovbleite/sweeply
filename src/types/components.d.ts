declare module '@/components/Navbar' {
  const Navbar: React.FC;
  export default Navbar;
}

declare module '@/components/Hero' {
  const Hero: React.FC;
  export default Hero;
}

declare module '@/components/HumanoidSection' {
  const HumanoidSection: React.FC;
  export default HumanoidSection;
}

declare module '@/components/SpecsSection' {
  const SpecsSection: React.FC;
  export default SpecsSection;
}

declare module '@/components/DetailsSection' {
  const DetailsSection: React.FC;
  export default DetailsSection;
}

declare module '@/components/ImageShowcaseSection' {
  const ImageShowcaseSection: React.FC;
  export default ImageShowcaseSection;
}

declare module '@/components/Features' {
  const Features: React.FC;
  export default Features;
}

declare module '@/components/Testimonials' {
  const Testimonials: React.FC;
  export default Testimonials;
}

declare module '@/components/Newsletter' {
  const Newsletter: React.FC;
  export default Newsletter;
}

declare module '@/components/MadeByHumans' {
  const MadeByHumans: React.FC;
  export default MadeByHumans;
}

declare module '@/components/Footer' {
  const Footer: React.FC;
  export default Footer;
}

declare module '@/contexts/AuthContext' {
  export const useAuth: () => {
    user: any;
    loading: boolean;
  };
}