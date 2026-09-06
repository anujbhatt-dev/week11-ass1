import { useSelector } from "react-redux";
import { Input } from "./ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { useDispatch } from "react-redux";
import { toggle, refreshMeetings } from "@/store/slices/addMeetingSlice";
import { Controller, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { useUser } from "@clerk/react";
import axios from "axios";
import { useState } from "react";

export default function AddMeeting() {
  const { isVisible } = useSelector((state) => state.addMeeting);
  const { isLoaded, isSignedIn, user } = useUser();
  const { register, handleSubmit, control, reset } = useForm();
  const [creating, setCreating] = useState(false);
  const dispatch = useDispatch();

  if (!isVisible) return null;

  const submitHandler = (data) => {
    const createMeeting = async () => {
      try {
        setCreating(true);
        await axios.post(`${import.meta.env.VITE_FIREBASE_URI}/meeting.json`, {
          ...data,
          createdBy: (isLoaded && isSignedIn && user.username) || "",
        });
      } catch (error) {
        console.log(error);
      } finally {
        setCreating(false);
        reset();
        dispatch(toggle());
        dispatch(refreshMeetings());
      }
    };
    createMeeting();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div
        onClick={() => dispatch(toggle())}
        className="h-full w-full bg-black/70 backdrop-blur-xs absolute"
      />
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="h-[60vh] w-xl bg-neutral-100 z-10 rounded-lg flex flex-col p-10 overflow-y-auto"
      >
        <FieldSet>
          <FieldLegend>Add Meeting</FieldLegend>
          <FieldDescription>
            Schedule a new meeting and mark it as important if needed.
          </FieldDescription>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                {...register("title")}
                id="title"
                autoComplete="off"
                placeholder="Team sync"
              />
              <FieldDescription>
                Give your meeting a short, clear title.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="datetime">Date &amp; Time</FieldLabel>
              <Input id="datetime" type="datetime-local" {...register("datetime")} />
              <FieldError>Please select a valid date and time.</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Controller
                name="isImportant"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    id="isImportant"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor="isImportant">Mark as important</FieldLabel>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Add Meeting"}
          </Button>
        </FieldSet>
      </form>
    </div>
  );
}