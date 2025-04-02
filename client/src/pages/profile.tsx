import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  dailyCalorieGoal: z.coerce.number().min(100, "Minimum 100 calories").max(10000, "Maximum 10000 calories"),
  pushNotifications: z.boolean(),
  darkMode: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default form values
  const defaultValues: ProfileFormValues = {
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    pushNotifications: user?.pushNotifications === 1,
    darkMode: user?.darkMode === 1,
  };
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  
  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Convert boolean values to integers for the API
      await updateUser({
        dailyCalorieGoal: values.dailyCalorieGoal,
        pushNotifications: values.pushNotifications ? 1 : 0,
        darkMode: values.darkMode ? 1 : 0,
      });
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-4">
      {/* User profile */}
      <Card>
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl font-medium">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-medium text-lg">{user.username}</h2>
          </div>
        </CardContent>
      </Card>
      
      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-medium mb-4">Settings</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dailyCalorieGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Calorie Goal</FormLabel>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Daily calorie goal" 
                          {...field} 
                          className="rounded-r-none"
                        />
                      </FormControl>
                      <Button 
                        type="submit" 
                        className="rounded-l-none" 
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <FormLabel className="mb-0">Push Notifications</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Auto-save when switching
                          form.handleSubmit(handleSubmit)();
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <FormLabel className="mb-0">Dark Mode</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Auto-save when switching
                          form.handleSubmit(handleSubmit)();
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <Button 
              variant="outline" 
              className="w-full text-danger hover:text-danger hover:bg-danger/10 border-danger"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
