"use client";

import React, { useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { UserContext } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface ContactAttemptFormProps {
  patientId: number;
  clinicId: number;
  careManagerId: number;
  onClose: () => void;
  onSuccess: () => void;
  patientName: string;
  mrn: string;
  clinicName: string;
}

const schema = yup.object().shape({
  attemptDate: yup.date().required("Attempt date is required"),
  minutes: yup
    .number()
    .positive("Minutes must be positive")
    .integer("Minutes must be an integer")
    .required("Minutes spent is required"),
  interactionMode: yup
    .string()
    .oneOf(["by_phone", "by_video", "in_clinic"], "Invalid interaction mode")
    .required("Interaction mode is required"),
  notes: yup.string().optional(),
});

export default function ContactAttemptForm({
  patientId,
  clinicId,
  careManagerId,
  onClose,
  onSuccess,
  patientName,
  mrn,
  clinicName,
}: ContactAttemptFormProps) {
  const user = useContext(UserContext);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      attemptDate: new Date(),
      minutes: 0,
      interactionMode: "",
      notes: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user || !user.id) {
      setFormMessage({ type: "error", text: "User information is missing. Please log in again." });
      return;
    }

    const formattedData = {
      patientId,
      userId: user.id,
      attemptDate: format(data.attemptDate, "yyyy-MM-dd"),
      minutes: data.minutes,
      interactionMode: data.interactionMode,
      notes: data.notes || "Contact attempt made",
    };

    try {
      const response = await fetch("http://localhost:4353/api/contact-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setFormMessage({ type: "success", text: "Contact attempt recorded successfully." });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setFormMessage({ type: "error", text: `Failed to record contact attempt: ${errorData.error}` });
      }
    } catch (error) {
      console.error("Error submitting contact attempt:", error);
      setFormMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <div className="p-4">
      {/* Patient Information Header */}
      <div className="mb-6 text-sm text-gray-700">
        <p>
          <strong>Patient:</strong> {patientName} <strong className="ml-4">MRN:</strong> {mrn}{" "}
          <strong className="ml-4">Clinic:</strong> {clinicName}
        </p>
      </div>

      {/* Form Message */}
      {formMessage && (
        <div
          className={`mb-4 p-3 rounded ${
            formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {formMessage.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date of Attempt */}
        <div>
          <Label htmlFor="attemptDate" className="block mb-1 text-sm font-medium text-gray-700">
            Date of Attempt:
          </Label>
          <Controller
            name="attemptDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date: Date) => field.onChange(date)}
                className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxDate={new Date()}
                dateFormat="MM/dd/yyyy"
              />
            )}
          />
          {errors.attemptDate && <p className="text-red-500 text-xs mt-1">{errors.attemptDate.message}</p>}
        </div>

        {/* Interaction Mode */}
        <div>
          <Label htmlFor="interactionMode" className="block mb-1 text-sm font-medium text-gray-700">
            Interaction Mode:
          </Label>
          <Controller
            name="interactionMode"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full p-2 text-sm border rounded-md">
                  <SelectValue placeholder="Select interaction mode" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="by_phone">By Phone</SelectItem>
                  <SelectItem value="by_video">By Video</SelectItem>
                  <SelectItem value="in_clinic">In Clinic</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.interactionMode && (
            <p className="text-red-500 text-xs mt-1">{errors.interactionMode.message}</p>
          )}
        </div>

        {/* Minutes Spent */}
        <div>
          <Label htmlFor="minutes" className="block mb-1 text-sm font-medium text-gray-700">
            Minutes Spent:
          </Label>
          <div className="flex items-center">
            <Input
              id="minutes"
              type="number"
              {...register("minutes", { valueAsNumber: true })}
              className="w-24 p-2 text-sm border rounded-md"
              min="0"
            />
            <span className="ml-2 text-sm text-gray-700">minutes</span>
          </div>
          {errors.minutes && <p className="text-red-500 text-xs mt-1">{errors.minutes.message}</p>}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
            Notes (Optional):
          </Label>
          <Input
            id="notes"
            {...register("notes")}
            className="w-full p-2 text-sm border rounded-md"
            placeholder="e.g., Left voicemail, patient unavailable"
          />
          {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 text-sm border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}