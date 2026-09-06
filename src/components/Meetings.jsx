import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@clerk/react";
import axios from "axios";
import { Button } from "./ui/button";
import { toggle } from "@/store/slices/addMeetingSlice";

export default function Meetings() {
  const dispatch = useDispatch();
  const { isVisible, refreshTrigger } = useSelector((state) => state.addMeeting);
  const { isLoaded, isSignedIn, user } = useUser();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${import.meta.env.VITE_FIREBASE_URI}/meeting.json`
      );
      const data = res.data
        ? Object.entries(res.data).map(([id, value]) => ({ id, ...value }))
        : [];

      const filtered =
        isLoaded && isSignedIn
          ? data.filter((m) => m.createdBy === user.username)
          : [];

      filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      setMeetings(filtered);
    } catch (err) {
      console.log(err);
      setError("Couldn't load meetings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMeetings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMeetings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, refreshTrigger]);

  if (!isLoaded || loading) {
    return (
      <div className="h-[60vh] w-4xl rounded-xl bg-neutral-100 text-neutral-900 flex flex-col gap-4 justify-center items-center mx-auto mt-10">
        <p className="text-sm text-neutral-500">Loading meetings...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-[60vh] w-4xl rounded-xl bg-neutral-100 text-neutral-900 flex flex-col gap-4 justify-center items-center mx-auto mt-10">
        <p>Sign in to view your meetings</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] w-4xl rounded-xl bg-neutral-100 text-neutral-900 flex flex-col gap-4 justify-center items-center mx-auto mt-10">
        <p className="text-sm text-red-500">{error}</p>
        <Button onClick={fetchMeetings} className="text-xs p-4 uppercase">
          Retry
        </Button>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="h-[60vh] w-4xl rounded-xl bg-neutral-100 text-neutral-900 flex flex-col gap-4 justify-center items-center mx-auto mt-10">
        <p>There are no meetings yet</p>
        <Button
          onClick={() => dispatch(toggle())}
          className="text-xs p-4 uppercase"
        >
          Add meeting
        </Button>
      </div>
    );
  }

  return (
    <div className="w-4xl rounded-xl bg-neutral-100 text-neutral-900 mx-auto mt-10 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Meetings</h2>
        <Button
          onClick={() => dispatch(toggle())}
          className="text-xs p-4 uppercase"
        >
          Add meeting
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{meeting.title}</p>
                {meeting.isImportant && (
                  <span className="text-[10px] uppercase tracking-wide bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    Important
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                {meeting.datetime
                  ? new Date(meeting.datetime).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "No date set"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}