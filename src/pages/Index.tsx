import React, { useState, useEffect, useCallback } from 'react';
import IntroAnimation from '@/components/IntroAnimation';
import HorizontalScroller from '@/components/HorizontalScroller';
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from 'lucide-react';
import DecryptedText from '@/components/DecryptedText'; // Re-added import
import { cn } from '@/lib/utils';

// Define a structure for sections
export interface SectionData {
  id: number;
  topVideoSrc: string;
  bottomVideoSrc: string;
  buttonTitle?: string;       // Title for the section, displayed at bottom-center
  // DetailButton related props (for non-final sections)
  discoverButtonText?: string; // Text for the main discover button
  discoverCardTitle?: string;
  discoverCardDescription?: string;
  discoverCardContent?: string;
  // Final experience specific props
  isFinalExperience?: boolean;
  finalExperienceVideoSrc?: string; // Video for the final discover card (optional)
  finalExperienceDiscoverButtonText?: string; // Text for the "Discover" button on the final page
  finalExperienceDetails?: {
    title: string;
    description: string;
    content: string; // Can include Markdown
  };
}

// Updated data based on your resume
const sectionsData: SectionData[] = [
  {
    id: 1,
    topVideoSrc: "/assets/1t.mp4", 
    bottomVideoSrc: "/assets/1b.mp4", 
    buttonTitle: "Chapter 1 : Journey through books",
    discoverButtonText: "Education", 
    discoverCardTitle: "Academic & Professional Credentials", 
    discoverCardDescription: "My educational background and key certifications.",
    discoverCardContent: `
### Education
* **M.Sc. Information Systems** - Northeastern University, Boston, MA (May 2023)
* **B.Tech. Mechanical Engineering (Spec. Automotive Technology)** - Vellore Institute of Technology, India (Jul 2018)

### Certifications
* LinkedIn - Generative AI (Artificial Intelligence) in Cloud Computing: Core Concepts
* Red Hat OpenShift I: Containers & Kubernetes (DO180)
* LinkedIn - Introduction to Large Language Models
* LinkedIn - Learning Docker
    `
  },
  {
    id: 2,
    topVideoSrc: "/assets/2t.mp4", 
    bottomVideoSrc: "/assets/2b.mp4", 
    buttonTitle: "Chapter 2 : Finding Space/Place",
    discoverButtonText: "Work Experiences",
    discoverCardTitle: "Professional Experience",
    discoverCardDescription: "Highlights from my roles at Dassault Systèmes and Huf Group.",
    discoverCardContent: `
### QA Software Engineer | Dassault Systèmes | Boston, MA (Aug 2022 – Dec 2023)
* Deployed 7+ automation scripts (Smoke, Exploratory, Sanity, Integration, Performance) in CI/CD pipelines using Python, TypeScript, and Shell for 3DS ENOVIA Cloud Service.
* Developed and presented a new QA automation POC, reducing script work time and achieving a 100% completion rate with performance metric tracking.
* Automated regression tests using Selenium WebDriver and TypeScript, decreasing testing time by 30%.
* Created ETL pipelines for QA test case data extraction, cleaning, and ingestion.
* Built script monitoring dashboards (JavaScript, PHP, SQL) to track performance metrics.
* Developed a version control POC for iOS systems using C#.
* Reduced user creation time by 67% by deploying Python Selenium automations in Jenkins.
* Participated in daily SCRUMs with global teams.

### Investment Sales Analyst | Huf Group | Pune, MH, India (Nov 2018 – Nov 2020)
* Secured $15M in contracts (Mahindra & Mahindra, Volvo, Vinfast) by collaborating on marketing strategy and identifying growth opportunities.
* Acquired $6.2M in contracts and increased market share by 18% through data forecasting, market research, and roadmap creation.
* Facilitated growth by executing market research analysis and developing an SQL database for stakeholders to optimize product pricing.
    `
  },
  {
    id: 3,
    topVideoSrc: "/assets/3t.mp4", 
    bottomVideoSrc: "/assets/3b.mp4", 
    buttonTitle: "Chapter 3 : My Expression",
    discoverButtonText: "My Tech Creations",
    discoverCardTitle: "Personal & AI Projects",
    discoverCardDescription: "A showcase of my creations and explorations in technology.",
    discoverCardContent: `
### FUJM - fujm.org (Creator)
* Launched a GenAI-powered job platform using the MERN stack (MongoDB, Express, React, Node.js), hosted on Netlify.
* Utilized Firebase RDMS, OAuth authentication, hooks, and analytics (Google's Startup Program).
* Integrated Groq's GenAI models with an Express backend to analyze user profiles (RAGs) and provide job match percentages.

### Chrome Store Extensions
* **AI Screen Reader:** Scans the active window and answers user questions using GPTs. (Search "AI Screen" on Chrome Store)

### Prompt Browsing & Automation
* **Prompt Automation POC:** Demonstrated "fill the form" and "book Airbnb for this Friday" using Speech-to-Text.
* **Universal Web Scrapper with Automation:** Performs DOM pre-operations along with AI for final results based on URL and DOM element inputs.

### Other Creations
* **Netflix Style Portfolio:** [portfolioenji.netlify.app](https://portfolioenji.netlify.app/)
* **Wall of Shade:** [wallofshade.netlify.app](https://wallofshade.netlify.app/)
    `
  },
  {
    id: 4,
    topVideoSrc: "/assets/4t.mp4", 
    bottomVideoSrc: "/assets/4b.mp4", 
    buttonTitle: "Chapter 4 : Bulding Blocks",
    discoverButtonText: "My Skills",
    discoverCardTitle: "Technical Skillset",
    discoverCardDescription: "My proficiency in various programming languages, frameworks, and tools.",
    discoverCardContent: `
### Programming Languages
* Python, SQL, JavaScript, TypeScript, HTML, CSS, Shell

### Frameworks & AI Agents
* React, Keras, Langchain, Openrouter, Amazon NOVA, FastAPI, Hugging Face Agents

### Tools
* Git, Jenkins, Docker, Terraform, Ansible, AWS (Amazon Web Services), GCP (Google Cloud Platform), Snowflake, Tableau, MS Office, Postman, Cursor
    `
  },
  {
    id: 5,
    topVideoSrc: "/assets/5.mp4", 
    bottomVideoSrc: "/assets/5.mp4", 
    isFinalExperience: true,
    buttonTitle: "Let's Connect", 
    finalExperienceVideoSrc: "/assets/final.mp4", 
    finalExperienceDiscoverButtonText: "Get in Touch", 
    finalExperienceDetails: {
      title: "Connect with Mohit",
      description: "Reach out for collaborations, opportunities, or a friendly chat.",
      content: `
* **Email:** [mohit.snegi123@gmail.com](mailto:mohit.snegi123@gmail.com)
* **LinkedIn:** [linkedin.com/in/mohit-singh-negi](https://www.linkedin.com/in/mohit-singh-negi/) 
* **GitHub:** [github.com/Negi97Mohit](https://github.com/Negi97Mohit) 
* **Portfolio:** [portfolioenji.netlify.app](https://portfolioenji.netlify.app/)
* **Creations (FUJM):** [fujm.org](https://fujm.org)
      `
    }
  }
];

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentScrollerSection, setCurrentScrollerSection] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [introKey, setIntroKey] = useState(0); 

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setShowContent(true);
  }, []);

  const handleGoToBeginning = () => {
    setShowContent(false); 
    setCurrentScrollerSection(0); 
    setIntroKey(prevKey => prevKey + 1); 
    setShowIntro(true); 
  };

  const handleScrollerSectionChange = useCallback((index: number) => {
    setCurrentScrollerSection(index);
  }, []);

  const currentSectionTitle = sectionsData[currentScrollerSection]?.buttonTitle || "";
  // Key for DecryptedText to force re-animation when title changes
  const titleAnimationKey = `title-decrypt-${currentScrollerSection}`;


  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {showIntro && <IntroAnimation key={introKey} onComplete={handleIntroComplete} />}

      {showContent && !showIntro && ( 
        <HorizontalScroller
          sections={sectionsData}
          initialSectionIndex={currentScrollerSection}
          onSectionChange={handleScrollerSectionChange}
          playbackRate={playbackSpeed}
        />
      )}

      {showContent && !showIntro && ( 
        <>
          {/* Current Section Title - Bottom Center */}
          {currentSectionTitle && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              {/* Using DecryptedText for the title */}
              <DecryptedText
                key={titleAnimationKey}
                text={currentSectionTitle}
                animateOn="view"
                speed={60}
                maxIterations={10}
                sequential={true}
                revealDirection="center"
                parentClassName={cn(
                  "text-md sm:text-2xl font-mono text-black bg-white/50 px-6 py-2.5 rounded-full shadow-xl backdrop-blur-md",
                  "animate-title-scale-up" // MODIFIED: Use the new scale-up animation class
                )}
                className=""
                encryptedClassName="opacity-70 text-black"
              />
            </div>
          )}

          {/* Controls: Restart and Speed - Bottom Left */}
          <div className="fixed bottom-6 left-6 z-50 flex items-center space-x-3 animate-fade-in">
            <Button
              onClick={handleGoToBeginning}
              variant="outline"
              size="icon"
              className="bg-black/40 hover:bg-black/60 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
              aria-label="Restart Experience"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-1 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg border border-white/25 shadow-md">
              <Zap className="h-4 w-4 text-white/80 ml-1" />
              {[0.5, 1, 1.5, 2].map(speed => (
                <Button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-150 ease-in-out text-xs px-2.5 py-1 rounded-md
                    ${playbackSpeed === speed
                      ? 'bg-white/90 text-black'
                      : 'text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
