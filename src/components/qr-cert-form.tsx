"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Award, BookOpen, Calendar, Contact, Loader2, Send, User, Building, FileText, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import type { FormValues } from "@/lib/types";

const formSchema = z
  .object({
    idNumber: z.string().min(2, "ID Number must be at least 2 characters."),
    traineeName: z.string().min(2, "Name must be at least 2 characters."),
    courseName: z.string().min(3, "Course name must be at least 3 characters."),
    supplementName: z.string().optional(),
    completionDate: z.date({
      required_error: "A completion date is required.",
    }),
    expirationDate: z.date().optional(),
    trainingProvider: z.string().min(2, "Training provider is required."),
    telephone: z
      .string()
      .optional()
      .refine((val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), "Invalid phone number format."),
    instructorName: z.string().min(2, "Instructor name is required."),
  })
  .refine((data) => !data.expirationDate || data.expirationDate > data.completionDate, {
    message: "Expiration date must be after completion date.",
    path: ["expirationDate"],
  });

interface QrCertFormProps {
  onGenerate: (data: FormValues) => void;
  isGenerating: boolean;
}

export function QrCertForm({ onGenerate, isGenerating }: QrCertFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      traineeName: "",
      courseName: "",
      supplementName: "",
      telephone: "",
      instructorName: "",
      trainingProvider: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onGenerate(values);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Award className="text-primary" />
          Certificate Details
        </CardTitle>
        <CardDescription>Enter the information to be included on the certificate.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash size={16} />
                    ID Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter trainee ID number" {...field} />
                  </FormControl>
                  <FormDescription>Trainee's identification number (will be displayed on the certificate)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="traineeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User size={16} />
                    Trainee Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Course Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Drilling Operations, Supervisor, Surface" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplementName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText size={16} />
                    Supplement Name <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank if no supplement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar size={16} />
                      Completion Date
                    </FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar size={16} />
                      Expiration Date
                    </FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={(date) => (form.getValues("completionDate") ? date < form.getValues("completionDate") : false)}
                    />
                    <FormDescription>Optional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="trainingProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building size={16} />
                    Training Provider
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Eagle Well Control" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Contact size={16} />
                    Telephone Number
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormDescription>Optional contact number.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User size={16} />
                    Instructor Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isGenerating} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Generate Certificate
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
