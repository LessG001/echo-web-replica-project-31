
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { NavIcons, FileIcon as FileIconComponent } from "@/components/ui/icons";
import { FileText } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-5xl mx-auto">
          <div className="mb-4 inline-block">
            <div className="bg-primary/10 text-primary rounded-lg py-1 px-3 text-sm font-medium">
              Secure. Private. Reliable.
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8">
            Secure File Management System
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            Protect your sensitive files with enterprise-grade security while maintaining
            seamless access and sharing capabilities.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted} className="gap-2">
              Get Started
              <NavIcons.ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>
        
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={FileText}
              title="Secure File Storage"
              description="Safely store all your important documents with enterprise-grade security"
            />
            
            <FeatureCard 
              icon={NavIcons.Encrypted}
              title="Advanced Encryption"
              description="Files are encrypted both in transit and at rest for maximum protection"
            />
            
            <FeatureCard 
              icon={NavIcons.Shared}
              title="Controlled Sharing"
              description="Share files with granular permission controls and expiration dates"
            />
            
            <FeatureCard 
              icon={NavIcons.Recent}
              title="File Versioning"
              description="Keep track of changes with automatic version history"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
