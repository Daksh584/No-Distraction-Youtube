interface ButtonProps {
  styles?: string;
}

export default function Button({ styles }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`py-4 px-8 gradient-primary font-poppins font-semibold text-[18px] text-white outline-none ${styles} rounded-xl hover-scale hover-glow shadow-lg transition-all duration-300 border-0`}
    >
      Get Started
    </button>
  );
}
