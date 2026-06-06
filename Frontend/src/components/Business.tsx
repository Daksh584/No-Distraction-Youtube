import Image from "next/image";
import Button from "./Button";
import { layout } from "@/lib/styles";
import type { Feature } from "@/types";
import ScrollReveal from "./ScrollReveal";

const features: Feature[] = [
  {
    id: "feature-1",
    icon: "/assets/You-Tube-14.png",
    title: "Ad-free Viewing",
    content:
      "Enjoy YouTube videos without interruptions. Simplified and focused for maximum learning.",
  },
  {
    id: "feature-2",
    icon: "/assets/learning-concept-illustration_114360-6186-removebg.png",
    title: "Intelligent Assistance",
    content:
      "AI-powered chatbot for instant answers. Get insights and information without leaving the video.",
  },
  {
    id: "feature-3",
    icon: "/assets/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector-removebg-preview.png",
    title: "Personalized Learning",
    content:
      "AI tailors responses based on your preferences and previous interactions, offering personalized insights and recommendations for a more customized learning experience.",
  },
  {
    id: "feature-4",
    icon: "/assets/Designer-min-removebg-preview.png",
    title: "Seamless Notion Sync",
    content:
      "Take rich markdown notes right next to the video. Auto-saves directly to your Notion workspace so your knowledge is never lost.",
  },
];

interface FeatureCardProps extends Feature {
  index: number;
}

function FeatureCard({ icon, title, content, index }: FeatureCardProps) {
  return (
    <ScrollReveal animation="slide-left" delay={index * 150} className="w-full">
      <div className="group relative overflow-hidden rounded-[2rem] p-[1px] hover-lift animate-slide-up w-full">
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient-x" />
        
        <div className="relative bg-base-100/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 border border-base-content/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] group-hover:bg-base-100/80 transition-all duration-500">
          
          {/* Icon Container with glowing effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/30 blur-xl rounded-full group-hover:bg-primary-500/50 group-hover:scale-150 transition-all duration-500" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 flex-shrink-0 shadow-lg shadow-primary-500/10">
              <Image
                src={icon}
                alt="icon"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <h4 className="font-poppins font-bold text-xl sm:text-2xl leading-tight mb-2 sm:mb-3 text-base-content group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
              {title}
            </h4>
            <p className="font-sans font-medium text-base-content/60 text-sm sm:text-base leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function Business() {
  return (
    <section id="features" className="flex flex-col lg:flex-row py-12 sm:py-16 items-center gap-16 relative">
      
      {/* Subtle background glow for the whole section */}
      <div className="absolute top-1/2 left-0 w-full h-[60%] bg-gradient-to-r from-primary-500/5 to-secondary-500/5 blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="flex-1 flex flex-col justify-center items-start relative z-10 w-full text-center lg:text-left">
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="inline-block px-4 py-1.5 rounded-full bg-base-content/5 text-sm font-semibold text-primary-500 mb-6 border border-base-content/5 uppercase tracking-widest mx-auto lg:mx-0">
            Why EduTube?
          </div>
        </ScrollReveal>
        
        <ScrollReveal animation="fade-up" delay={100}>
          <h2 className="font-poppins font-extrabold text-4xl sm:text-5xl lg:text-[4rem] leading-[1.1] mb-6 drop-shadow-sm text-base-content mx-auto lg:mx-0">
            You Study, <br className="hidden lg:block" />
            <span className="inline-block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-500 to-accent-500 animate-gradient-x drop-shadow-md">
              we'll handle the distractions.
            </span>{" "}
            😎
          </h2>
        </ScrollReveal>
        
        <ScrollReveal animation="fade-up" delay={200}>
          <p className="font-sans text-lg sm:text-xl text-base-content/60 max-w-[600px] leading-relaxed mb-10 mx-auto lg:mx-0 font-medium">
            Welcome to EduTube, where YouTube meets deep focus. Experience a
            beautiful, clutter-free environment designed exclusively for uninterrupted learning.
          </p>
        </ScrollReveal>
        
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mx-auto lg:mx-0 transform hover:scale-105 transition-transform duration-300">
            <Button styles="" />
          </div>
        </ScrollReveal>
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full max-w-2xl relative z-10 mx-auto lg:mx-0">
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}
