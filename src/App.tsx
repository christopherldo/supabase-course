import { useEffect, useState } from "react";
import "./App.css";

import { TaskManager } from "./components/TaskManager";
import { Auth } from "./components/auth";
import supabase from "./lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {session ? (
        <>
          <button onClick={logout}>Log Out</button>
          <TaskManager userId={session.user.id}/>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;
