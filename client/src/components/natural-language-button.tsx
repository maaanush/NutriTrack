import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import NaturalLanguageFoodEntry from "./natural-language-food-entry";
import { MessageSquareText } from "lucide-react";

interface NaturalLanguageButtonProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
}

export default function NaturalLanguageButton({ onAdd }: NaturalLanguageButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddFood = (items: { name: string; calories: number }[]) => {
    onAdd(items);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleOpen}
      >
        <MessageSquareText className="mr-2 h-4 w-4" />
        Describe Your Food
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Food Description</DialogTitle>
          </DialogHeader>
          <NaturalLanguageFoodEntry onAdd={handleAddFood} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}