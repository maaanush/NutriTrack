import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import NaturalLanguageFoodEntry from "./natural-language-food-entry";

interface NaturalLanguageButtonProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
}

export default function NaturalLanguageButton({ onAdd }: NaturalLanguageButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleAdd = (items: { name: string; calories: number }[]) => {
    onAdd(items);
    setShowDialog(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 mt-2 w-full"
      >
        <MessageSquareText className="h-4 w-4" />
        <span>Enter Food in Natural Language</span>
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <NaturalLanguageFoodEntry 
              onAdd={handleAdd} 
              onClose={() => setShowDialog(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}