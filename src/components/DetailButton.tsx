
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface DetailButtonProps {
  title: string;
  description: string;
  content: string;
}

const DetailButton: React.FC<DetailButtonProps> = ({ title, description, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="text-lg px-6 py-6 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-full"
        >
          Discover
        </Button>
      ) : (
        <Card className="w-[90vw] max-w-md animate-scale-up bg-black/80 backdrop-blur-lg text-white border border-white/20">
          <CardHeader className="relative">
            <Button 
              variant="ghost" 
              className="absolute right-2 top-2 text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </Button>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-gray-300">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{content}</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DetailButton;