import Image from "next/image";
import Button from "./Button";
import { layout } from "@/lib/styles";
import type { Feature } from "@/types";

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
];

interface FeatureCardProps extends Feature {
  index: number;
}

function FeatureCard({ icon, title, content, index }: FeatureCardProps) {
  return (
    <div
      className={`glass rounded-3xl p-8 ${
        index !== features.length - 1 ? "mb-6" : "mb-0"
      } feature-card hover-lift animate-slide-up stagger-${index + 1}`}
    >
      <div className="flex flex-row items-start gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
          <Image
            src={icon}
            alt="icon"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <h4 className="font-poppins font-bold text-xl leading-tight mb-3 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            {title}
          </h4>
          <p className="font-sans font-normal text-base-content/80 text-base leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Business() {
  return (
    <section id="features" className={`${layout.section} px-6 sm:px-12`}>
      <div className={`${layout.sectionInfo} animate-slide-up`}>
        <h2 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 pl-0 sm:pl-10">
          You Study, <br className="sm:block hidden" />
          <span className="gradient-text">
            we&apos;ll handle the Distractions
          </span>{" "}
          😎
        </h2>
        <p className="font-sans text-lg text-base-content/70 max-w-[520px] leading-relaxed pl-0 sm:pl-10 mb-8">
          Welcome to EduTube, where YouTube meets focus. Experience a
          clutter-free environment designed for uninterrupted learning and
          enjoyment.
        </p>
        <Button styles="pl-0 sm:pl-10" />
      </div>
      <div className={`${layout.sectionImg} flex-col`}>
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}
