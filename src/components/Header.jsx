import { useEffect, useState } from 'react';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react'
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { toggle, refreshMeetings } from '@/store/slices/addMeetingSlice';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser();
  const dispatch = useDispatch();
  const { isVisible, refreshTrigger } = useSelector((state) => state.addMeeting);

  const [importantMeetings, setImportantMeetings] = useState([]);
  const [loadingImportant, setLoadingImportant] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchImportantMeetings = async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      setLoadingImportant(true);
      const res = await axios.get(
        `${import.meta.env.VITE_FIREBASE_URI}/meeting.json`
      );
      const data = res.data
        ? Object.entries(res.data).map(([id, value]) => ({ id, ...value }))
        : [];

      const filtered = data.filter(
        (m) => m.createdBy === user.username && m.isImportant
      );

      filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      setImportantMeetings(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingImportant(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImportantMeetings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImportantMeetings();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, refreshTrigger]);

  const unmarkImportant = async (id) => {
    try {
      setUpdatingId(id);
      await axios.patch(
        `${import.meta.env.VITE_FIREBASE_URI}/meeting/${id}.json`,
        { isImportant: false }
      );
      setImportantMeetings((prev) => prev.filter((m) => m.id !== id));
      dispatch(refreshMeetings());
    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <header className="py-2 px-30 border-b border-neutral-200">
      <div className="flex justify-between items-center">
        <div className="font-bold text-blue-600 text-2xl tracking-wide">
          Meeting
        </div>

        <Show when="signed-out">
          <div className="flex gap-4 text-xs font-medium">
            <SignInButton className="text-green-900 bg-green-200 px-4 py-2 rounded-lg border border-transparent transition cursor-pointer hover:scale-105 uppercase" />
            <SignUpButton className="text-green-900 border border-green-900 px-4 py-2 rounded-lg transition cursor-pointer hover:scale-105 uppercase" />
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex gap-2 items-center">
            <Button onClick={() => dispatch(toggle())} className="text-xs p-4 uppercase">
              Add meeting
            </Button>

            <DropdownMenu onOpenChange={(open) => open && fetchImportantMeetings()}>
              <DropdownMenuTrigger
                render={
                  <Button className="text-xs p-4 uppercase bg-red-600 hover:bg-red-400 text-white">
                    Important
                  </Button>
                }
              />
              <DropdownMenuContent className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Important Meetings</DropdownMenuLabel>

                  {loadingImportant && (
                    <div className="px-2 py-1.5 text-xs text-neutral-500">
                      Loading...
                    </div>
                  )}

                  {!loadingImportant && importantMeetings.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-neutral-500">
                      No important meetings
                    </div>
                  )}

                  {!loadingImportant &&
                    importantMeetings.map((meeting) => (
                      <DropdownMenuItem
                        key={meeting.id}
                        closeOnClick={false}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm truncate">{meeting.title}</span>
                          <span className="text-[10px] text-neutral-500">
                            {meeting.datetime
                              ? new Date(meeting.datetime).toLocaleString(undefined, {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : ''}
                          </span>
                        </div>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={updatingId === meeting.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            unmarkImportant(meeting.id);
                          }}
                        >
                          {updatingId === meeting.id ? '...' : 'Unmark'}
                        </Button>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex gap-2 items-center">
            <p className="text-xs">
              welcome, <strong className="text-blue-600">@{isLoaded && isSignedIn && user.username}</strong>
            </p>
            <UserButton />
          </div>
        </Show>
      </div>
    </header>
  );
}