import React from 'react'
import Button from './Button.jsx'
import styles, { layout } from './style.js';


export const features = [
  {
    id: "feature-1",
    icon : "src/assets/You-Tube-14.png",
    title: "Ad-free Viewing",
    content:
      "Enjoy YouTube videos without interruptions , Simplified and focused for maximum learning.",
  },
  {
    id: "feature-2",
    icon : "/src/assets/learning-concept-illustration_114360-6186-removebg.png",
    title: "Intelligent Assistance ",
    content:
      "AI-powered chatbot for instant answers ,Get insights and information without leaving the video.",
  },
  {
    id: "feature-3",
    icon : "src/assets/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector-removebg-preview.png",
    title: "Personalized Learning",
    content:
      "AI tailors responses based on your preferences and previous interactions, offering personalized insights and recommendations for a more customized learning experience.",
  },
];

const FeatureCard = ({ icon, title, content, index }) => (
  <div className={`flex flex-row p-6 rounded-[20px] ${index !== features.length - 1 ? 'mb-6' : 'mb-0'} feature-card`}>
    <div className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}>
      <embed
        src={icon}
        alt='icon'
        className='w-[50%] h-[50%] object-contain'
      />
    </div>
    <div className='flex-1 flex flex-col ml-3'>
      <h4 className='font-poppins font-semibold text-white text-[18px] leading-[23px] mb-1'  style = {{ color: 'inherit' }}>
        {title}
      </h4>
      <p className='font-poppins font-normal text-dimWhite text-[16px] leading-[24px]'>
        {content}
      </p>
    </div>
  </div>
)

const Business = () => {
  return (
    <section id='features' className={layout.section}>
      <div className={layout.sectionInfo}>
      <h2 className={`text-blue-900 ${styles.heading2}`} style={{ color: 'inherit' }}>
      You Study, <br className='sm:block hidden'/> we'll handle the Distractions 😎
    </h2>        
    <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
    Welcome to EduTube, where YouTube meets focus. Experience a clutter-free environment designed for uninterrupted learning and enjoyment.
        </p>
        <Button styles='mt-10'/>
      </div>
      <div className={`${layout.sectionImg} flex-col`}  >
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index}/>
        ))}
      </div>
    </section>
  )
}

export default Business
